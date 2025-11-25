// helpers/history.js
const Message = require("../models/Message");

/**
 * Build an OpenAI input array from conversation history.
 * - Orders by createdAt ascending
 * - Maps your `sender` ("user" | "bot") to OpenAI roles
 * - Trims to a character budget (simple + fast)
 */
async function buildInputFromHistory(conversationId, latestUserText, opts = {}) {
  const {
    systemPrompt = "You are a concise assistant. Keep answers brief.",
    charBudget = 12000, // ~ lightweight guard; adjust as needed
  } = opts;

  const docs = await Message
    .find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();

  const history = docs.map((m) => ({
    role: m.sender === "bot" ? "assistant" : "user",
    content: m.text || "",
  }));

  // Include the new user message as the last turn
  history.push({ role: "user", content: latestUserText });

  // Prepend system prompt
  const input = [{ role: "system", content: systemPrompt }, ...history];

  // --- Trim by character budget (simple + robust) ---
  // Keep the tail (most recent) which is usually most relevant
  let total = 0;
  const reversed = [...input].reverse();
  const keptReversed = [];
  for (const m of reversed) {
    const len = (m.content || "").length + 20; // rough overhead
    if (total + len > charBudget) break;
    keptReversed.push(m);
    total += len;
  }
  return keptReversed.reverse();
}

module.exports = { buildInputFromHistory };
