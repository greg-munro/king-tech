import type { Item } from '../api/client';

interface TableProps {
  items: Item[];
  sortBy: 'id' | 'name' | 'createdOn' | undefined;
  order: 'asc' | 'desc';
  onSort: (col: 'id' | 'name' | 'createdOn') => void;
  loading?: boolean;
}

const SORTABLE_COLUMNS: { key: 'id' | 'name' | 'createdOn'; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'createdOn', label: 'Created On' },
];

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'badge badge--completed',
  CANCELED: 'badge badge--canceled',
  ERROR: 'badge badge--error',
};

export default function Table({ items, sortBy, order, onSort, loading }: TableProps) {
  const arrow = (col: string) => {
    if (sortBy !== col) return <span className="sort-arrow sort-arrow--inactive">↕</span>;
    return <span className="sort-arrow">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className={`table-wrapper${loading ? ' table-wrapper--loading' : ''}`}>
      <table>
        <thead>
          <tr>
            {SORTABLE_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => onSort(key)}
                className={`sortable${sortBy === key ? ' active' : ''}`}
              >
                {label} {arrow(key)}
              </th>
            ))}
            <th>Status</th>
            <th>Description</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-state">No results found.</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{new Date(item.createdOn).toLocaleDateString()}</td>
                <td>
                  <span className={STATUS_CLASS[item.status] ?? 'badge'}>
                    {item.status}
                  </span>
                </td>
                <td className="description-cell">{item.description}</td>
                <td>{item.delta}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
