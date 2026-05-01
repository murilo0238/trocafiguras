interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const variantConfig = {
  primary: {
    bg: "bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/25",
    value: "text-emerald-400",
    label: "text-emerald-300/70",
    icon: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    dot: "bg-emerald-400",
  },
  secondary: {
    bg: "bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border border-blue-500/25",
    value: "text-blue-400",
    label: "text-blue-300/70",
    icon: "text-blue-400",
    glow: "shadow-blue-500/20",
    dot: "bg-blue-400",
  },
  accent: {
    bg: "bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/25",
    value: "text-amber-400",
    label: "text-amber-300/70",
    icon: "text-amber-400",
    glow: "shadow-amber-400/20",
    dot: "bg-amber-400",
  },
};

const StatCard = ({ label, value, icon, variant = "primary" }: StatCardProps) => {
  const cfg = variantConfig[variant];

  return (
    <div className={`stat-card rounded-xl p-3 flex flex-col gap-1.5 relative overflow-hidden shadow-lg ${cfg.bg} ${cfg.glow}`}>
      <div className={`flex items-center gap-1.5 ${cfg.icon}`}>
        <div className="w-4 h-4 flex-shrink-0">{icon}</div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.label}`}>{label}</span>
      </div>
      <span className={`text-xl font-bold leading-none ${cfg.value}`}>{value}</span>
      <div className={`absolute -bottom-1 -right-1 w-12 h-12 rounded-full opacity-10 blur-xl ${cfg.dot}`} />
    </div>
  );
};

export default StatCard;
