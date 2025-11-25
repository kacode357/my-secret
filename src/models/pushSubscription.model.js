// File: src/models/pushSubscription.model.js
const mongoose = require("mongoose");

const PushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: { type: String },
      auth: { type: String },
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Một user + 1 endpoint chỉ có 1 subscription
PushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

const PushSubscription = mongoose.model(
  "PushSubscription",
  PushSubscriptionSchema
);

module.exports = PushSubscription;
