// Push notification handler for the service worker
// This file is used by vite-plugin-pwa to add push event handling

self.addEventListener("push", (event) => {
  let data = {
    title: "GhalaLive",
    body: "إشعار جديد",
    icon: "/pwa-192x192.png",
    data: { url: "/" },
    tag: "default",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/pwa-192x192.png",
      tag: data.tag,
      data: data.data,
      vibrate: [200, 100, 200],
      dir: "rtl",
      lang: "ar",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
