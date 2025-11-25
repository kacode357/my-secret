// File: src/controllers/api/push.controller.js
const PushSubscriptionService = require("../../services/pushSubscription.service");

const PushController = {
  // GET /api/push/public-key
  getPublicKey(req, res) {
    const publicKey = process.env.VAPID_PUBLIC_KEY || null;

    if (!publicKey) {
      return res.status(500).json({
        message: "VAPID_PUBLIC_KEY chưa được cấu hình.",
      });
    }

    return res.json({ publicKey });
  },

  // POST /api/push/subscribe
  // body: { subscription: {...} }
  async postSubscribe(req, res) {
    try {
      const subscription = req.body.subscription;

      // Lấy user từ req.user hoặc req.session.user (tuỳ mày setup)
      const user = req.user || (req.session && req.session.user);

      if (!user || !user._id) {
        return res.status(401).json({ message: "Chưa đăng nhập." });
      }

      if (!subscription || !subscription.endpoint) {
        return res
          .status(400)
          .json({ message: "Thiếu subscription hoặc endpoint." });
      }

      const userAgent = req.headers["user-agent"] || "";

      const saved = await PushSubscriptionService.saveSubscription({
        userId: user._id,
        subscription,
        userAgent,
      });

      return res.json({
        ok: true,
        id: saved._id,
      });
    } catch (err) {
      console.error("❌ Lỗi postSubscribe:", err);
      return res.status(500).json({
        message: "Không lưu được subscription.",
      });
    }
  },

  // POST /api/push/unsubscribe
  // body: { endpoint: "..." }
  async postUnsubscribe(req, res) {
    try {
      const endpoint = req.body.endpoint;
      const user = req.user || (req.session && req.session.user);

      if (!user || !user._id) {
        return res.status(401).json({ message: "Chưa đăng nhập." });
      }

      if (!endpoint) {
        return res.status(400).json({ message: "Thiếu endpoint." });
      }

      await PushSubscriptionService.removeSubscription({
        userId: user._id,
        endpoint,
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error("❌ Lỗi postUnsubscribe:", err);
      return res.status(500).json({
        message: "Không huỷ được subscription.",
      });
    }
  },
};

module.exports = PushController;
