// File: src/controllers/conversation.controller.js
const ConversationService = require("../services/conversation.service");

const ConversationController = {
  // Controller chỉ lo bắt lỗi + trả response
  async createConversation(req, res) {
    try {
      const result = await ConversationService.createConversation(req.body);

      const statusCode = result.isExisting ? 200 : 201;
      const message = result.isExisting
        ? "Conversation direct đã tồn tại"
        : "Tạo conversation thành công";

      return res.status(statusCode).json({
        message,
        data: result.conversation,
      });
    } catch (error) {
      console.error("Lỗi createConversation:", error);

      const statusCode = error.statusCode || 500;
      const msg =
        statusCode === 500 ? "Internal server error" : error.message;

      return res.status(statusCode).json({
        message: msg,
      });
    }
  },

  async getUserConversations(req, res) {
    try {
      const { userId } = req.query;

      const conversations =
        await ConversationService.getUserConversations(userId);

      return res.status(200).json({
        message: "Lấy danh sách conversation thành công",
        data: conversations,
      });
    } catch (error) {
      console.error("Lỗi getUserConversations:", error);

      const statusCode = error.statusCode || 500;
      const msg =
        statusCode === 500 ? "Internal server error" : error.message;

      return res.status(statusCode).json({
        message: msg,
      });
    }
  },
};

module.exports = ConversationController;
