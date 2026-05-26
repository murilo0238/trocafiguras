/** Dispara notificação via Service Worker (melhor em PWA/mobile) ou Notification API */
export async function sendNotification(
  title: string,
  body: string,
  tag: string,
  url = "/"
) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (document.visibilityState !== "hidden") return; // app em foco: toast já cobre

  const opts: NotificationOptions = {
    body,
    icon: "/icon-192.svg",
    badge: "/favicon.ico",
    tag,
    data: { url },
    // @ts-ignore — vibrate é válido em Android PWA
    vibrate: [100, 50, 100],
  };

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      reg.showNotification(title, opts);
      return;
    }
  }

  new Notification(title, opts);
}
