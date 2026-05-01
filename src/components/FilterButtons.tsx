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
    <div className="flex gap-2 justify-center mt-2">
      {filters.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
            activeFilter === key
              ? "bg-white text-violet-700 border-white shadow-md shadow-white/20 scale-105"
              : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
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
