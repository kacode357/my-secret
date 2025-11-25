// File: src/routes/message.route.js
const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/message.controller");

router.get(
  "/conversations/:conversationId/messages",
  MessageController.getMessages
);

router.post(
  "/conversations/:conversationId/messages",
  MessageController.createMessage
);

module.exports = router;
