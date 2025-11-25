// File: src/models/User.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    // username dùng để login / định danh
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // tên hiển thị trên UI chat
    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    // avatar, để client render
    avatarUrl: {
      type: String,
      default: "",
    },

    // trạng thái online/offline, phục vụ SignalR presence
    status: {
      type: String,
      enum: ["online", "offline", "busy", "away"],
      default: "offline",
    },

    // lần cuối nhìn thấy online
    lastSeenAt: {
      type: Date,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },

    // 👉 DANH SÁCH BẠN BÈ (quan hệ 2 chiều)
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // metadata thêm nếu cần
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // auto createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
