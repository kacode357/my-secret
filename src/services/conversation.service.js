// File: src/services/conversation.service.js
const { Conversation } = require("../models");

class ConversationService {
  /**
   * Tạo conversation (direct hoặc group)
   * @param {Object} payload
   * @param {"direct"|"group"} payload.type
   * @param {Array<string>} payload.members
   * @param {string} [payload.title]
   * @param {string} [payload.avatarUrl]
   * @returns {Promise<{ conversation: any, isExisting: boolean }>}
   */
  async createConversation(payload) {
    const { type = "direct", members, title, avatarUrl } = payload || {};

    // Validate ở service luôn
    if (!Array.isArray(members) || members.length < 2) {
      const err = new Error("members phải là array >= 2 userId");
      err.statusCode = 400;
      throw err;
    }

    let existingConversation = null;

    // Nếu là direct thì check tồn tại sẵn
    if (type === "direct") {
      existingConversation = await Conversation.findOne({
        type: "direct",
        members: { $all: members, $size: members.length },
        isDeleted: false,
      });

      if (existingConversation) {
        return {
          conversation: existingConversation,
          isExisting: true,
        };
      }
    }

    const conversation = await Conversation.create({
      type,
      members,
      title,
      avatarUrl,
      lastMessage: null,
      lastMessageAt: null,
    });

    return {
      conversation,
      isExisting: false,
    };
  }

  /**
   * Lấy list conversation của 1 user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserConversations(userId) {
    if (!userId) {
      const err = new Error("Thiếu userId");
      err.statusCode = 400;
      throw err;
    }

    const conversations = await Conversation.find({
      members: userId,
      isDeleted: false,
    })
      .populate("members", "username displayName avatarUrl")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username displayName avatarUrl",
        },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return conversations;
  }
}

module.exports = new ConversationService();
