// File: src/scripts/resetDb.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../config/database");
const { User } = require("../models");

async function seedUsers() {
  try {
    await connectDb();
    console.log("✅ Đã kết nối DB, bắt đầu seed user (KHÔNG reset database)!");

    const plainPassword = "123456";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const usersData = [
      {
        username: "phamanhkhoa5829",
        displayName: "Pham Anh Khoa 5829",
        email: "phamanhkhoa5829@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "luukaka9103",
        displayName: "Luu Kaka 9103",
        email: "luukaka9103@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "lenguyenquocbinh2741",
        displayName: "Le Nguyen Quoc Binh 2741",
        email: "lenguyenquocbinh2741@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "nguyenhungkhuong8392",
        displayName: "Nguyen Hung Khuong 8392",
        email: "nguyenhungkhuong8392@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "lethianhngoc4055",
        displayName: "Le Thi Anh Ngoc 4055",
        email: "lethianhngoc4055@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "trankimchi1209",
        displayName: "Tran Kim Chi 1209",
        email: "trankimchi1209@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      {
        username: "phankangmin6714",
        displayName: "Phan Kang Min 6714",
        email: "phankangmin6714@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      // 🔥 User mới 1
      {
        username: "vodangkhoa1256",
        displayName: "Vo Dang Khoa 1256",
        email: "vodangkhoa1256@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
      // 🔥 User mới 2
      {
        username: "luuhoaihongngoc8142",
        displayName: "Luu Hoai Hong Ngoc 8142",
        email: "luuhoaihongngoc8142@example.com",
        avatarUrl: "",
        passwordHash,
        status: "offline",
      },
    ];

    // Dùng upsert để:
    // - Nếu username chưa có -> tạo mới
    // - Nếu đã tồn tại -> giữ nguyên, không sửa gì
    for (const u of usersData) {
      const { username, ...rest } = u;
      const result = await User.findOneAndUpdate(
        { username },
        { $setOnInsert: { username, ...rest } },
        { upsert: true, new: true }
      );

      console.log(`✔️ Seed user: ${username} (${result._id})`);
    }

    console.log("🎉 Seed user DONE (DB KHÔNG bị reset).");
  } catch (error) {
    console.error("❌ Lỗi seedUsers:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedUsers();
