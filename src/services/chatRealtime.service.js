// File: src/services/chatRealtime.service.js
const User = require("../models/User.model");
const Conversation = require("../models/Conversation.model");
const Message = require("../models/Message.model");

/**
 * Check 2 user có là bạn bè không
 */
async function assertFriends(userA, userB) {
  // userA, userB là document User
  const isFriend = userA.friends?.some((id) => id.equals(userB._id));
  if (!isFriend) {
    throw new Error("Hai người chưa là bạn bè, không thể chat");
  }
}

/**
 * Tìm hoặc tạo conversation direct giữa 2 user
 */
async function getOrCreateDirectConversation(userAId, userBId) {
  let convo = await Conversation.findOne({
    type: "direct",
    members: { $all: [userAId, userBId], $size: 2 },
    isDeleted: false,
  });

  if (!convo) {
    convo = await Conversation.create({
      type: "direct",
      members: [userAId, userBId],
    });
  }

  return convo;
}

class ChatRealtimeService {
  /**
   * Lưu tin nhắn 1-1
   * @param {string} fromUsername
   * @param {string} toUsername
   * @param {string} content
   */
  static async saveDirectMessage({ fromUsername, toUsername, content }) {
    const [fromUser, toUser] = await Promise.all([
      User.findOne({ username: fromUsername.toLowerCase().trim() }),
      User.findOne({ username: toUsername.toLowerCase().trim() }),
    ]);

    if (!fromUser || !toUser) {
      throw new Error("User gửi hoặc nhận không tồn tại");
    }

    // 👇 BẮT BUỘC PHẢI LÀ BẠN BÈ
    await assertFriends(fromUser, toUser);

    const conversation = await getOrCreateDirectConversation(
      fromUser._id,
      toUser._id
    );

    const message = await Message.create({
      conversation: conversation._id,
      sender: fromUser._id,
      content: content || "",
      attachments: [],
      status: "sent",
    });

    // update lastMessage
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    return {
      conversation,
      message,
    };
  }

  /**
   * Lấy lịch sử 1-1 (limit tin gần nhất)
   */

static async getDirectHistory({ fromUsername, toUsername, limit = 20 }) {
  const [fromUser, toUser] = await Promise.all([
    User.findOne({ username: fromUsername.toLowerCase().trim() }),
    User.findOne({ username: toUsername.toLowerCase().trim() }),
  ]);

  if (!fromUser || !toUser) {
    throw new Error("User không tồn tại");
  }

  await assertFriends(fromUser, toUser);

  const conversation = await Conversation.findOne({
    type: "direct",
    members: { $all: [fromUser._id, toUser._id], $size: 2 },
    isDeleted: false,
  });

  if (!conversation) {
    return {
      conversationId: null,
      messages: [],
    };
  }

  const docs = await Message.find({
    conversation: conversation._id,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "username displayName avatarUrl");

  // 🔥 Mark các tin do thằng kia gửi cho mình là đã seen
  await Message.updateMany(
    {
      conversation: conversation._id,
      sender: { $ne: fromUser._id },   // tin DO BẠN gửi
      seenBy: { $ne: fromUser._id },   // mình chưa seen
    },
    {
      $addToSet: { seenBy: fromUser._id },
    }
  );

  const messages = docs
    .reverse()
    .map((m) => ({
      id: m._id,
      content: m.content,
      at: m.createdAt,
      status: m.status,
      sender: {
        id: m.sender._id,
        username: m.sender.username,
        displayName: m.sender.displayName,
        avatarUrl: m.sender.avatarUrl,
      },
    }));

  return {
    conversationId: conversation._id,
    messages,
  };
}

}

module.exports = ChatRealtimeService;
