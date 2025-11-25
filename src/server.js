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

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

// --- CONFIG GLOBAL CHO VIEW ---
app.locals.siteTitle = "My Secret"; // title cho tab trình duyệt
app.locals.logoUrl = "/images/logo.png"; // đường dẫn logo / favicon

// public ngoài root (../public)
app.use(express.static(path.join(__dirname, "..", "public")));

// ========== VIEW ENGINE ==========
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ========== MIDDLEWARE CHUNG ==========
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static files (css/js/img) TRONG src/public (nếu mày có)
app.use(express.static(path.join(__dirname, "public")));

// ========== SESSION CHO UI ==========
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      dbName: process.env.MONGO_DB_NAME || undefined,
      ttl: 7 * 24 * 60 * 60, // 7 ngày
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
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

// ========== EXPORT (nếu mày cần dùng làm handler) ==========
module.exports = app;

// ========== HTTP + SOCKET.IO ==========
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initSocket(server, app, { clientOrigin: CLIENT_ORIGIN });

server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
