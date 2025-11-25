// File: src/realtime/socket.js
const { Server } = require("socket.io");
const ChatRealtimeService = require("../services/chatRealtime.service");
const FriendService = require("../services/friend.service");
const UserService = require("../services/user.service");

function createOnlineUsersMap() {
  const map = new Map();

  function add(username, socketId) {
    if (!username || !socketId) return;
    const key = String(username).toLowerCase();
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    map.get(key).add(socketId);
  }

  function remove(socketId) {
    for (const [username, set] of map.entries()) {
      if (set.has(socketId)) {
        set.delete(socketId);
        if (set.size === 0) {
          map.delete(username);
        }
        break;
      }
    }
  }

  function get(username) {
    if (!username) return null;
    return map.get(String(username).toLowerCase()) || null;
  }

  return { map, add, remove, get };
}

function initSocket(server, app, opts = {}) {
  const clientOrigin = opts.clientOrigin || process.env.CLIENT_ORIGIN || "*";

  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  app.set("io", io);

  const onlineUsers = createOnlineUsersMap();
  app.set("onlineUsers", onlineUsers);

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // ========== AUTH IDENTIFY + PRESENCE ==========
    socket.on("auth:identify", async ({ username }) => {
      try {
        if (!username) return;

        const uname = String(username).toLowerCase();
        socket.data.username = uname;
        onlineUsers.add(uname, socket.id);
        console.log("✅ identify:", uname, "=>", socket.id);

        const user = await UserService.setOnline(uname);

        io.emit("presence:update", {
          username: user ? user.username : uname,
          status: "online",
          lastSeenAt: user && user.lastSeenAt ? user.lastSeenAt : new Date(),
        });
      } catch (err) {
        console.error("Lỗi auth:identify:", err.message);
      }
    });

    // ========== CHAT ==========
    socket.on("chat:send", async ({ from, to, message }) => {
      if (!from || !to || !message) {
        console.log("❗ Thiếu from/to/message:", { from, to, message });
        return;
      }

      try {
        const result = await ChatRealtimeService.saveDirectMessage({
          fromUsername: from,
          toUsername: to,
          content: message,
        });

        const payload = {
          from,
          to,
          message,
          at: result.message.createdAt,
          conversationId: result.conversation._id,
          messageId: result.message._id,
        };

        console.log("📨 chat:send saved & broadcast:", payload);

        io.emit("chat:receive", payload);
      } catch (err) {
        console.error("❌ Lỗi lưu tin nhắn:", err.message);
        socket.emit("chat:error", { message: "Không gửi được tin nhắn" });
      }
    });

    socket.on("chat:getHistory", async ({ from, to, limit }) => {
      if (!from || !to) {
        return socket.emit("chat:historyError", {
          message: "Thiếu from/to khi lấy lịch sử",
        });
      }

      try {
        const result = await ChatRealtimeService.getDirectHistory({
          fromUsername: from,
          toUsername: to,
          limit: limit || 20,
        });

        socket.emit("chat:history", {
          from,
          to,
          conversationId: result.conversationId,
          messages: result.messages,
        });
      } catch (err) {
        console.error("❌ Lỗi getDirectHistory:", err.message);
        socket.emit("chat:historyError", {
          message: err.message || "Không lấy được lịch sử chat",
        });
      }
    });

    // ========== IS TYPING ==========
    socket.on("chat:typing", ({ from, to, isTyping }) => {
      try {
        if (!from || !to) return;

        const payload = { from, to, isTyping: !!isTyping };

        io.emit("chat:typing", payload);
      } catch (err) {
        console.error("❌ Lỗi chat:typing:", err.message);
      }
    });

    // ========== FRIEND REQUEST ==========
    socket.on("friend:getPending", async (data, cb) => {
      const username = socket.data.username;
      if (!username) {
        if (cb) cb({ ok: false, message: "Chưa xác thực username" });
        return;
      }

      try {
        const list = await FriendService.getPendingRequestsForOwner({
          ownerUsername: username,
        });
        if (cb) cb({ ok: true, data: list });
      } catch (err) {
        console.error("❌ Lỗi friend:getPending:", err.message);
        if (cb) cb({ ok: false, message: err.message });
      }
    });

    // ========== DISCONNECT ==========
    socket.on("disconnect", async () => {
      try {
        console.log("❌ Client disconnected:", socket.id);
        const username = socket.data.username;
        onlineUsers.remove(socket.id);

        if (username) {
          const socketsStillOnline = onlineUsers.get(username);
          if (!socketsStillOnline || socketsStillOnline.size === 0) {
            const user = await UserService.setOffline(username);
            io.emit("presence:update", {
              username: user ? user.username : username,
              status: "offline",
              lastSeenAt:
                user && user.lastSeenAt ? user.lastSeenAt : new Date(),
            });
          }
        }
      } catch (err) {
        console.error("Lỗi disconnect:", err.message);
      }
    });
  });
}

module.exports = initSocket;
