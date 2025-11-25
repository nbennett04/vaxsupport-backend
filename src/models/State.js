const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  country_id: { type: Number, required: true },
  country_code: { type: String, required: true },
  country_name: { type: String, required: true },
  state_code: { type: String, required: true },
  type: { type: String, required: false },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true }
});

const State = mongoose.model("State", stateSchema);
module.exports = State;
