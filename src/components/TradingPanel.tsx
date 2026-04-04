import { useState } from "react";
import { MapPin, RefreshCw, Users, Send } from "lucide-react";
import { useTrading } from "@/hooks/useTrading";
import { useTradeRequests } from "@/hooks/useTradeRequests";
import QRCodePanel from "@/components/QRCodePanel";
import TradeRequestsPanel from "@/components/TradeRequestsPanel";

const TradingPanel = () => {
  const { matches, loading, radius, setRadius, findMatches, myLocation } = useTrading();
  const { sendTradeRequest } = useTradeRequests();
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);

  const handleProposeTrade = async (match: typeof matches[0]) => {
    const count = Math.min(match.iCanGive.length, match.theyCanGive.length);
    await sendTradeRequest(
      match.userId,
      match.iCanGive.slice(0, count),
      match.theyCanGive.slice(0, count)
    );
  };

  return (
    <div className="space-y-4">
      {/* QR Code Section */}
      <QRCodePanel onUserScanned={(userId) => setScannedUserId(userId)} />

      {/* Trade Requests */}
      <TradeRequestsPanel
        scannedUserId={scannedUserId}
        onClearScanned={() => setScannedUserId(null)}
      />

      {/* Radius control */}
      <div className="bg-card rounded-xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Encontrar Trocas</h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Raio de busca: <span className="font-bold text-foreground">{radius} km</span>
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>

        <button
          onClick={findMatches}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Users className="w-4 h-4" />
          )}
          {loading ? "Buscando..." : "Buscar Trocas"}
        </button>

        {myLocation && (
          <p className="text-[10px] text-muted-foreground text-center">
            📍 Localização ativa
          </p>
        )}
      </div>

      {/* Trade matches */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-sm px-1">
            🤝 {matches.length} colecionador{matches.length > 1 ? "es" : ""} encontrado{matches.length > 1 ? "s" : ""}
          </h3>

          {matches.map((match, idx) => (
            <div
              key={match.userId}
              className="bg-card rounded-xl p-4 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-foreground ml-2">{match.displayName}</span>
                </div>
                <span className="text-xs text-muted-foreground">📍 {match.distance} km</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-accent/30 rounded-lg p-2">
                  <p className="font-bold text-accent-foreground">Você dá</p>
                  <p className="text-foreground">{match.iCanGive.length} figurinha{match.iCanGive.length > 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-0.5 mt-1 max-h-16 overflow-y-auto">
                    {match.iCanGive.slice(0, 10).map((id) => (
                      <span key={id} className="bg-secondary text-secondary-foreground text-[8px] px-1 rounded">
                        {id}
                      </span>
                    ))}
                    {match.iCanGive.length > 10 && (
                      <span className="text-muted-foreground text-[8px]">+{match.iCanGive.length - 10}</span>
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="font-bold text-primary">Você recebe</p>
                  <p className="text-foreground">{match.theyCanGive.length} figurinha{match.theyCanGive.length > 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-0.5 mt-1 max-h-16 overflow-y-auto">
                    {match.theyCanGive.slice(0, 10).map((id) => (
                      <span key={id} className="bg-primary/20 text-primary text-[8px] px-1 rounded">
                        {id}
                      </span>
                    ))}
                    {match.theyCanGive.length > 10 && (
                      <span className="text-muted-foreground text-[8px]">+{match.theyCanGive.length - 10}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-primary">
                  ⚡ {match.tradeScore} troca{match.tradeScore > 1 ? "s" : ""} possíve{match.tradeScore > 1 ? "is" : "l"}
                </p>
                <button
                  onClick={() => handleProposeTrade(match)}
                  className="py-1.5 px-3 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] flex items-center gap-1 hover:opacity-90"
                >
                  <Send className="w-3 h-3" /> Propor Troca
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && matches.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Toque em "Buscar Trocas" para encontrar colecionadores por perto
        </p>
      )}
    </div>
  );
};

export default TradingPanel;
