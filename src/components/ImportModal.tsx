import { useState } from "react";
import { X, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { parseImportText } from "@/utils/parseImportText";
import { TOTAL_STICKERS } from "@/data/teams";

interface Props {
  onClose: () => void;
  onImport: (text: string) => Promise<{ imported: number; unknown: string[] }>;
}

type Step = "paste" | "preview" | "importing" | "done";

const ImportModal = ({ onClose, onImport }: Props) => {
  const [text, setText] = useState("");
  const [step, setStep] = useState<Step>("paste");
  const [preview, setPreview] = useState<{
    collected: number;
    missing: number;
    duplicates: number;
    unknown: string[];
  } | null>(null);
  const [error, setError] = useState("");

  const handlePreview = () => {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) { setError("Cole o texto exportado do outro app."); return; }
    if (!trimmed.includes("❌") && !trimmed.includes("Faltam")) {
      setError("Texto não reconhecido. Copie o texto completo exportado pelo app.");
      return;
    }
    const parsed = parseImportText(trimmed);
    const missing = parsed.missing.size;
    const duplicates = parsed.duplicates.size;
    const collected = TOTAL_STICKERS - missing;
    setPreview({ collected, missing, duplicates, unknown: parsed.unknown });
    setStep("preview");
  };

  const handleImport = async () => {
    setStep("importing");
    try {
      await onImport(text.trim());
      setStep("done");
    } catch (e: any) {
      setError(e?.message || "Erro ao importar. Tente novamente.");
      setStep("preview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="font-bold text-foreground">Importar coleção</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cole o texto exportado pelo outro app
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">

          {/* Step: paste */}
          {(step === "paste" || step === "preview") && (
            <>
              <textarea
                className="w-full h-44 rounded-xl bg-muted border border-border px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                placeholder={"Cole aqui o texto exportado:\n\n🏆 Copa 2026 — ❌ Faltam...\n\n❌ Faltam\n🌟 Introdução:\nFWC2, FWC3...\n\n🔁 Repetidas\n..."}
                value={text}
                onChange={(e) => { setText(e.target.value); setStep("paste"); setPreview(null); setError(""); }}
              />

              {error && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Preview card */}
              {step === "preview" && preview && (
                <div className="rounded-xl bg-muted border border-border p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground mb-3">O que será importado:</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2">
                      <p className="text-lg font-bold text-emerald-500">{preview.collected}</p>
                      <p className="text-[10px] text-muted-foreground">Tenho</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 py-2">
                      <p className="text-lg font-bold text-red-500">{preview.missing}</p>
                      <p className="text-[10px] text-muted-foreground">Faltam</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 py-2">
                      <p className="text-lg font-bold text-amber-500">{preview.duplicates}</p>
                      <p className="text-[10px] text-muted-foreground">c/ repetidas</p>
                    </div>
                  </div>
                  {preview.unknown.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      ⚠️ {preview.unknown.length} figurinha(s) não reconhecida(s) serão ignoradas
                    </p>
                  )}
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                    Isso vai substituir sua coleção atual.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                {step === "paste" ? (
                  <button
                    onClick={handlePreview}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Upload className="w-4 h-4" />
                    Analisar
                  </button>
                ) : (
                  <button
                    onClick={handleImport}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar import
                  </button>
                )}
              </div>
            </>
          )}

          {/* Step: importing */}
          {step === "importing" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-foreground">Importando...</p>
              <p className="text-xs text-muted-foreground">Salvando sua coleção</p>
            </div>
          )}

          {/* Step: done */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-bold text-foreground">Coleção importada!</p>
              <p className="text-xs text-muted-foreground">Sua coleção foi atualizada com sucesso.</p>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
