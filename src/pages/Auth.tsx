import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import trophy from "@/assets/trofeu-copa-removebg.png";
import { usePWA } from "@/hooks/usePWA";
import { Download, Share } from "lucide-react";

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

// Returns edit distance between two strings
const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

const findSimilarName = async (inputSlug: string): Promise<string | null> => {
  const { data: profiles } = await supabase.from("profiles").select("display_name");
  if (!profiles?.length) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const p of profiles) {
    if (!p.display_name) continue;
    const dist = levenshtein(inputSlug, slugify(p.display_name));
    if (dist > 0 && dist <= 2 && dist < bestDist) {
      bestDist = dist;
      best = p.display_name;
    }
  }
  return best;
};

const Auth = () => {
  const { installPrompt, isInstalled, isIOS, install } = usePWA();
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const [pendingNewName, setPendingNewName] = useState<string | null>(null);

  const doSignInOrCreate = async (cleanedName: string) => {
    const slug = slugify(cleanedName);
    const email = `${slug}@${FRIENDS_DOMAIN}`;
    const password = `${FRIENDS_PWD_SALT}.${slug}`;

    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (!signIn.error) return true;
    return false;
  };

  const doCreateAccount = async (cleanedName: string) => {
    const slug = slugify(cleanedName);
    const email = `${slug}@${FRIENDS_DOMAIN}`;
    const password = `${FRIENDS_PWD_SALT}.${slug}`;
    const parts = cleanedName.split(" ");

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
    const retry = await supabase.auth.signInWithPassword({ email, password });
    if (retry.error) {
      toast.error("Conta criada, mas não conseguimos entrar. Tente novamente.");
    } else {
      toast.success(`Bem-vindo, ${parts[0]}!`);
    }
  };

  const handleFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestedName(null);
    setPendingNewName(null);
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

    setLoading(true);
    try {
      const ok = await doSignInOrCreate(cleanedName);
      if (ok) return;

      // Sign in failed — check for similar existing names before creating account
      const similar = await findSimilarName(slug);
      if (similar) {
        setSuggestedName(similar);
        setPendingNewName(cleanedName);
        return;
      }

      // No similar name found — create new account
      await doCreateAccount(cleanedName);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuggestion = async () => {
    if (!suggestedName) return;
    setLoading(true);
    setSuggestedName(null);
    setPendingNewName(null);
    try {
      const ok = await doSignInOrCreate(suggestedName);
      if (!ok) toast.error("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSuggestion = async () => {
    const name = pendingNewName;
    setSuggestedName(null);
    setPendingNewName(null);
    if (!name) return;
    setLoading(true);
    try {
      await doCreateAccount(name);
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
                    onChange={(e) => { setFullName(e.target.value); setSuggestedName(null); setPendingNewName(null); }}
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

                {suggestedName && (
                  <div className="mt-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold mb-1">Você quis dizer?</p>
                    <p className="text-base font-bold text-foreground mb-3">"{suggestedName}"</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmSuggestion}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        Sim, sou eu
                      </button>
                      <button
                        onClick={handleRejectSuggestion}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold text-sm hover:bg-muted/80 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        Não, criar conta
                      </button>
                    </div>
                  </div>
                )}

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

          {/* Botão instalar app */}
          {!isInstalled && (installPrompt || isIOS) && (
            <div className="mt-4">
              <button
                onClick={async () => {
                  if (isIOS) {
                    setShowIOSHint((v) => !v);
                  } else {
                    await install();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                {isIOS ? <Share className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                Adicionar à tela inicial
              </button>

              {isIOS && showIOSHint && (
                <div className="mt-2 p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1.5">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
                    Toque em <Share className="w-3.5 h-3.5 inline mx-0.5 text-primary" /> <strong className="text-foreground">Compartilhar</strong> no Safari
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
                    Toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
                    Toque em <strong className="text-foreground">Adicionar</strong> no canto superior direito
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
