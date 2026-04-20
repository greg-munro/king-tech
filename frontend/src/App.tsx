import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchItems } from './api/client';
import type { FetchItemsParams, Item } from './api/client';
import Table from './components/Table';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import './App.css';

interface AppState {
  data: Item[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
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

export default function App() {
  const [state, setState] = useState<AppState>({
    data: [],
    loading: true,
    error: null,
    total: 0,
    totalPages: 1,
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
        loading: false,
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
    // Update display immediately
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search: val },
    }));
    // Debounce the actual fetch
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

  const { data, loading, error, total, totalPages, filters } = state;

  return (
    <div className="app">
      <header className="app-header">
        <h1>King Tech</h1>
      </header>
      <main className="app-main">
        <Filters
          search={filters.search}
          status={filters.status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : (
          <Table
            items={data}
            sortBy={filters.sortBy}
            order={filters.order}
            onSort={handleSort}
          />
        )}
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
