import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Captura ANTES do React montar — o evento beforeinstallprompt dispara
// cedo demais para ser capturado dentro de um useEffect
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
