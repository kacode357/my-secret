// File: src/models/FriendRequest.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const FriendRequestSchema = new Schema(
  {
    // user tạo mã (người sẽ nhận yêu cầu)
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // user nhập mã (người gửi yêu cầu kết bạn)
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Mã kết bạn để nhập
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["code_generated", "pending_approval", "accepted", "rejected", "expired"],
      default: "code_generated",
      index: true,
    },

    // Hết hạn mã (vd: 24h)
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // metadata thêm nếu cần
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động xóa request hết hạn nếu muốn (TTL index) – optional
// FriendRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);
