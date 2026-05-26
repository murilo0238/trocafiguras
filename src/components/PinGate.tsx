import { useState, useRef, useEffect } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hashPin } from "@/lib/pinHash";
import { toast } from "sonner";

interface Props {
  userId: string;
  mode: "setup" | "verify";
  storedHash: string | null;
  onSuccess: () => void;
}

const PIN_SESSION_KEY = "pin_verified";

export function markPinVerified() {
  sessionStorage.setItem(PIN_SESSION_KEY, "1");
}

export function isPinVerified() {
  return sessionStorage.getItem(PIN_SESSION_KEY) === "1";
}

const PinGate = ({ userId, mode, storedHash, onSuccess }: Props) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [confirm, setConfirm] = useState<string[]>(Array(6).fill(""));
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [step]);

  const pinValue = (arr: string[]) => arr.join("");

  const handleDigit = (
    idx: number,
    value: string,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...arr];
    next[idx] = value.slice(-1);
    setArr(next);
    setError("");
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (e.key === "Backspace" && !arr[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const getPin = (arr: string[]) => {
    const filled = arr.filter(Boolean);
    return filled.length >= 4 ? filled.join("") : null;
  };

  const handleVerify = async () => {
    const pin = getPin(digits);
    if (!pin) { setError("Digite seu PIN (4–6 dígitos)."); return; }
    try {
      const h = await hashPin(pin);
      if (h !== storedHash) { setError("PIN incorreto. Tente novamente."); setDigits(Array(6).fill("")); inputRefs.current[0]?.focus(); return; }
      markPinVerified();
      onSuccess();
    } catch (err) {
      console.error("Erro ao verificar PIN:", err);
      setError("Erro ao verificar PIN. Tente novamente.");
    }
  };

  const handleSetupNext = () => {
    const pin = getPin(digits);
    if (!pin) { setError("Mínimo 4 dígitos."); return; }
    setStep("confirm");
    setConfirm(Array(6).fill(""));
    setError("");
  };

  const handleSetupSave = async () => {
    const pin = getPin(digits);
    const pinConf = getPin(confirm);
    if (!pin || !pinConf) { setError("Mínimo 4 dígitos."); return; }
    if (pin !== pinConf) { setError("Os PINs não coincidem."); setConfirm(Array(6).fill("")); inputRefs.current[0]?.focus(); return; }
    setSaving(true);
    try {
      const h = await hashPin(pin);
      const { error: dbErr } = await (supabase as any)
        .from("profiles")
        .update({ pin_hash: h })
        .eq("user_id", userId);
      if (dbErr) throw dbErr;
      toast.success("PIN criado com sucesso!");
      markPinVerified();
      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar PIN:", err);
      toast.error("Erro ao salvar PIN. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const renderInputs = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    offset = 0
  ) => (
    <div className="flex justify-center gap-2 mt-6 mb-2">
      {Array(6).fill(0).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i + offset] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={arr[i]}
          onChange={(e) => handleDigit(i, e.target.value, arr, setArr)}
          onKeyDown={(e) => handleKeyDown(i, e, arr, setArr)}
          className={`w-11 h-14 rounded-xl text-center text-2xl font-bold bg-muted border-2 outline-none transition-all ${
            arr[i] ? "border-primary text-foreground" : "border-border text-muted-foreground"
          } focus:border-primary/70 focus:ring-2 focus:ring-primary/20`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        {mode === "verify" ? (
          <>
            <h2 className="text-xl font-bold text-foreground">Digite seu PIN</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-2">Para acessar seu álbum</p>
            {renderInputs(digits, setDigits)}
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={!getPin(digits)}
              className="w-full mt-5 py-3 rounded-xl header-gradient text-white font-bold disabled:opacity-40"
            >
              Entrar
            </button>
          </>
        ) : step === "enter" ? (
          <>
            <h2 className="text-xl font-bold text-foreground">Criar PIN</h2>
            <p className="text-sm text-muted-foreground mt-1">Crie um PIN de 4 a 6 dígitos para proteger seu álbum</p>
            {renderInputs(digits, setDigits)}
            <p className="text-[11px] text-muted-foreground mt-1">{pinValue(digits).length}/6 dígitos (mín. 4)</p>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            <button
              onClick={handleSetupNext}
              disabled={!getPin(digits)}
              className="w-full mt-5 py-3 rounded-xl header-gradient text-white font-bold disabled:opacity-40"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground">Confirme o PIN</h2>
            <p className="text-sm text-muted-foreground mt-1">Digite o PIN novamente para confirmar</p>
            {renderInputs(confirm, setConfirm)}
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
            <button
              onClick={handleSetupSave}
              disabled={!getPin(confirm) || saving}
              className="w-full mt-5 py-3 rounded-xl header-gradient text-white font-bold disabled:opacity-40"
            >
              {saving ? "Salvando…" : "Salvar PIN"}
            </button>
            <button
              onClick={() => { setStep("enter"); setError(""); }}
              className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PinGate;
