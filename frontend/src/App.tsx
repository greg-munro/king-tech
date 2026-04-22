import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchItems } from './api/client';
import type { FetchItemsParams, Item } from './api/client';
import Table from './components/Table';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import './App.css';

function useIsPortraitMobile() {
  const check = () => window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  const [isPortraitMobile, setIsPortraitMobile] = useState(check);
  useEffect(() => {
    const handler = () => setIsPortraitMobile(check());
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);
  return isPortraitMobile;
}

interface AppState {
  data: Item[];
  loading: boolean;
  initialLoad: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  filters: {
    search: string;
    status: string;
    sortBy: 'id' | 'name' | 'createdOn' | undefined;
    order: 'asc' | 'desc';
    page: number;
  };
}

const LIMIT = 20;
const DEBOUNCE_MS = 300;

const STATUS_KPIS: { value: string; label: string }[] = [
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'CANCELED', label: 'CANCELED' },
  { value: 'ERROR', label: 'ERROR' },
];

export default function App() {
  const isPortraitMobile = useIsPortraitMobile();
  const [state, setState] = useState<AppState>({
    data: [],
    loading: true,
    initialLoad: true,
    error: null,
    total: 0,
    totalPages: 1,
    statusCounts: {},
    filters: {
      search: '',
      status: '',
      sortBy: undefined,
      order: 'asc',
      page: 1,
    },
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (params: FetchItemsParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchItems({ ...params, limit: LIMIT });
      setState((prev) => ({
        ...prev,
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
        statusCounts: result.statusCounts,
        loading: false,
        initialLoad: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    const { search, status, sortBy, order, page } = state.filters;
    load({ search: search || undefined, status: status || undefined, sortBy, order, page });
  }, [state.filters, load]);

  const updateFilters = (patch: Partial<AppState['filters']>) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...patch,
        page: 'page' in patch ? patch.page! : 1,
      },
    }));
  };

  const handleSearchChange = (val: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search: val },
    }));
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateFilters({ search: val });
    }, DEBOUNCE_MS);
  };

  const handleStatusChange = (val: string) => updateFilters({ status: val });

  const handleSort = (col: 'id' | 'name' | 'createdOn') => {
    const { sortBy, order } = state.filters;
    if (sortBy === col) {
      updateFilters({ sortBy: col, order: order === 'asc' ? 'desc' : 'asc' });
    } else {
      updateFilters({ sortBy: col, order: 'asc' });
    }
  };

  const handlePageChange = (page: number) =>
    setState((prev) => ({ ...prev, filters: { ...prev.filters, page } }));

  const { data, loading, initialLoad, error, total, totalPages, statusCounts, filters } = state;

  return (
    <div className="app">
      {isPortraitMobile && (
        <div className="rotate-overlay">
          <div className="rotate-message">
            <span className="rotate-icon">⟳</span>
            <p>Please rotate your device for the best experience</p>
          </div>
        </div>
      )}
      <header className="app-header">
        <img src="/King_logo.png" alt="King Tech" className="app-logo" />
      </header>
      <main className="app-main">
        <div className="kpi-row">
          <div className="kpi-card">
            <span className="kpi-label">Total Results</span>
            <span className="kpi-value">{total}</span>
          </div>
          {STATUS_KPIS.map(({ value, label }) => {
            const isActive = filters.status === value;
            return (
              <div
                key={value}
                className={`kpi-card kpi-card--clickable kpi-card--${value.toLowerCase()}${isActive ? ' kpi-card--active' : ''}`}
                onClick={() => handleStatusChange(isActive ? '' : value)}
                role="button"
                aria-pressed={isActive}
              >
                <span className="kpi-label">{label}</span>
                <span className="kpi-value">{statusCounts[value] ?? 0}</span>
              </div>
            );
          })}
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h2 className="table-card-title">Items</h2>
            <Filters
              search={filters.search}
              onSearchChange={handleSearchChange}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          {initialLoad ? (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          ) : (
            <Table
              items={data}
              sortBy={filters.sortBy}
              order={filters.order}
              onSort={handleSort}
              loading={loading}
            />
          )}
        </div>

        <Pagination
          page={filters.page}
          totalPages={totalPages}
          total={total}
          limit={LIMIT}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
