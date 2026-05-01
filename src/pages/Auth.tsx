import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "A senha deve ter ao menos 8 caracteres.";
    if (!/[A-Za-z]/.test(pwd)) return "A senha deve conter ao menos uma letra.";
    if (!/[0-9]/.test(pwd)) return "A senha deve conter ao menos um número.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um link para o seu e-mail!");
        setMode("login");
      } else if (mode === "signup") {
        const err = validatePassword(password);
        if (err) {
          toast.error(err);
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("As senhas não coincidem.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute -inset-3 bg-primary/15 rounded-full blur-xl" />
            <img src={logo} alt="Troca Figurinha" className="relative w-16 h-16 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center leading-tight">
            Álbum da Copa 2026
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Sua coleção, suas trocas
          </p>
          <div className="flex gap-1.5 mt-3 text-xl">
            <span title="México">🇲🇽</span>
            <span title="EUA">🇺🇸</span>
            <span title="Canadá">🇨🇦</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-center text-foreground mb-5">
            {mode === "login" ? "Entrar na conta" : mode === "signup" ? "Criar conta" : "Recuperar senha"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputCls}
                required
              />
            )}

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
            />

            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                minLength={mode === "login" ? 6 : 8}
                required
              />
            )}

            {mode === "signup" && (
              <>
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputCls}
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground px-1">
                  Mínimo 8 caracteres, com letras e números.
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                ? "Entrar"
                : mode === "signup"
                ? "Criar Conta"
                : "Enviar link"}
            </button>
          </form>

          <div className="flex flex-col gap-2 mt-4">
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-1"
              >
                Esqueci minha senha
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1 border-t border-border/40 pt-3"
            >
              {mode === "login"
                ? "Não tem conta? "
                : mode === "forgot"
                ? "Lembrou a senha? "
                : "Já tem conta? "}
              <span className="text-primary font-bold">
                {mode === "login" ? "Criar uma" : "Entrar"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
