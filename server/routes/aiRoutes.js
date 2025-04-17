// server/routes/aiRoutes.js

const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// POST /api/generate-description
router.post("/generate-description", aiController.generateDescription);

module.exports = router;
