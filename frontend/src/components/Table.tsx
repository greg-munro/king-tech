import type { Item } from '../api/client';

interface TableProps {
  items: Item[];
  sortBy: 'id' | 'name' | 'createdOn' | undefined;
  order: 'asc' | 'desc';
  onSort: (col: 'id' | 'name' | 'createdOn') => void;
}

const SORTABLE_COLUMNS: { key: 'id' | 'name' | 'createdOn'; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'createdOn', label: 'Created On' },
];

export default function Table({ items, sortBy, order, onSort }: TableProps) {
  const arrow = (col: string) => {
    if (sortBy !== col) return null;
    return order === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {SORTABLE_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => onSort(key)}
                className={`sortable${sortBy === key ? ' active' : ''}`}
              >
                {label}{arrow(key)}
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
                <td>{item.status}</td>
                <td>{item.description}</td>
                <td>{item.delta}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
