interface FiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export default function Filters({ search, onSearchChange }: FiltersProps) {
  return (
    <div className="filters">
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
