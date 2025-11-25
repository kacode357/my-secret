// File: src/models/Message.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "file", "video", "audio", "other"],
      default: "other",
    },
    url: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number, // bytes
    },
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // nội dung text chat
    content: {
      type: String,
      trim: true,
      default: "",
    },

    // file đính kèm (ảnh, file, video,...)
    attachments: [AttachmentSchema],

    // trạng thái tin nhắn
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // danh sách user đã seen tin này
    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // cho phép soft delete (ẩn tin nhắn)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // metadata nếu cần
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// index để sort + query nhanh theo conversation + createdAt
MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
