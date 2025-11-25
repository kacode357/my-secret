// File: src/routes/api.js
const express = require("express");
const router = express.Router();

// Check API
const CheckApi = require("./checkapi.route");

// Chat routes
const ConversationRoutes = require("./conversation.route");
const MessageRoutes = require("./message.route");
const PushController = require("../controllers/api/push.controller");

// Auth routes


router.use("", CheckApi);

router.use("", ConversationRoutes);
router.use("", MessageRoutes);

router.get("/push/public-key", PushController.getPublicKey);
router.post("/push/subscribe", PushController.postSubscribe);
router.post("/push/unsubscribe", PushController.postUnsubscribe);

module.exports = router;
