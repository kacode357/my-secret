// File: src/middlewares/uiAuth.middleware.js

/**
 * Middleware bảo vệ các trang UI (EJS)
 * - Đọc user từ req.session.user
 * - Nếu OK -> gắn req.user + res.locals.currentUser
 * - Nếu fail -> redirect /login
 */
function uiRequireAuth(req, res, next) {
  try {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      res.locals.currentUser = req.session.user;
      return next();
    }

    return res.redirect("/login");
  } catch (error) {
    console.error("Lỗi uiRequireAuth:", error.message);
    return res.redirect("/login");
  }
}

module.exports = uiRequireAuth;
