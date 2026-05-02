import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MapPin } from "lucide-react";

// Fix default marker icons broken by Vite bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  open: boolean;
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

const LocationPickerMap = ({ open, initialLat, initialLng, onConfirm, onClose }: Props) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open) return;

    const init = async () => {
      // If we already have coords, use them; otherwise get GPS
      if (initialLat != null && initialLng != null) {
        setPos({ lat: initialLat, lng: initialLng });
      } else {
        setLocating(true);
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
              setLocating(false);
              resolve();
            },
            () => {
              // São Paulo as fallback
              setPos({ lat: -23.5505, lng: -46.6333 });
              setLocating(false);
              resolve();
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }
    };

    init();
  }, [open, initialLat, initialLng]);

  useEffect(() => {
    if (!open || !pos || !containerRef.current) return;

    // Small delay to let the dialog finish its CSS transition before mounting the map
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }

      const map = L.map(containerRef.current!).setView([pos.lat, pos.lng], 16);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([pos.lat, pos.lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        setPos({ lat, lng });
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, pos?.lat, pos?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    if (!pos) return;
    onConfirm(pos.lat, pos.lng);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-primary flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Confirmar ponto de troca
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Arraste o marcador ou toque no mapa para ajustar o ponto exato.
          </p>
        </DialogHeader>

        {locating ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Obtendo localização GPS...</p>
          </div>
        ) : (
          <div ref={containerRef} style={{ height: 340, width: "100%" }} />
        )}

        {pos && (
          <p className="text-[10px] text-center text-muted-foreground px-4 py-1">
            {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
          </p>
        )}

        <div className="flex gap-2 px-4 pb-4 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!pos}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Confirmar local
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerMap;
