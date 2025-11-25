// File: src/scripts/genVapid.js
const webPush = require("web-push");

function genVapid() {
  const vapidKeys = webPush.generateVAPIDKeys();

  console.log("VAPID_PUBLIC_KEY=");
  console.log(vapidKeys.publicKey);
  console.log("\nVAPID_PRIVATE_KEY=");
  console.log(vapidKeys.privateKey);
  console.log(
    "\nNhớ copy 2 key này bỏ vào file .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY"
  );
}

genVapid();
