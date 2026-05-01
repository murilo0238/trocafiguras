interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const variantConfig = {
  primary: {
    bg: "bg-gradient-to-br from-emerald-500 to-green-700",
    shadow: "shadow-emerald-900/60",
    badge: "⚽",
  },
  secondary: {
    bg: "bg-gradient-to-br from-sky-500 to-blue-700",
    shadow: "shadow-blue-900/60",
    badge: "🎯",
  },
  accent: {
    bg: "bg-gradient-to-br from-amber-400 to-orange-600",
    shadow: "shadow-orange-900/60",
    badge: "🔁",
  },
};

const StatCard = ({ label, value, icon, variant = "primary" }: StatCardProps) => {
  const cfg = variantConfig[variant];
  return (
    <div className={`${cfg.bg} rounded-2xl p-3 flex flex-col gap-1 relative overflow-hidden shadow-lg ${cfg.shadow}`}>
      <div className="absolute -top-1 -right-1 text-3xl opacity-15 pointer-events-none select-none">
        {cfg.badge}
      </div>
      <div className="flex items-center gap-1 text-white/75">
        <div className="w-3.5 h-3.5">{icon}</div>
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xl font-bold text-white leading-none">{value}</span>
    </div>
  );
};

export default StatCard;
