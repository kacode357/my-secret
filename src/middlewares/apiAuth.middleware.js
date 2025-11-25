// File: src/middlewares/apiAuth.middleware.js

/**
 * Middleware auth cho API (dùng session)
 * - Nếu có req.session.user -> cho qua
 * - Nếu không -> trả JSON 401
 */
function apiRequireAuth(req, res, next) {
  try {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    return res.status(401).json({
      message: "Bạn chưa đăng nhập",
    });
  } catch (error) {
    console.error("Lỗi apiRequireAuth:", error.message);
    return res.status(401).json({
      message: "Lỗi xác thực",
    });
  }
}

module.exports = apiRequireAuth;
