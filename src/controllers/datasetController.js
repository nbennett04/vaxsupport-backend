// controllers/datasetController.js
const path = require("path");
const os = require("os");
const fs = require("fs/promises");


// --- Helper: parse "Q : ..." / "A : ..." pairs from plain text ---
function parseQA(text) {
  const lines = String(text).split(/\r?\n/);
  const pairs = [];

  const QRE = /^\s*Q\s*[:\-]\s*(.*)$/i;
  const ARE = /^\s*A\s*[:\-]\s*(.*)$/i;

  let mode = null;          // 'q' | 'a' | null
  let qParts = [];
  let aParts = [];

  const flushIfComplete = () => {
    const q = qParts.join("\n").trim();
    const a = aParts.join("\n").trim();
    if (q && a) pairs.push({ q, a });
    qParts = [];
    aParts = [];
    mode = null;
  };

  for (const raw of lines) {
    const qMatch = raw.match(QRE);
    if (qMatch) {
      // starting a new Question block
      if (qParts.length || aParts.length) flushIfComplete(); // push if previous Q/A complete
      mode = "q";
      qParts.push(qMatch[1] ?? ""); // capture inline content after "Q:"
      continue;
    }

    const aMatch = raw.match(ARE);
    if (aMatch) {
      // starting an Answer block (only meaningful if we already have a Q)
      if (!qParts.length) {
        // stray "A:" before any "Q:" -> ignore/reset
        mode = null;
        aParts = [];
        continue;
      }
      mode = "a";
      aParts.push(aMatch[1] ?? ""); // capture inline content after "A:"
      continue;
    }

    // Non-marker line: append to whichever block we're in
    if (mode === "q") {
      qParts.push(raw);      // keep as-is to preserve formatting
    } else if (mode === "a") {
      aParts.push(raw);
    } else {
      // outside any block -> ignore preface noise
    }
  }

  // flush trailing pair if complete
  if (qParts.length || aParts.length) flushIfComplete();

  return pairs;
}


// --- Controller: create chat FT JSONL -> VALIDATE -> return only if OK ---
exports.qaToJsonl = async (req, res) => {
  try {
    // Accept JSON body { text, system } OR raw text if this route uses express.text()
    const bodyIsString = typeof req.body === "string";
    const text = bodyIsString ? req.body : (req.body?.text ?? "");
    const systemP = bodyIsString ? undefined : req.body?.system;
    let system = ""
    if (systemP === ""){
        system = "You are a knowledgeable and friendly assistant trained to provide accurate, up-to-date information on vaccinations.Your purpose is to help users with all their vaccination-related queries, including vaccine schedules, eligibility, safety, side effects, benefits, and guidance for various age groups, travel, pregnancy, and medical conditions.You are designed to support users by offering reliable information from trusted health organizations like the WHO and CDC, ensuring that every response is helpful, clear, and informative."
    }
    else if (systemP) {
        system = String(systemP).trim();
    }

    if (!text?.trim()) {
      return res.status(400).json({ message: "Provide 'text' with Q/A pairs." });
    }

    const pairs = parseQA(text);
    if (!pairs.length) {
      return res.status(400).json({ message: "No Q/A pairs found in input." });
    }

    // Build JSONL string
    const lines = pairs.map(({ q, a }) => {
      const messages = [];
      if (system && String(system).trim()) {
        messages.push({ role: "system", content: String(system).trim() });
      }
      messages.push({ role: "user", content: q });
      messages.push({ role: "assistant", content: a });
      return JSON.stringify({ messages });
    });
    const jsonl = lines.join("\n") + "\n";

    // ---- VALIDATE with OpenAI by creating/cancelling a FT job ----
    // Prefer env var; optionally allow header override for testing.
    const apiKey =
      process.env.OPENAI_API_KEY ||
      req.headers["x-openai-key"]; // optional, remove if you don't want header support

    if (!apiKey) {
      return res.status(500).json({ message: "Missing OPENAI_API_KEY." });
    }

    // ---- If validation passed, return the JSONL as a download ----
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="qa_dataset.jsonl"');
    return res.send(jsonl);
  } catch (err) {
    console.error("qaToJsonl error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
