import { useState, useEffect } from "react";
import { Download, Bell, X, Smartphone, Share } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const DISMISSED_KEY = "pwa-banner-dismissed";

const InstallBanner = () => {
  const { installPrompt, isInstalled, isIOS, install, notifPermission, requestNotifications } = usePWA();
  const [step, setStep] = useState<"install" | "ios" | "notify" | "done" | "hidden">("hidden");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      if (notifPermission === "default") {
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (!dismissed) setStep("notify");
      }
      return;
    }

    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    if (installPrompt) {
      const t = setTimeout(() => setStep("install"), 1500);
      return () => clearTimeout(t);
    }

    if (isIOS) {
      const t = setTimeout(() => setStep("ios"), 1500);
      return () => clearTimeout(t);
    }
  }, [installPrompt, isInstalled, isIOS, notifPermission]);

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

        {step === "ios" && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Adicionar à tela inicial</p>
                <p className="text-xs text-muted-foreground">Acesse como um app nativo</p>
              </div>
            </div>
            <ol className="text-xs text-muted-foreground space-y-1.5 mb-4 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
                Toque no botão <Share className="w-3.5 h-3.5 inline mx-0.5 text-primary" /> <strong>Compartilhar</strong> no Safari
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
                Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
                Toque em <strong>Adicionar</strong> no canto superior direito
              </li>
            </ol>
            <button
              onClick={dismiss}
              className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Entendi
            </button>
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
