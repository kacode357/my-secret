// File: src/controllers/ui/chat.controller.js
const UserService = require("../../services/user.service");

const UiChatController = {
  async getChatPage(req, res) {
    try {
      if (!req.user) {
        return res.redirect("/login");
      }

      // 🔐 Lấy token trên URL thay vì username
      const key = (req.query.key || "").trim();
      if (!key) {
        return res.redirect("/home");
      }

      // Map token -> username được lưu trong session ở trang /home
      const chatPeerMap = req.session.chatPeerMap || {};
      const peerUsername = chatPeerMap[key];

      if (!peerUsername) {
        // token không tồn tại hoặc hết hạn
        return res.redirect("/home");
      }

      const peer = await UserService.getUserByUsername(
        String(peerUsername).toLowerCase().trim()
      );

      if (!peer) {
        return res.redirect("/home");
      }

      const areFriends = await UserService.checkFriendship(
        req.user._id,
        peer._id
      );

      if (!areFriends) {
        return res.redirect("/home");
      }

      return res.render("chat", {
        title: "Chat",
        user: req.user,
        peer,
      });
    } catch (error) {
      console.error("Lỗi getChatPage:", error);
      return res.redirect("/home");
    }
  },
};

module.exports = UiChatController;
