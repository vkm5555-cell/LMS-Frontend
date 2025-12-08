import { useCallback, useMemo, useState } from 'react';

export type UsePaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
};

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 10 } = options;
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [total, setTotal] = useState<number>(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize || 1)), [total, pageSize]);
  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const next = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);

  const reset = useCallback(() => setPage(1), []);

  // Helper to build URLSearchParams with a broad set of pagination keys used by various backends
  const buildPaginationParams = useCallback((extra?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    params.append('skip', String(offset));
    params.append('offset', String(offset));
    params.append('page', String(page));
    params.append('limit', String(pageSize));
    params.append('per_page', String(pageSize));
    // cache-bust to avoid cached results when page changes
    params.append('_t', String(Date.now()));
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
    }
    return params;
  }, [offset, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    setTotal,
    totalPages,
    offset,
    next,
    prev,
    reset,
    buildPaginationParams,
  } as const;
}

export default usePagination;
