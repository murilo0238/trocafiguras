interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const variantConfig = {
  primary: {
    bg: "bg-gradient-to-br from-[#cdb87f] to-[#9e844a]",
    shadow: "shadow-[#9e844a]/40",
    badge: "⚽",
  },
  secondary: {
    bg: "bg-gradient-to-br from-[#8da4b4] to-[#2a5671]",
    shadow: "shadow-[#2a5671]/40",
    badge: "🎯",
  },
  accent: {
    bg: "bg-gradient-to-br from-[#3b6d8c] to-[#1a3a4c]",
    shadow: "shadow-[#1a3a4c]/60",
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
