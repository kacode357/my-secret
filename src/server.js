// File: src/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");

const connectDb = require("./config/database");
const apiRoutes = require("./routes/api");
const uiRoutes = require("./routes/ui.route");
const initSocket = require("./realtime/socket");

const app = express();

// --- CONFIG GLOBAL CHO VIEW ---
app.locals.siteTitle = "My Secret"; // title cho tab trình duyệt
app.locals.logoUrl = "/images/logo.png"; // đường dẫn logo / favicon

// static public (ở ngoài src)
app.use(express.static(path.join(__dirname, "..", "public")));

// ========== VIEW ENGINE ==========
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ========== MIDDLEWARE CHUNG ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Nếu mày KHÔNG có thư mục src/public thì có thể bỏ dòng này đi
// app.use(express.static(path.join(__dirname, "public")));

// ========== SESSION CHO UI ==========
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {}, // tắt browser là mất
  })
);

// ========== KẾT NỐI DATABASE ==========
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    console.error(">>> LỖI KẾT NỐI DATABASE:", error);
    if (req.path.startsWith("/api")) {
      return res.status(503).json({
        message: "Service Unavailable: Không thể kết nối tới database.",
      });
    }

    return res
      .status(503)
      .send("Service Unavailable: Không thể kết nối tới database.");
  }
});

// ========== ROUTES ==========
app.use("/", uiRoutes);
app.use("/api", apiRoutes);

// ========== TẠO HTTP SERVER + SOCKET.IO (CHO LOCAL + RENDER) ==========
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// khởi tạo socket.io, truyền server + app nếu trong initSocket có dùng app
initSocket(server, app);

// start server (Render và local đều dùng chung)
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🔑 UI Login: http://localhost:${PORT}/login`);
  console.log(`🏠 UI Home:  http://localhost:${PORT}/home`);
});

// vẫn export app nếu sau này cần test hoặc dùng cho Vercel gì đó
module.exports = app;
