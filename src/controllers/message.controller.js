// File: src/controllers/message.controller.js
const MessageService = require("../services/message.service");

const MessageController = {
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { page, limit } = req.query;

      const result = await MessageService.getMessages(conversationId, {
        page,
        limit,
      });

      return res.status(200).json({
        message: "Lấy messages thành công",
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Lỗi getMessages:", error);

      const statusCode = error.statusCode || 500;
      const msg =
        statusCode === 500 ? "Internal server error" : error.message;

      return res.status(statusCode).json({
        message: msg,
      });
    }
  },

  async createMessage(req, res) {
    try {
      const { conversationId } = req.params;

      const message = await MessageService.createMessage(
        conversationId,
        req.body
      );

      return res.status(201).json({
        message: "Tạo message thành công",
        data: message,
      });
    } catch (error) {
      console.error("Lỗi createMessage:", error);

      const statusCode = error.statusCode || 500;
      const msg =
        statusCode === 500 ? "Internal server error" : error.message;

      return res.status(statusCode).json({
        message: msg,
      });
    }
  },
};

module.exports = MessageController;
