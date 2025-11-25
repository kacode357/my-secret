// File: src/models/Conversation.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    // type: direct = 1-1, group = nhiều người
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    // danh sách member trong phòng
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // tên phòng, dùng cho group
    title: {
      type: String,
      trim: true,
    },

    // ảnh đại diện phòng (group avatar)
    avatarUrl: {
      type: String,
      default: "",
    },

    // last message phục vụ list conversation (hiện preview)
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: {
      type: Date,
    },

    // cho phép soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // nếu mày muốn track từng user rời group
    // hoặc config riêng từng user trong room, có thể thêm sub-document
    settings: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index để query nhanh conversation theo member
ConversationSchema.index({ members: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
