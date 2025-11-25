const mongoose = require("mongoose");

const modelsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    // `null: true` isn't a Mongoose option — use default: null
    description: { type: String, default: null },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Reuse if it exists; otherwise define it.
module.exports =
  mongoose.models.Models || mongoose.model("Models", modelsSchema);
