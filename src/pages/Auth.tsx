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
        if (err) { toast.error(err); setLoading(false); return; }
        if (password !== confirmPassword) { toast.error("As senhas não coincidem."); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topo com gradiente */}
      <div className="header-gradient flex flex-col items-center justify-center pt-16 pb-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-orange-300/10 rounded-full blur-2xl" />
        </div>

        <div className="relative w-20 h-20 mb-5">
          <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg" />
          <div className="relative w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl">
            <img src={logo} alt="logo" className="w-14 h-14 object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center">Álbum Copa 2026</h1>
        <p className="text-white/70 text-sm mt-1 text-center">Colecione · Troque · Conclua</p>
        <div className="flex gap-3 mt-4 text-2xl">
          <span>🇲🇽</span><span>🇺🇸</span><span>🇨🇦</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-background flex items-start justify-center px-4 pt-8 pb-8">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-black/10">
            <h2 className="text-xl font-bold text-foreground text-center mb-5">
              {mode === "login" ? "Entrar na conta" : mode === "signup" ? "Criar conta" : "Recuperar senha"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <input type="text" placeholder="Seu nome" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} className={inputCls} required />
              )}

              <input type="email" placeholder="E-mail" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputCls} required />

              {mode !== "forgot" && (
                <input type="password" placeholder="Senha" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls} minLength={mode === "login" ? 6 : 8} required />
              )}

              {mode === "signup" && (
                <>
                  <input type="password" placeholder="Confirmar senha" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls} minLength={8} required />
                  <p className="text-xs text-muted-foreground px-1">
                    Mínimo 8 caracteres, com letras e números.
                  </p>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl header-gradient text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar Conta" : "Enviar link"}
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot")}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-1">
                  Esqueci minha senha
                </button>
              )}
              <div className="border-t border-border pt-3">
                <button type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {mode === "login" ? "Não tem conta? " : mode === "forgot" ? "Lembrou a senha? " : "Já tem conta? "}
                  <span className="text-primary font-bold">
                    {mode === "login" ? "Criar uma" : "Entrar"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
