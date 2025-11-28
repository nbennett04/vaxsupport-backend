require('dotenv').config();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Models = require('../models/models');
const { buildInputFromHistory } = require("../helpers/buildInputFromHistory");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Start a new conversation
 */
exports.startConversation = async (req, res) => {
  try {
    const { title, firstMessage } = req.body || {};
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Try to find one by exact title for this user (optional behavior)
    let conversation = null;
    // if (title) {
    //   conversation = await Conversation.findOne({ user: userId, title });
    // }

    // If no conversation is found, create a new one
    if (conversation==null) {
      console.log("Creating new conversation for user:", userId);
      conversation = new Conversation({
        user: userId,
        title: title || (firstMessage ? firstMessage.substring(0, 50) : "New Chat"),
        messages: [],
    
      });
      await conversation.save();
      // const userMessage = new Message({ conversationId: convId, sender: "user", text });
      // await userMessage.save();
      // conversation.messages.push(userMessage._id);
      //  await conversation.save();


    }


    // Return the created conversation's ID and title
    return res.status(201).json({
      conversationId: conversation._id,
      title: conversation.title,
      messages: conversation.messages,  // This will be an empty array initially
    });
  } catch (error) {
    console.error("Error in startConversation:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};





async function generateAIResponse(message) {
  // Simulate AI response (replace with actual API call)
  return `Hello! You said: ${message}. How can I assist?`;
}

/**
 * Pick the active model
 */
async function getActiveModelKey() {
  let model = "gpt-5"; // fallback
  try {
    const active = await Models.findOne({ active: true }, { key: 1 })
      .sort({ updatedAt: -1 })
      .lean();
    if (active?.key) model = active.key;
    await client.models.retrieve(model); // sanity check
  } catch {
    model = "gpt-5";
  }
  return model;
}

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const userId = req.session.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ----- Load or create conversation -----
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: userId });
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    } else {
      const title = (text || "New Chat").slice(0, 60);
      conversation = new Conversation({
        user: userId,
        title,
        messages: [],
      });
      await conversation.save();
    }

    const convId = conversation._id;

    // Save user’s message
    const userMessage = new Message({ conversationId: convId, sender: "user", text });
    await userMessage.save();
    conversation.messages.push(userMessage._id);

    if (!conversation.title || /^new chat$/i.test(conversation.title)) {
      conversation.title = text.slice(0, 60);
    }
    await conversation.save();

    // ----- SSE headers -----
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Credentials": "true",
      "X-Accel-Buffering": "no",
    });
    if (res.flushHeaders) res.flushHeaders();

    let closed = false;
    res.on("close", () => {
      closed = true;
      try { res.end(); } catch {}
    });

    // ----- Build input from history -----
    const input = await buildInputFromHistory(convId, text, {
systemPrompt:
  `You are a friendly and knowledgeable vaccine assistant.

OBJECTIVE:
- *First*, provide a clear, concise answer to the user's question, aligned with CDC and US healthcare guidelines. Keep the explanation short (1–3 sentences) and to the point.
- *Then*, on a new line, ask exactly ONE short, conversational question that will help you give a more specific or helpful answer next time.
- The question must be related to what the user asked and should gather the most useful missing information (like who the vaccine is for, their age, or their location).
- *Be sure to adjust the follow-up question depending on the specific vaccine being discussed*, such as asking for age, health conditions, or vaccination status for vaccines like Pfizer, flu shots, or others.
- *Keep the question polite, natural, and under 12 words.*
- *Do not write "Follow-up:" before the question.*

EXAMPLES OF USEFUL FOLLOW-UP QUESTIONS:
- If the user asks about the flu vaccine: "Is this for you or a family member?"
- If the user asks about a child’s vaccination schedule: "How old is your child?"
- If the user asks about a vaccination center: "Which state or city are you in?"
- If the user asks about the COVID-19 vaccine: "Are you currently pregnant or planning pregnancy?"
- If the user asks about recommended vaccines for seniors: "Are you 65 years or older?"
- If the user asks about the *Pfizer COVID-19 vaccine*: "Are you over 12 and fully vaccinated?"

SPECIFIC GUIDELINES FOR US USERS:
- If the user is asking about a *child’s vaccine schedule*: Ask about the child’s **age** in *months* or *years*, depending on the vaccine being discussed.
- If the user asks about *COVID-19 vaccination, check if they have received their **booster** shot and if they are *immunocompromised*.
- For *flu vaccines*, mention availability for **all ages**, and **ask about age** or *if it’s for a child* or *elderly*.
- If the user asks about *Pfizer COVID-19 vaccine*: "Are you over 12 and fully vaccinated?"
- If the user asks about *vaccination centers*: Always ask for the user’s **state** or *city* to help them find a nearby center.

OUTPUT FORMAT (strict):
- Provide the main answer to the user’s question first.
- On a new line, ask exactly ONE follow-up question based on the user's needs or missing information.
- The follow-up question should *NOT* start with "Follow-up:".
- Always ensure the information is accurate and up-to-date with CDC guidelines.
- The follow-up question should help guide the user to give you the most useful missing information (like who the vaccine is for, their age, or their health status).

Example Outputs (for specific vaccines or situations):

1. **For Pfizer COVID-19 vaccine query:**
   User: *What’s the Pfizer COVID-19 vaccine schedule?*
   Answer: 
   "The Pfizer COVID-19 vaccine is administered in two doses, typically 3 weeks apart. A third booster dose is recommended after the initial doses, especially for certain populations such as the elderly and immunocompromised. If you're over 12 years old, you can receive the vaccine."
   
   Follow-up question:
   "Are you over 12 and fully vaccinated?"

2. **For flu vaccine query:**
   User: *Is the flu shot available for my child?*
   Answer:
   "The flu shot is recommended annually for all individuals aged 6 months and older. For children, the flu vaccine is especially important to prevent the spread of seasonal flu. If your child is younger than 9 years, they may need two doses during their first flu season."
   
   Follow-up question:
   "How old is your child?"

3. **For a child-related vaccination schedule query:**
   User: *When do kids get the MMR vaccine?*
   Answer:
   "The MMR vaccine protects children from measles, mumps, and rubella. The first dose is given at 12–15 months of age, with a second dose between 4–6 years old. This ensures full immunity against these diseases."
   
   Follow-up question:
   "How old is your child, so I can tell you exactly which vaccine schedule applies?"

4. **For vaccination center query:**
   User: *Where can I get vaccinated for COVID-19?*
   Answer:
   "COVID-19 vaccinations are available at many local pharmacies, hospitals, and clinics. You can also find a vaccination center near you using the CDC's Vaccine Finder tool."
   
   Follow-up question:
   "Which state or city are you in?`
,
       
    });

    const model = await getActiveModelKey();
    const stream = await client.responses.stream({ model, input });

    let botText = "";
    let usage = null;

    for await (const event of stream) {
      if (closed) break;

      if (event.type === "response.output_text.delta") {
        botText += event.delta;
        res.write(`event: delta\ndata: ${JSON.stringify(event.delta)}\n\n`);
      } else if (event.type === "response.completed") {
        usage = event.response?.usage || null;

        const botMessage = new Message({
          conversationId: convId,
          sender: "bot",
          text: (botText || "").trim(),
        });
        await botMessage.save();

        conversation.messages.push(botMessage._id);
        await conversation.save();

        user.dailyMessageCount = (user.dailyMessageCount || 0) + 1;
        await user.save();

        const limit = Number(process.env.MESSAGE_LIMIT || 999999);

        res.write(
          `event: done\ndata: ${JSON.stringify({
            userMessageId: String(userMessage._id),
            botMessageId: String(botMessage._id),
            modelUsed: model,
            usage,
            attemptsLeft: Math.max(0, limit - user.dailyMessageCount),
          })}\n\n`
        );
        break;
      } else if (event.type === "error" || event.type === "response.failed") {
        res.write(`event: error\ndata: ${JSON.stringify(event)}\n\n`);
        break;
      }
    }

    if (!closed) res.end();
  } catch (error) {
    if (res.headersSent) {
      const message = error?.message || "Error while streaming";
      console.error('Error while streaming:', message);
      res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      try { res.end(); } catch {}
    } else {
      const status = error?.response?.status || 500;
      const payload = error?.response?.data || { message: "Error processing request" };
      res.status(status).json(payload);
    }
  }
};

/**
 * Get all conversations for the current user
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.session.user.id })
      .select('_id title createdAt updatedAt');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get messages for a specific conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({ _id: conversationId, user: req.session.user.id })
      .populate('messages');
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get messages for any conversation (admin)
 */
exports.getUsersMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ _id: conversationId }).populate('messages');
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all conversations for a given userId (admin)
 */
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ user: userId })
      .select('_id title createdAt updatedAt');
    if (!conversations.length) {
      return res.json({ message: 'No conversations found for this user' });
    }
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error);
  }
};
