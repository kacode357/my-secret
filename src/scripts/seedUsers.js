// File: src/scripts/seedUsers.js

require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDb = require("../config/database");
const { User } = require("../models"); // nhớ đã có src/models/index.js

async function seedUsers() {
  try {
    await connectDb();

    console.log("✅ Đã kết nối database. Bắt đầu seed user...");

    const plainPassword = "123456";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const usersData = [
      {
        username: "alice",
        displayName: "Alice Nguyễn",
        email: "alice@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "bob",
        displayName: "Bob Trần",
        email: "bob@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "charlie",
        displayName: "Charlie Lê",
        email: "charlie@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
    ];

    // Upsert theo username, để chạy nhiều lần không bị trùng
    for (const userData of usersData) {
      const existing = await User.findOne({ username: userData.username });
      if (existing) {
        console.log(`⚠️ User '${userData.username}' đã tồn tại, bỏ qua.`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ Đã tạo user: ${user.username} - id: ${user._id}`);
    }

    console.log("🚀 Seed user xong. Password chung: 123456");
  } catch (error) {
    console.error("❌ Lỗi seed user:", error);
  } finally {
    // đóng connection cho script thoát
    process.exit(0);
  }
}

seedUsers();
