// routes/datasetRoutes.js
const express = require("express");
const router = express.Router();
const { qaToJsonl } = require("../controllers/datasetController");

// Accept JSON body by default. If you want raw text, mount express.text() here instead.
// Example for raw text: router.post("/qa-to-jsonl", express.text({ type: "*/*", limit: "2mb" }), qaToJsonl);
router.post("/qa-to-jsonl", qaToJsonl);


module.exports = router;
