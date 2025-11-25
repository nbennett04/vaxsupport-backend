require('dotenv').config();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Models = require('../models/Models');
const axios = require('axios');
const { buildInputFromHistory } = require("../helpers/buildInputFromHistory");


// import { OpenAI } from "openai";
// const { OpenAI } = require('openai');  // <-- remove this
// Also prefer this OpenAI import for CommonJS:
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Start a new conversation
exports.startConversation = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.session.user.id;

        const conversation = new Conversation({ user: userId, title, messages: [] });
        await conversation.save();

        res.status(201)
            .json(conversation);
    } catch (error) {
        res.status(500)
            .json({ message: 'Server error' });
    }
};

// Send a message (to new or existing conversation)
async function getActiveModelKey() {
    let model = "gpt-5"; // fallback
    try {
        const active = await Models.findOne({ active: true }, { key: 1 }).sort({ updatedAt: -1 }).lean();
        if (active?.key) model = active.key;
        await client.models.retrieve(model); // sanity check
    } catch {
        // fallback stays as "gpt-5"
        model = "gpt-5"
    }
    return model;
}



// Get all conversations for a user
// Send a message (to new or existing conversation) — SSE streaming
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        if (!text) return res.status(400).json({ message: "Text is required" });

        const userId = req.session.user?.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Load or create conversation
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, user: userId });
            if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        } else {
            const title = (text || "New Chat").slice(0, 60);
            conversation = new Conversation({ user: userId, title, messages: [] });
            await conversation.save();
        }

        const convId = conversation._id;

        // Save user's message immediately
        const userMessage = new Message({ conversationId: convId, sender: "user", text });
        await userMessage.save();
        conversation.messages.push(userMessage._id);
        await conversation.save();

        // --- SSE headers (very important) ---
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            // If front/back are on different origins, keep these. Same-origin is fine too.
            "Access-Control-Allow-Origin": req.headers.origin || "*",
            "Access-Control-Allow-Credentials": "true",
            // For Nginx to avoid buffering
            "X-Accel-Buffering": "no",
        });
        if (res.flushHeaders) res.flushHeaders();

        // Stop if client disconnects
        let closed = false;
        res.on("close", () => {
            closed = true;
            try { res.end(); } catch { }
        });

        systemPromptObj = {
            systemPrompt: `You are Finetune Advisor, a precise, client-friendly LLM expert.
Your job: explain how to update an OpenAI fine-tuned model after delivery and propose practical options.

Requirements:
- Start with a 1-sentence TL;DR.
- Then give clear options (Continue Fine-Tuning, New Fine-Tune, or RAG/Embeddings) with when/why, pros/cons, and cost/ops notes.
- State what happens to the existing model (still usable; new training creates a new version/ID).
- Finish with Next steps in bullets.
- Keep answers brief, structured, and non-defensive. No hype, no internal jargon.

Answer pattern:
1) TL;DR
2) Can we add more Q&A? → Direct yes/no + nuance
3) Options to add new knowledge/behavior (3 bullets, each with “Use when… / Pros / Considerations”)
4) What happens to the old model?
5) Recommended path (based on update frequency & type)
6) Next steps (3–5 bullets)

Decision rules:
- Frequent content updates → prefer RAG/Embeddings.
- Strict output style/format → prefer (re)Fine-Tuning on versioned batches.
- If both are needed → RAG for facts + periodic fine-tune for style.
- Risk management → Keep prior model ID for rollback; A/B test with an eval set.`,
            charBudget: 12000,
        }

        // Build contextual input from history (+ your system prompt)
        const input = await buildInputFromHistory(convId, text, systemPromptObj);

        // Pick active model (fallback to gpt-5)
        const model = await getActiveModelKey();

        // Stream from OpenAI (per docs: semantic events)
        const stream = await client.responses.stream({
            model,
            input,
        });

        let botText = "";
        let usage = null;

        for await (const event of stream) {
            if (closed) break;

            if (event.type === "response.output_text.delta") {
                botText += event.delta;
                // send incremental chunk
                res.write(`event: delta\ndata: ${JSON.stringify(event.delta)}\n\n`);
            } else if (event.type === "response.completed") {
                usage = event.response?.usage || null;

                // Persist final bot message
                const botMessage = new Message({
                    conversationId: convId,
                    sender: "bot",
                    text: (botText || "").trim(),
                });
                await botMessage.save();

                conversation.messages.push(botMessage._id);
                await conversation.save();

                // Quota tracking
                user.dailyMessageCount = (user.dailyMessageCount || 0) + 1;
                await user.save();

                const limit = Number(process.env.MESSAGE_LIMIT || 999999);

                // Final metadata for the frontend
                res.write(
                    `event: done\ndata: ${JSON.stringify({
                        userMessageId: String(userMessage._id),
                        botMessageId: String(botMessage._id),
                        modelUsed: model,
                        usage,
                        attemptsLeft: Math.max(0, limit - user.dailyMessageCount),
                    })}\n\n`
                );

                break; // close loop
            } else if (event.type === "error" || event.type === "response.failed") {
                res.write(`event: error\ndata: ${JSON.stringify(event)}\n\n`);
                break;
            }
            // (You could log optional events like 'response.created' if you want)
        }

        if (!closed) res.end();
    } catch (error) {
        // If SSE already started, emit an error event; else send JSON error
        if (res.headersSent) {
            const message = error?.message || "Error while streaming";
            res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
            try { res.end(); } catch { }
        } else {
            const status = error?.response?.status || 500;
            const payload = error?.response?.data || { message: "Error processing request" };
            res.status(status).json(payload);
        }
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ user: req.session.user.id })
            .select('_id title createdAt updatedAt');

        res.json(conversations);
    } catch (error) {
        res.status(500)
            .json({ message: 'Server error' });
    }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({ _id: conversationId, user: req.session.user.id })
            .populate('messages');

        if (!conversation) {
            return res.status(404)
                .json({ message: 'Conversation not found' });
        }

        res.json(conversation.messages);
    } catch (error) {
        res.status(500)
            .json({ message: 'Server error' });
    }
};

exports.getUsersMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({ _id: conversationId })
            .populate('messages');

        if (!conversation) {
            return res.status(404)
                .json({ message: 'Conversation not found' });
        }

        res.json(conversation.messages);
    } catch (error) {
        res.status(500)
            .json({ message: 'Server error' });
    }
};

exports.getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({ user: userId })
            .select('_id title createdAt updatedAt');

        if (!conversations.length) {
            return res
                .json({ message: 'No conversations found for this user' });
        }

        res.json(conversations);
    } catch (error) {
        res.status(500)
            .json({ message: 'Server error' });
        console.log(error);
    }
};