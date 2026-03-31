interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const FLAGS: Record<string, string> = {
  primary: "🇲🇽",
  secondary: "🇺🇸",
  accent: "🇨🇦",
};

const StatCard = ({ label, value, icon, variant = "primary" }: StatCardProps) => {
  const variantStyles = {
    primary: "bg-[hsl(145,63%,35%)] text-white",
    secondary: "bg-[hsl(220,60%,45%)] text-white",
    accent: "bg-[hsl(0,80%,50%)] text-white",
  };

  return (
    <div
      className={`stat-card rounded-lg p-3 flex items-center gap-3 relative overflow-hidden ${variantStyles[variant]}`}
    >
      <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-15 pointer-events-none select-none">
        {FLAGS[variant]}
      </span>
      <div className="flex-shrink-0 opacity-80 relative z-10">{icon}</div>
      <div className="flex flex-col relative z-10">
        <span className="text-xs font-medium opacity-90">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
