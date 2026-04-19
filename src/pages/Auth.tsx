import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (!isLogin) {
      const err = validatePassword(password);
      if (err) {
        toast.error(err);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado!");
      } else {
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
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">📒 Meu Álbum</h1>
        <p className="text-center text-muted-foreground mb-6">Copa do Mundo 2026</p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-center text-foreground">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h2>

          {!isLogin && (
            <input
              type="text"
              placeholder="Seu nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none focus:ring-2 focus:ring-primary outline-none"
              required
            />
          )}

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none focus:ring-2 focus:ring-primary outline-none"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none focus:ring-2 focus:ring-primary outline-none"
            minLength={isLogin ? 6 : 8}
            required
          />
          {!isLogin && (
            <p className="text-xs text-muted-foreground -mt-2 px-1">
              Mínimo 8 caracteres, com letras e números.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
