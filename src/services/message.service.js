// File: src/services/message.service.js
const { Message, Conversation } = require("../models");

class MessageService {
  /**
   * Lấy messages trong 1 conversation (có phân trang)
   * @param {string} conversationId
   * @param {Object} options
   * @param {number} options.page
   * @param {number} options.limit
   * @returns {Promise<{ messages: any[], pagination: any }>}
   */
  async getMessages(conversationId, options = {}) {
    if (!conversationId) {
      const err = new Error("Thiếu conversationId");
      err.statusCode = 400;
      throw err;
    }

    let { page = 1, limit = 20 } = options;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId, isDeleted: false })
        .populate("sender", "username displayName avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: conversationId, isDeleted: false }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tạo message mới trong 1 conversation
   * @param {string} conversationId
   * @param {Object} payload
   * @param {string} payload.senderId
   * @param {string} [payload.content]
   * @param {Array} [payload.attachments]
   * @returns {Promise<any>}
   */
  async createMessage(conversationId, payload = {}) {
    const { senderId, content = "", attachments = [] } = payload;

    if (!conversationId) {
      const err = new Error("Thiếu conversationId");
      err.statusCode = 400;
      throw err;
    }

    if (!senderId) {
      const err = new Error("Thiếu senderId");
      err.statusCode = 400;
      throw err;
    }

    if (!content && (!Array.isArray(attachments) || attachments.length === 0)) {
      const err = new Error("content hoặc attachments phải có dữ liệu");
      err.statusCode = 400;
      throw err;
    }

    // Tạo message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
      attachments,
      status: "sent",
    });

    // Cập nhật lastMessage cho conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    const populatedMessage = await message.populate(
      "sender",
      "username displayName avatarUrl"
    );

    return populatedMessage;
  }
}

module.exports = new MessageService();
