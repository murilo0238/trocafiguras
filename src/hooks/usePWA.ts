import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOSDevice = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(navigator as any).standalone;

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado como PWA
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (inStandalone) {
      setIsInstalled(true);
      return;
    }

    setIsIOS(isIOSDevice());

    // Prompt pode ter sido capturado antes do React montar (main.tsx)
    if ((window as any).__pwaInstallPrompt) {
      setInstallPrompt((window as any).__pwaInstallPrompt);
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

  return { installPrompt, isInstalled, isIOS, install, notifPermission, requestNotifications };
};
