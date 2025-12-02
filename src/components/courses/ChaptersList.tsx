import { useEffect, useState } from 'react';
import ChapterCard from './ChapterCard';

interface Props {
  courseId?: string | undefined;
  initialChapters?: any[] | null;
}

export default function ChaptersList({ courseId, initialChapters = null }: Props) {
  const [chapters, setChapters] = useState<any[] | null>(initialChapters ?? null);
  const [loading, setLoading] = useState(initialChapters ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [total, setTotal] = useState<number>(-1);

  useEffect(() => {
    let mounted = true;

    // seed UI with provided initialChapters for responsiveness
    if (initialChapters && Array.isArray(initialChapters) && (!chapters || chapters.length === 0)) {
      setChapters(initialChapters);
      setTotal(initialChapters.length);
    }

    if (!courseId) {
      setChapters([]);
      setLoading(false);
      return;
    }

    const fetchChapters = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('page', String(page));
        params.set('limit', String(limit));
        const url = `${apiBaseUrl}/chapters/by-course/${courseId}?${params.toString()}`;
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!mounted) return;
        if (!res.ok) {
          setChapters([]);
          setTotal(0);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || data.chapters || []);
        const t = data.total ?? data.meta?.total;
        setChapters(list);
        if (typeof t === 'number' || (typeof t === 'string' && !Number.isNaN(Number(t)))) {
          setTotal(Number(t));
        } else {
          setTotal(-1);
        }
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load chapters');
        setChapters([]);
        setTotal(0);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchChapters();

    return () => { mounted = false; };
  }, [courseId, initialChapters, search, page, limit]);

  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search chapters"
            className="px-3 py-2 border rounded w-full md:w-64"
          />
          <div className="text-sm text-gray-500">{total >= 0 ? `${total} result${total !== 1 ? 's' : ''}` : `${chapters ? chapters.length : 0} shown`}</div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Per page</label>
          <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500">Loading chapters...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !(chapters && chapters.length) ? (
          <div className="text-sm text-gray-500">No chapters found for this course.</div>
        ) : (
          chapters.map((ch, i) => (
            <ChapterCard
              key={ch.id || i}
              chapter={ch}
              index={i}
              courseId={courseId}
              onDeleted={async () => {
                setLoading(true);
                try {
                  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
                  const token = localStorage.getItem('token');
                  const params = new URLSearchParams();
                  if (search) params.set('search', search);
                  params.set('page', String(page));
                  params.set('limit', String(limit));
                  const url = `${apiBaseUrl}/chapters/by-course/${courseId}?${params.toString()}`;
                  const res = await fetch(url, {
                    headers: {
                      Accept: 'application/json',
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                  });
                  if (!res.ok) {
                    setChapters([]);
                    setTotal(0);
                    setLoading(false);
                    return;
                  }
                  const data = await res.json();
                  const list = Array.isArray(data) ? data : (data.data || data.chapters || []);
                  const t = data.total ?? data.meta?.total;
                  setChapters(list);
                  if (typeof t === 'number' || (typeof t === 'string' && !Number.isNaN(Number(t)))) {
                    setTotal(Number(t));
                  } else {
                    setTotal(-1);
                  }
                } catch (err) {
                  setError('Failed to load chapters');
                  setChapters([]);
                  setTotal(0);
                } finally {
                  setLoading(false);
                }
              }}
            />
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page}{total > 0 ? ` of ${totalPages}` : ''}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          {total > 0 ? (
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button key={idx} onClick={() => setPage(idx + 1)} className={`px-2 py-1 border rounded ${page === idx + 1 ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>{idx + 1}</button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">&nbsp;</div>
          )}
          <button
            type="button"
            onClick={() => setPage(p => p + 1)}
            disabled={total > 0 ? page === totalPages : !(chapters && chapters.length === limit)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
