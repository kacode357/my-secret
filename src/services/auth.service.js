// File: src/services/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

class AuthService {
  /**
   * Đăng nhập bằng username/email + password
   * @param {Object} payload
   * @param {string} payload.identifier  // username hoặc email
   * @param {string} payload.password
   * @returns {Promise<{ user: any, token: string }>}
   */
  async login(payload = {}) {
    const { identifier, password } = payload;

    if (!identifier || !password) {
      const err = new Error("Thiếu identifier hoặc password");
      err.statusCode = 400;
      throw err;
    }

    // tìm user theo username hoặc email (đưa về lowercase cho chắc)
    const normalized = String(identifier).trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    });

    if (!user || !user.passwordHash) {
      const err = new Error("Sai tài khoản hoặc mật khẩu");
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || "");

    if (!isMatch) {
      const err = new Error("Sai tài khoản hoặc mật khẩu");
      err.statusCode = 401;
      throw err;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      const err = new Error("Thiếu JWT_SECRET trong env");
      err.statusCode = 500;
      throw err;
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const payloadToken = {
      sub: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
    };

    const token = jwt.sign(payloadToken, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });

    // lọc ra data safe trả về client (không trả passwordHash)
    const safeUser = {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      email: user.email,
      status: user.status,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      token,
    };
  }
}

module.exports = new AuthService();
