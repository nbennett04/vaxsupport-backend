const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String},
        birthYear: { type: String},
        country: { type: String},
        state: { type: String},
        role: { type: String, enum: ["user", "admin"], default: "user", required: true },

        // Track message limits
        dailyMessageCount: { type: Number, default: 0 },
        lastMessageDate: { type: Date, default: null },
        privacyPolicyAcceptedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
