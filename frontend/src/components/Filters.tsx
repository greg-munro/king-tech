interface FiltersProps {
  search: string;
  status: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
}

const STATUS_OPTIONS = ['', 'active', 'inactive', 'pending'];

export default function Filters({ search, status, onSearchChange, onStatusChange }: FiltersProps) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="status-select"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === '' ? 'All statuses' : s}
          </option>
        ))}
      </select>
    </div>
  );
}
