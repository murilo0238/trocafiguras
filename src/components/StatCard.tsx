interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const StatCard = ({ label, value, icon, variant = "primary" }: StatCardProps) => {
  const variantStyles = {
    primary: "dashboard-gradient text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  return (
    <div
      className={`stat-card rounded-lg p-3 flex items-center gap-3 ${variantStyles[variant]}`}
    >
      <div className="flex-shrink-0 opacity-80">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs font-medium opacity-80">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
