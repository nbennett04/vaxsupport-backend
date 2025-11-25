const State = require("../models/State");

// Fetch all states
exports.getAllStates = async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch states by country_id
exports.getStatesByCountry = async (req, res) => {
  try {
    const { country_id } = req.params;
    const states = await State.find({ country_id: Number(country_id) });

    if (states.length === 0) {
      return res.status(404).json({ message: "No states found for this country" });
    }

    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
