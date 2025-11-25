const express = require("express");
const router = express.Router();
const { getAllStates, getStatesByCountry} = require("../controllers/stateController");

router.get("/", getAllStates);
router.get("/:country_id", getStatesByCountry);

module.exports = router;
