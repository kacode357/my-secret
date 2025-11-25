// File: src/controllers/ui/auth.controller.js
const AuthService = require("../../services/auth.service");

const UiAuthController = {
  // GET /login - render form login
  getLoginPage(req, res) {
    return res.render("login", {
      title: "Login Chat",
      error: null,
    });
  },

  // POST /login - xử lý login, gọi service + handle lỗi
  async postLogin(req, res) {
    const { identifier, password } = req.body;

    try {
      const result = await AuthService.login({ identifier, password });
      // result: { token, user }

      // Lưu user vào session
      req.session.user = {
        _id: result.user._id,
        username: result.user.username,
        displayName: result.user.displayName,
        avatarUrl: result.user.avatarUrl,
        status: result.user.status,
      };

      // Lưu token vào session để debug / dùng nội bộ
      req.session.token = result.token;

      return res.redirect("/home");
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const msg =
        statusCode === 500 ? "Có lỗi hệ thống, thử lại sau." : error.message;

      return res.status(statusCode).render("login", {
        title: "Login Chat",
        error: msg,
      });
    }
  },
};

module.exports = UiAuthController;
