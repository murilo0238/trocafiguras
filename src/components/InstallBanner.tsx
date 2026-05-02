import { useState, useEffect } from "react";
import { Download, Bell, X, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const DISMISSED_KEY = "pwa-banner-dismissed";

const InstallBanner = () => {
  const { installPrompt, isInstalled, install, notifPermission, requestNotifications } = usePWA();
  const [step, setStep] = useState<"install" | "notify" | "done" | "hidden">("hidden");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      // App já instalado — só pede notificação se ainda não foi concedida
      if (notifPermission === "default") {
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (!dismissed) setStep("notify");
      }
      return;
    }

    if (installPrompt) {
      const dismissed = sessionStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        // Pequeno delay para não aparecer imediatamente ao abrir
        const t = setTimeout(() => setStep("install"), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [installPrompt, isInstalled, notifPermission]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setStep("hidden");
  };

  const handleInstall = async () => {
    setLoading(true);
    const accepted = await install();
    setLoading(false);
    if (accepted) {
      setStep("notify");
    } else {
      dismiss();
    }
  };

  const handleNotify = async () => {
    setLoading(true);
    await requestNotifications();
    setLoading(false);
    setStep("done");
    setTimeout(() => setStep("hidden"), 2500);
  };

  if (step === "hidden") return null;

  if (step === "done") {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
        <Bell className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-semibold">Notificações ativadas!</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">

        {/* Fechar */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {step === "install" && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Adicionar à tela inicial</p>
                <p className="text-xs text-muted-foreground">Acesse mais rápido e receba notificações</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Agora não
              </button>
              <button
                onClick={handleInstall}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <Download className="w-4 h-4" />
                {loading ? "Instalando..." : "Instalar"}
              </button>
            </div>
          </>
        )}

        {step === "notify" && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Ativar notificações</p>
                <p className="text-xs text-muted-foreground">Receba alertas de trocas e pedidos de amizade</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Agora não
              </button>
              <button
                onClick={handleNotify}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <Bell className="w-4 h-4" />
                {loading ? "Ativando..." : "Ativar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallBanner;
