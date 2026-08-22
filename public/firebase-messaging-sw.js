// public/firebase-messaging-sw.js
importScripts(
    "https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyDxY5BgLTFUs5uTwaZ8OFq_RKbF51uh2Ls",
    authDomain: "med4u-c3db7.firebaseapp.com",
    projectId: "med4u-c3db7",
    storageBucket: "med4u-c3db7.firebasestorage.app",
    messagingSenderId: "801202238162",
    appId: "1:801202238162:web:d1ad7672cd44b4dea0f30b",
});

// Initialize messaging
const messaging = firebase.messaging();

// 🔹 Background message handler (when app is closed)
messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Background message received:", payload);

    // Emergency notifications have priority styling
    const isEmergency = payload.data?.type === "emergency";
    
    const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body,
        icon: isEmergency ? "/emergency-icon.png" : "/vite.svg",
        badge: "/vite.svg",
        data: payload.data, // Pass all data for click handling
        requireInteraction: isEmergency,
        tag: payload.data?.notificationId || "notification",
        actions: isEmergency ? [
            { action: "view", title: "View Emergency", icon: "/view-icon.png" },
            { action: "call", title: "Call Patient", icon: "/call-icon.png" }
        ] : [],
        vibrate: isEmergency ? [200, 100, 200, 100, 200] : undefined,
        renotify: true,
        silent: false
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔹 Notification click handler - Navigate to /notifications
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData.route === "/notifications" 
        ? `${self.location.origin}/notifications`
        : `${self.location.origin}/`;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Focus existing tab if it matches notifications page
            for (const client of clientList) {
                if (client.url.includes("/notifications") && "focus" in client) {
                    return client.focus();
                }
            }
            // Open new tab/window to notifications
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});