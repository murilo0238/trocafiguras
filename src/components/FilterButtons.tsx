type FilterType = "all" | "missing" | "duplicates";

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string; emoji: string }[] = [
  { key: "all", label: "Todas", emoji: "🗂️" },
  { key: "missing", label: "Faltam", emoji: "🎯" },
  { key: "duplicates", label: "Repetidas", emoji: "🔁" },
];

const FilterButtons = ({ activeFilter, onFilterChange }: FilterButtonsProps) => {
  return (
    <div className="flex gap-2 justify-center mt-2">
      {filters.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
            activeFilter === key
              ? "bg-amber-400 text-amber-900 border-amber-300 shadow-md shadow-amber-400/30 scale-105"
              : "bg-white/10 text-white/75 border-white/15 hover:bg-white/20"
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
