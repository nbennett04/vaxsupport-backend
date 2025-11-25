const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true }, 
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    onboardingStep: { type: Number, default: 0 },   // Track onboarding step (0–5)
    onboardingCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
