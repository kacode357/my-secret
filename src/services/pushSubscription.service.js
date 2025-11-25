// File: src/services/pushSubscription.service.js
const { PushSubscription } = require("../models");

const PushSubscriptionService = {
  /**
   * Lưu hoặc cập nhật subscription cho 1 user
   * @param {Object} params
   * @param {*} params.userId ObjectId của User
   * @param {*} params.subscription object từ browser (endpoint, keys)
   * @param {*} params.userAgent user agent string (optional)
   */
  async saveSubscription({ userId, subscription, userAgent }) {
    if (!userId || !subscription || !subscription.endpoint) {
      throw new Error("Thiếu userId hoặc subscription.endpoint");
    }

    const data = {
      endpoint: subscription.endpoint,
      keys: subscription.keys || {},
      userAgent: userAgent || "",
    };

    const doc = await PushSubscription.findOneAndUpdate(
      { userId, endpoint: subscription.endpoint },
      { $set: data },
      { upsert: true, new: true }
    );

    return doc;
  },

  async removeSubscription({ userId, endpoint }) {
    if (!userId || !endpoint) return;

    await PushSubscription.deleteOne({ userId, endpoint });
  },

  async getSubscriptionsByUserId(userId) {
    if (!userId) return [];
    return PushSubscription.find({ userId }).lean();
  },
};

module.exports = PushSubscriptionService;
