// File: src/controllers/ui/home.controller.js
const crypto = require("crypto");
const UserService = require("../../services/user.service");
const FriendService = require("../../services/friend.service");
const UnreadService = require("../../services/unread.service"); 

async function buildHomeData(req) {
  const friends = await UserService.getFriendsOfUser(req.user._id);
  const myFriendCode = req.session.myFriendCode || null;

  let pendingRequests = [];
  try {
    pendingRequests = await FriendService.getPendingRequestsForOwner({
      ownerUsername: req.user.username,
    });
  } catch (err) {
    console.error("Lỗi load pendingRequests:", err.message);
  }

  // 🔥 NEW: lấy map số tin nhắn chưa đọc theo từng friend
  let unreadCounts = {};
  try {
    unreadCounts = await UnreadService.getUnreadCountsByFriend(req.user._id);
  } catch (err) {
    console.error("Lỗi load unreadCounts:", err.message);
  }

  const flash = req.session.flash || null;
  delete req.session.flash;

  return {
    friends,
    myFriendCode,
    pendingRequests,
    flash,
    token: req.session.token || null,
    unreadCounts, // 👈 trả thêm xuống
  };
}


// helper emit tới một user
function emitToUser(req, username, event, payload) {
  const io = req.app.get("io");
  const onlineUsers = req.app.get("onlineUsers");
  if (!io || !onlineUsers) return;

  const sockets = onlineUsers.get(username);
  if (!sockets) return;

  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
}

const UiHomeController = {
  async getHomePage(req, res) {
    try {
      if (!req.user) {
        return res.redirect("/login");
      }

      const data = await buildHomeData(req);

      // 🔐 Sinh token cho từng friend để dùng trên URL chat
      const chatKeys = {};
      const chatPeerMap = {};

      (data.friends || []).forEach((friend) => {
        const key = crypto.randomBytes(16).toString("hex"); // token random
        chatKeys[friend.username] = key;
        chatPeerMap[key] = friend.username;
      });

      // Lưu map token -> username trong session
      req.session.chatPeerMap = chatPeerMap;

      return res.render("home", {
        title: "Trang chủ",
        user: req.user,
        chatKeys, // truyền xuống view để render URL chat
        ...data,
      });
    } catch (error) {
      console.error("Lỗi getHomePage:", error);
      return res.render("home", {
        title: "Trang chủ",
        user: req.user || null,
        friends: [],
        myFriendCode: null,
        pendingRequests: [],
        flash: {
          type: "error",
          message: "Có lỗi khi tải trang home.",
        },
        token: req.session ? req.session.token : null,
        chatKeys: {},
      });
    }
  },

  // Bấm "Tạo mã mới"
  async postGenerateFriendCode(req, res) {
    try {
      if (!req.user) return res.redirect("/login");

      const result = await FriendService.generateFriendCode({
        ownerUsername: req.user.username,
      });

      req.session.myFriendCode = {
        code: result.code,
        expiresAt: result.expiresAt,
      };

      req.session.flash = {
        type: "success",
        message: "Đã tạo mã kết bạn mới.",
      };

      return res.redirect("/home");
    } catch (err) {
      console.error("Lỗi postGenerateFriendCode:", err.message);
      req.session.flash = {
        type: "error",
        message: err.message || "Không tạo được mã kết bạn.",
      };
      return res.redirect("/home");
    }
  },

  // Bấm "Gửi yêu cầu" (nhập mã)
  async postSubmitFriendCode(req, res) {
    try {
      if (!req.user) return res.redirect("/login");

      const code = (req.body.code || "").trim();
      if (!code) {
        req.session.flash = {
          type: "error",
          message: "Vui lòng nhập mã kết bạn.",
        };
        return res.redirect("/home");
      }

      const result = await FriendService.submitFriendCode({
        requesterUsername: req.user.username,
        code,
      });

      const targetName =
        (result.owner && result.owner.displayName) || result.owner.username;

      req.session.flash = {
        type: "success",
        message: "Đã gửi yêu cầu kết bạn đến " + targetName + ".",
      };

      // 🔥 Emit realtime cho owner (người nhận)
      emitToUser(req, result.owner.username, "friend:newRequest", {
        requestId: result.requestId,
        code,
        requester: {
          username: req.user.username,
          displayName: req.user.displayName,
          avatarUrl: req.user.avatarUrl || "",
        },
        createdAt: new Date().toISOString(),
      });

      return res.redirect("/home");
    } catch (err) {
      console.error("Lỗi postSubmitFriendCode:", err.message);
      req.session.flash = {
        type: "error",
        message: err.message || "Không gửi được yêu cầu kết bạn.",
      };
      return res.redirect("/home");
    }
  },

  // Owner bấm "Đồng ý" / "Từ chối"
  async postRespondFriendRequest(req, res) {
    try {
      if (!req.user) return res.redirect("/login");

      const requestId = req.params.id;
      const acceptRaw = req.body.accept;
      const accept = acceptRaw === "true";

      const result = await FriendService.respondFriendRequest({
        ownerUsername: req.user.username,
        requestId,
        accept,
      });

      if (result.accepted) {
        req.session.flash = {
          type: "success",
          message: "Đã chấp nhận, hai người bây giờ là bạn bè.",
        };

        // 🔥 Emit cho requester: yêu cầu đã được chấp nhận
        emitToUser(req, result.friend.username, "friend:accepted", {
          friend: {
            username: req.user.username,
            displayName: req.user.displayName,
            avatarUrl: req.user.avatarUrl || "",
          },
        });
      } else {
        req.session.flash = {
          type: "success",
          message: "Đã từ chối yêu cầu kết bạn.",
        };
      }

      // Emit cho owner để nó tự refresh list (nếu đang mở ở nơi khác)
      emitToUser(req, req.user.username, "friend:updateList", {});

      return res.redirect("/home");
    } catch (err) {
      console.error("Lỗi postRespondFriendRequest:", err.message);
      req.session.flash = {
        type: "error",
        message: err.message || "Không xử lý được yêu cầu kết bạn.",
      };
      return res.redirect("/home");
    }
  },
};

module.exports = UiHomeController;
