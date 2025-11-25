// File: src/scripts/resetDb.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../config/database");
const { User } = require("../models");

async function seedUsers() {
  try {
    await connectDb();

    // CHỐNG NGÁO: không cho seed khi đang production (tùy mày giữ hay bỏ)
    if (process.env.NODE_ENV === "production") {
      console.error("❌ ĐANG Ở PRODUCTION, KHÔNG ĐƯỢC SEED USER TỪ SCRIPT NÀY!");
      process.exit(1);
    }

    console.log("✅ Đã kết nối DB, bắt đầu seed user…");

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
    ];

    // Dùng upsert để không bị tạo trùng khi chạy lại script
    const ops = usersData.map((u) => ({
      updateOne: {
        filter: { username: u.username },
        update: { $set: u },
        upsert: true,
      },
    }));

    const result = await User.bulkWrite(ops);
    console.log("🚀 Seed user xong.");
    console.log("   matched:", result.matchedCount);
    console.log("   upserted:", result.upsertedCount);
    console.log("   modified:", result.modifiedCount);
    console.log("🔑 Mật khẩu mặc định cho tất cả user: 123456");
  } catch (error) {
    console.error("❌ Lỗi seedUsers:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedUsers();
