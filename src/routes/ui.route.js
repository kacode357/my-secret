// File: src/routes/ui.route.js
const express = require("express");
const router = express.Router();

// Controllers UI
const UiAuthController = require("../controllers/ui/auth.controller");
const UiHomeController = require("../controllers/ui/home.controller");
const UiChatController = require("../controllers/ui/chat.controller");

// Middleware auth cho UI (dùng session)
const uiRequireAuth = require("../middlewares/uiAuth.middleware");

// ========== AUTH ==========

// GET /login
router.get("/login", UiAuthController.getLoginPage);

// POST /login
router.post("/login", UiAuthController.postLogin);

// POST /logout - huỷ session
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  } else {
    res.redirect("/login");
  }
});

// ========== UI PROTECTED ==========

// Trang home: list bạn bè + kết bạn
router.get("/home", uiRequireAuth, UiHomeController.getHomePage);

// Tạo mã kết bạn
router.post(
  "/home/friend-code",
  uiRequireAuth,
  UiHomeController.postGenerateFriendCode
);

// Nhập mã kết bạn
router.post(
  "/home/friend-submit",
  uiRequireAuth,
  UiHomeController.postSubmitFriendCode
);

// Duyệt yêu cầu kết bạn
router.post(
  "/home/friend-requests/:id/respond",
  uiRequireAuth,
  UiHomeController.postRespondFriendRequest
);

// Trang chat 1-1, param ?with=username
router.get("/chat", uiRequireAuth, UiChatController.getChatPage);

// ========== DEFAULT ==========

// root redirect về /home
router.get("/", (req, res) => {
  res.redirect("/home");
});

module.exports = router;
