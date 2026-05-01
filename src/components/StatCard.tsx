interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const variantConfig = {
  primary: {
    bg: "bg-gradient-to-br from-violet-500 to-purple-700",
    shadow: "shadow-violet-400/40",
    emoji: "⚽",
  },
  secondary: {
    bg: "bg-gradient-to-br from-sky-400 to-blue-600",
    shadow: "shadow-sky-400/40",
    emoji: "🔍",
  },
  accent: {
    bg: "bg-gradient-to-br from-orange-400 to-amber-500",
    shadow: "shadow-orange-400/40",
    emoji: "🔁",
  },
};

const StatCard = ({ label, value, icon, variant = "primary" }: StatCardProps) => {
  const cfg = variantConfig[variant];

  return (
    <div className={`${cfg.bg} rounded-2xl p-3.5 flex flex-col gap-1 relative overflow-hidden shadow-lg ${cfg.shadow}`}>
      <div className="absolute -top-2 -right-2 text-4xl opacity-20 pointer-events-none select-none">
        {cfg.emoji}
      </div>
      <div className="flex items-center gap-1.5 text-white/80">
        <div className="w-4 h-4">{icon}</div>
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white leading-none drop-shadow">{value}</span>
    </div>
  );
};

export default StatCard;
