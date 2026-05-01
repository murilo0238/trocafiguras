type FilterType = "all" | "missing" | "duplicates";

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string; emoji: string }[] = [
  { key: "all", label: "Todas", emoji: "🗂️" },
  { key: "missing", label: "Faltam", emoji: "❌" },
  { key: "duplicates", label: "Repetidas", emoji: "🔁" },
];

const FilterButtons = ({ activeFilter, onFilterChange }: FilterButtonsProps) => {
  return (
    <div className="flex gap-2 justify-center">
      {filters.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeFilter === key
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <span>{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
