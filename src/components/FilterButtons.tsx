type FilterType = "all" | "missing" | "duplicates";

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterButtons = ({ activeFilter, onFilterChange }: FilterButtonsProps) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "missing", label: "Faltam" },
    { key: "duplicates", label: "Repetidas" },
  ];

  return (
    <div className="flex gap-2 justify-center">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === key
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
