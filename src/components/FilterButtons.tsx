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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            activeFilter === key
              ? "bg-gold text-[#1a3a4c] border-gold shadow-md shadow-gold/30 scale-105"
              : "bg-black/20 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
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
