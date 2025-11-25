// File: src/config/webpush.js
const webPush = require("web-push");

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (!publicKey || !privateKey) {
  console.warn(
    "⚠️ VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY chưa được set trong .env. Web Push sẽ không hoạt động."
  );
} else {
  webPush.setVapidDetails(subject, publicKey, privateKey);
  console.log("✅ web-push VAPID configured");
}

module.exports = webPush;
