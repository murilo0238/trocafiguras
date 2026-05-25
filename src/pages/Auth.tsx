import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import trophy from "@/assets/trofeu-copa-removebg.png";

// Closed friends-only app. We synthesize an email+password from the typed
// full name so the user just types "Nome Sobrenome" to enter.
// Same name (case/accents-insensitive) = same account = same collection.
const FRIENDS_DOMAIN = "amigos.troca.local";
const FRIENDS_PWD_SALT = "troca-figurinha-amigos-2026";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

const Auth = () => {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = fullName.trim().replace(/\s+/g, " ");
    const parts = cleanedName.split(" ");
    if (parts.length < 2 || parts.some((p) => p.length < 2)) {
      toast.error("Digite seu nome e sobrenome.");
      return;
    }
    const slug = slugify(cleanedName);
    if (slug.length < 4) {
      toast.error("Nome inválido.");
      return;
    }
    const email = `${slug}@${FRIENDS_DOMAIN}`;
    const password = `${FRIENDS_PWD_SALT}.${slug}`;

    setLoading(true);
    try {
      // Try sign in first (existing friend)
      const signIn = await supabase.auth.signInWithPassword({ email, password });
      if (!signIn.error) return;

      // If invalid credentials -> try sign up (new friend)
      const signUp = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: cleanedName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (signUp.error) {
        toast.error("Não foi possível entrar. Tente outro nome.");
        return;
      }
      // After signUp, auto sign-in (since email confirm is disabled)
      const retry = await supabase.auth.signInWithPassword({ email, password });
      if (retry.error) {
        toast.error("Conta criada, mas não conseguimos entrar. Tente novamente.");
      } else {
        toast.success(`Bem-vindo, ${parts[0]}!`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error) {
        // Try creating the admin account on first run
        const signUp = await supabase.auth.signUp({
          email: adminEmail.trim(),
          password: adminPassword,
          options: {
            data: { display_name: "Administrador" },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUp.error) {
          toast.error(signUp.error.message);
        } else {
          const retry = await supabase.auth.signInWithPassword({
            email: adminEmail.trim(),
            password: adminPassword,
          });
          if (retry.error) toast.error(retry.error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm font-medium";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="header-gradient flex flex-col items-center justify-center pt-16 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 right-8 w-40 h-40 bg-gold/10 rounded-full blur-2xl" />
          <div className="absolute top-6 right-6 text-7xl opacity-10 rotate-12 select-none">⚽</div>
        </div>
        <div className="w-32 h-32 rounded-full bg-white/90 flex items-center justify-center shadow-2xl mb-4 border-4 border-white/30">
          <img src={trophy} alt="Troféu" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center drop-shadow-md uppercase tracking-wide">Troca Figurinha</h1>
        <p className="text-white/80 text-sm mt-1 text-center font-semibold">Álbum entre amigos</p>
        <p className="text-white/60 text-xs mt-1 text-center">Copa 2026</p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-8">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-2xl shadow-black/30">
            {!adminMode ? (
              <>
                <h2 className="text-xl font-bold text-foreground text-center mb-2">Entrar</h2>
                <p className="text-xs text-muted-foreground text-center mb-5">
                  Digite seu nome e sobrenome para acessar seu álbum.
                </p>
                <form onSubmit={handleFriendSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputCls}
                    autoCapitalize="words"
                    autoComplete="name"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl header-gradient text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#2a5671]/40 disabled:opacity-50"
                  >
                    {loading ? "Aguarde..." : "Entrar no álbum"}
                  </button>
                </form>
                <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
                  Sua coleção fica salva. Use sempre o mesmo nome para acessar de novo.
                </p>
                <div className="border-t border-border mt-5 pt-3 text-center">
                  <button
                    onClick={() => setAdminMode(true)}
                    className="text-[11px] text-muted-foreground/70 hover:text-primary transition-colors"
                  >
                    Acesso do administrador
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground text-center mb-5">Acesso admin</h2>
                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="E-mail do admin"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className={inputCls}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className={inputCls}
                    minLength={6}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl header-gradient text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? "Aguarde..." : "Entrar"}
                  </button>
                </form>
                <button
                  onClick={() => setAdminMode(false)}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-2 mt-3"
                >
                  ← Voltar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
