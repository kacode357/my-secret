// File: src/scripts/resetDb.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../config/database");
const { User } = require("../models");

async function resetDb() {
  try {
    await connectDb();

    // CHỐNG NGÁO: không cho drop DB khi đang production
    if (process.env.NODE_ENV === "production") {
      console.error("❌ ĐANG Ở PRODUCTION, KHÔNG ĐƯỢC RESET DB!");
      process.exit(1);
    }

    console.log("✅ Đã kết nối DB, bắt đầu DROP database...");

    // drop luôn cả database hiện tại
    await mongoose.connection.db.dropDatabase();
    console.log("🗑️ Đã xóa toàn bộ database hiện tại.");

    // ===== SEED LẠI DATA MẶC ĐỊNH Ở ĐÂY =====

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

    await User.insertMany(usersData);
    console.log("🚀 Seed xong 3 user (password: 123456)");

    console.log("🎉 RESET DB + SEED DONE.");
  } catch (error) {
    console.error("❌ Lỗi resetDb:", error);
    process.exit(1);
  } finally {
    // thoát script cho sạch
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetDb();
