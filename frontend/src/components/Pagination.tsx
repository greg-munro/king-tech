interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
      </span>
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          ‹
        </button>
        <span className="page-indicator">Page {page} of {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
        >
          »
        </button>
      </div>
    </div>
  );
}
