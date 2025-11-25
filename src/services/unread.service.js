// File: src/services/unread.service.js
const mongoose = require("mongoose");
const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model");

const UnreadService = {
  /**
   * Đếm số tin nhắn CHƯA ĐỌC của user, group theo từng người gửi (friend)
   * - "Chưa đọc" = user hiện tại KHÔNG phải sender và KHÔNG nằm trong mảng seenBy
   * - Chỉ tính conversation type = "direct"
   *
   * @param {String|mongoose.Types.ObjectId} userId - id của user hiện tại
   * @returns {Promise<Object>} - map: { friendId(string): countNumber }
   */
  async getUnreadCountsByFriend(userId) {
    if (!userId) return {};

    const uid = new mongoose.Types.ObjectId(userId);

    const rows = await Message.aggregate([
      {
        // chỉ lấy message chưa bị xóa + mày chưa seen
        $match: {
          isDeleted: { $ne: true },
          seenBy: { $ne: uid }, // user chưa nằm trong seenBy
        },
      },
      {
        // join sang Conversation để biết type + members
        $lookup: {
          from: "conversations",
          localField: "conversation",
          foreignField: "_id",
          as: "conv",
        },
      },
      { $unwind: "$conv" },
      {
        // chỉ lấy direct chat mà user là 1 member
        $match: {
          "conv.type": "direct",
          "conv.members": uid,
        },
      },
      {
        // chỉ tính tin nhắn do THẰNG KHÁC gửi (sender != user hiện tại)
        $match: {
          sender: { $ne: uid },
        },
      },
      {
        // group theo sender -> mỗi bạn 1 count
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    rows.forEach((row) => {
      if (row._id) {
        result[String(row._id)] = row.count;
      }
    });

    return result;
  },
};

module.exports = UnreadService;
