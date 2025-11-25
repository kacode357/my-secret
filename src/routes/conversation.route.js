// File: src/routes/conversation.route.js
const express = require("express");
const router = express.Router();
const ConversationController = require("../controllers/conversation.controller");

router.post("/conversations", ConversationController.createConversation);
router.get("/conversations", ConversationController.getUserConversations);

module.exports = router;
