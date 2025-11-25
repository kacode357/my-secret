// File: public/sw.js

// Lắng sự kiện push từ server
self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.");

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "Tin nhắn mới";
  const options = {
    body: data.body || "Bạn có tin nhắn mới.",
    icon: data.icon || "/images/logo.png",
    badge: data.badge || "/images/logo.png",
    data: {
      url: data.url || "/home",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});


// Khi user click vào notification
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : "/home";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      function (clientList) {
        // Nếu tab đã mở -> focus nó, nếu chưa -> mở tab mới
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }
    )
  );
});
