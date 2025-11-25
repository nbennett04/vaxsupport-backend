const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: String, enum: ["user", "bot"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: "30d" } // Auto-delete messages after 30 days
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
