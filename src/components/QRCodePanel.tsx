import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/hooks/useAuth";
import { Camera, QrCode, X } from "lucide-react";
import { toast } from "sonner";

interface QRCodePanelProps {
  onUserScanned: (userId: string) => void;
}

const QRCodePanel = ({ onUserScanned }: QRCodePanelProps) => {
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const qrValue = user ? JSON.stringify({ type: "copa-trade", userId: user.id }) : "";

  const startScanner = async () => {
    setShowScanner(true);

    // Wait for DOM to render
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              if (data.type === "copa-trade" && data.userId) {
                if (data.userId === user?.id) {
                  toast.error("Você não pode trocar consigo mesmo!");
                  return;
                }
                onUserScanned(data.userId);
                stopScanner();
              } else {
                toast.error("QR Code inválido.");
              }
            } catch {
              toast.error("QR Code inválido.");
            }
          },
          () => {} // Ignore scan failures
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        toast.error("Não foi possível acessar a câmera.");
        setShowScanner(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setShowScanner(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { setShowMyQR(!showMyQR); if (showScanner) stopScanner(); }}
          className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            showMyQR
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <QrCode className="w-4 h-4" />
          Meu QR Code
        </button>
        <button
          onClick={() => {
            if (showScanner) stopScanner();
            else { setShowMyQR(false); startScanner(); }
          }}
          className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            showScanner
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Camera className="w-4 h-4" />
          Escanear QR
        </button>
      </div>

      {/* My QR Code */}
      {showMyQR && (
        <div className="bg-card rounded-xl p-4 shadow-md flex flex-col items-center space-y-2">
          <p className="text-sm font-bold text-foreground">Mostre este código para trocar</p>
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={qrValue} size={200} />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            O outro colecionador deve escanear este QR Code
          </p>
        </div>
      )}

      {/* Scanner */}
      {showScanner && (
        <div className="bg-card rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Escaneando...</p>
            <button onClick={stopScanner} className="p-1 rounded-full hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
          <p className="text-[10px] text-muted-foreground text-center">
            Aponte a câmera para o QR Code do outro colecionador
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCodePanel;
