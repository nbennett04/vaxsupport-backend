const Country = require("../models/Country");

// Fetch all countries
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
