// File: src/services/unread.service.js
const { Message } = require("../models");
const mongoose = require("mongoose");

const UnreadService = {
  /**
   * Đếm số tin nhắn CHƯA ĐỌC của user, group theo từng người gửi (friend)
   * @param {String|ObjectId} userId - id của user hiện tại (người nhận)
   * @returns {Promise<Object>} - map: { friendId(string): countNumber }
   */
  async getUnreadCountsByFriend(userId) {
    if (!userId) return {};

    const uid = new mongoose.Types.ObjectId(userId);

    // ⚠️ Giả sử schema:
    // - receiver: ObjectId user nhận
    // - sender: ObjectId user gửi
    // - isRead: Boolean
    const rows = await Message.aggregate([
      {
        $match: {
          receiver: uid,
          isRead: false,
        },
      },
      {
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
