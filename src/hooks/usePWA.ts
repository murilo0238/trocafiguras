import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Verifica se já está instalado como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
    return outcome === "accepted";
  };

  const requestNotifications = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) return "denied";
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);

    if (permission === "granted") {
      // Registra o service worker para push (se ainda não registrado)
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        // Mostra uma notificação de boas-vindas local
        reg.showNotification("Notificações ativadas! 🎉", {
          body: "Você receberá alertas de trocas e pedidos de amizade.",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }
    }

    return permission;
  };

  return { installPrompt, isInstalled, install, notifPermission, requestNotifications };
};
