// File: src/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");

const connectDb = require("./config/database");
const apiRoutes = require("./routes/api");
const uiRoutes = require("./routes/ui.route");
const initSocket = require("./realtime/socket");

const app = express();

// ========== GLOBAL CONFIG CHO VIEW ==========
app.locals.siteTitle = "My Secret";
app.locals.logoUrl = "/images/logo.png";

// ========== STATIC FILES ==========
// public nằm ở root project: /public
app.use(express.static(path.join(__dirname, "..", "public")));

// ========== VIEW ENGINE ==========
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ========== MIDDLEWARE CHUNG ==========
app.use(
  cors({
    origin: process.env.BASE_URL || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== SESSION CHO UI (DÙNG MONGODB STORE) ==========
// Quan trọng để khi deploy nhiều instance / serverless không bị mất session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      dbName: process.env.MONGO_DB_NAME || undefined, // nếu connection string không ghi db thì set biến này
      ttl: 7 * 24 * 60 * 60, // 7 ngày
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // nếu dùng https ở prod thì true
    },
  })
);

// ========== KẾT NỐI DATABASE (MIDDLEWARE) ==========
// connectDb bên trong nên tự cache / reuse connection.
// Middleware này đảm bảo mỗi request đều gọi connectDb()
// nhưng nếu đã connect rồi thì không connect lại nữa.
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

// ========== EXPORT CHO VERCEL / SERVERLESS ==========
module.exports = app;

// ========== SOCKET.IO + HTTP SERVER CHO LOCAL DEV ==========
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;

  const server = http.createServer(app);

  // Khởi tạo socket.io
  initSocket(server, app);

  server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`🔑 UI Login: http://localhost:${PORT}/login`);
    console.log(`🏠 UI Home:  http://localhost:${PORT}/home`);
  });
}
