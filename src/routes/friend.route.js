// File: src/routes/friend.route.js
const express = require("express");
const router = express.Router();

const FriendService = require("../services/friend.service");

/**
 * Tất cả route ở đây đã được auth bằng apiRequireAuth
 * nên luôn có req.user (lấy từ session)
 */

// POST /api/friends/code -> tạo mã
router.post("/code", async (req, res) => {
  try {
    const data = await FriendService.generateFriendCode({
      ownerUsername: req.user.username,
    });
    return res.json(data);
  } catch (err) {
    console.error("Lỗi /api/friends/code:", err.message);
    return res.status(400).json({ message: err.message });
  }
});

// POST /api/friends/submit-code -> nhập mã
router.post("/submit-code", async (req, res) => {
  try {
    const { code } = req.body;
    const data = await FriendService.submitFriendCode({
      requesterUsername: req.user.username,
      code,
    });
    return res.json(data);
  } catch (err) {
    console.error("Lỗi /api/friends/submit-code:", err.message);
    return res.status(400).json({ message: err.message });
  }
});

// GET /api/friends/requests -> list pending của owner
router.get("/requests", async (req, res) => {
  try {
    const data = await FriendService.getPendingRequestsForOwner({
      ownerUsername: req.user.username,
    });
    return res.json(data);
  } catch (err) {
    console.error("Lỗi /api/friends/requests:", err.message);
    return res.status(400).json({ message: err.message });
  }
});

// POST /api/friends/requests/:id/respond -> accept/reject
router.post("/requests/:id/respond", async (req, res) => {
  try {
    const { accept } = req.body;
    const data = await FriendService.respondFriendRequest({
      ownerUsername: req.user.username,
      requestId: req.params.id,
      accept: !!accept,
    });
    return res.json(data);
  } catch (err) {
    console.error("Lỗi /api/friends/requests/:id/respond:", err.message);
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
