// File: src/routes/api.js
const express = require("express");
const router = express.Router();

// Check API
const CheckApi = require("./checkapi.route");

// Chat routes
const ConversationRoutes = require("./conversation.route");
const MessageRoutes = require("./message.route");

// Auth routes


router.use("", CheckApi);

router.use("", ConversationRoutes);
router.use("", MessageRoutes);

module.exports = router;
