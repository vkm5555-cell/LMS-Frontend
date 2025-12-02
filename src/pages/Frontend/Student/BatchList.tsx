import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import Navbar from '../../../components/common/frontend/Navbar';
import FrontFooter from '../../../components/common/frontend/FrontFooter';
import ComponentCard from '../../../components/common/ComponentCard';
import Pagination from '../../../components/common/Pagination';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function BatchList() {
  const { id } = useParams(); // course id
  const navigate = useNavigate();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [enrolling, setEnrolling] = useState<Record<number, boolean>>({});
  const [now, setNow] = useState<Date>(new Date());

  // single timer for all countdowns to avoid many intervals
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const url = new URL(`${apiBaseUrl}/student-batches/course/${id}`);
        url.searchParams.set('page', String(page));
        url.searchParams.set('limit', String(pageSize));
        const res = await fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) {
          setError('Failed to load batches');
          setBatches([]);
          return;
        }
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];
        if (cancelled) return;
        setBatches(items);

        const tp = Number(json?.total_pages ?? json?.meta?.total_pages ?? NaN);
        if (!Number.isNaN(tp)) setTotalPages(tp);
        const ti = Number(json?.total_items ?? json?.meta?.total ?? json?.count ?? NaN);
        if (!Number.isNaN(ti)) setTotalItems(ti);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, page, pageSize]);

  return (
    <>
      <PageMeta title={`Batches for course ${id}`} description={`Available batches for course ${id}`} />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageBreadcrumb pageTitle="Available Batches" />
  <ComponentCard title="Batches">
          {loading ? (
            <div className="text-sm text-gray-500">Loading batches...</div>
          ) : error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : batches.length === 0 ? (
            <div className="text-sm text-gray-500">No batches found for this course.</div>
          ) : (
            <div className="space-y-3">
              {batches.map((b: any) => {
                const start = b.start_date ? new Date(b.start_date) : null;
                const end = b.end_date ? new Date(b.end_date) : null;
                let daysLeft: number | null = null;
                if (start) {
                  const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  daysLeft = diff;
                }
                const teacher = b.user.name || b.teacher || b.instructor || (b.teacher?.name) || 'TBA';

                return (
                  <div key={b.id} className="flex items-center justify-between p-3 border rounded bg-white">
                    <div>
                      <div className="font-medium">{b.name || b.title || `Batch ${b.id}`}</div>
                      <div className="text-sm text-gray-500">Teacher: {teacher}</div>
                      <div className="text-sm text-gray-500">Start: {start ? start.toLocaleDateString() : 'TBA'} — End: {end ? end.toLocaleDateString() : 'TBA'}</div>
                      <div className="text-sm text-gray-500">Seats: {b.seats ?? b.capacity ?? '—'}</div>
                      {daysLeft != null && (
                        <div className={`mt-1 inline-block text-xs font-medium ${daysLeft <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {start && start.getTime() > now.getTime() ? (
                            // show a live countdown
                            (() => {
                              const diffMs = start.getTime() - now.getTime();
                              const totalSec = Math.max(0, Math.floor(diffMs / 1000));
                              const days = Math.floor(totalSec / (3600 * 24));
                              const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
                              const mins = Math.floor((totalSec % 3600) / 60);
                              const secs = totalSec % 60;
                              const pad = (n: number) => String(n).padStart(2, '0');
                              return `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
                            })()
                          ) : (
                            daysLeft <= 0 ? (daysLeft === 0 ? 'Starts today' : `${Math.abs(daysLeft)} days ago`) : `${daysLeft} days left`
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      {b.enroll_url ? (
                        <a href={b.enroll_url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-indigo-600 text-white rounded">Enroll</a>
                      ) : (
                        <button
                          disabled={!!enrolling[b.id]}
                          onClick={async () => {
                            const ok = window.confirm(`Enroll in ${b.name || b.title || `batch ${b.id}`}?`);
                            if (!ok) return;
                            const token = localStorage.getItem('token');
                            if (!token) {
                              alert('You must be logged in to enroll');
                              navigate('/login');
                              return;
                            }
                            try {
                              setEnrolling((s) => ({ ...s, [b.id]: true }));
                              const res = await fetch(`${apiBaseUrl}/student-batches-assignments/enroll/${b.id}`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({}),
                              });
                              if (!res.ok) {
                                const j = await res.json().catch(() => ({}));
                                alert(j?.message || 'Failed to enroll');
                                return;
                              }
                              alert('Enrolled successfully');
                              // optionally refresh batches or navigate
                              // navigate(`/student/batch/${b.id}`);
                            } catch (err: any) {
                              alert(err?.message || 'Enrollment failed');
                            } finally {
                              setEnrolling((s) => ({ ...s, [b.id]: false }));
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          {enrolling[b.id] ? 'Enrolling...' : 'Enroll'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">{totalItems != null ? `${totalItems} batches` : ''}</div>
            <div>
              <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} windowSize={5} />
            </div>
          </div>
        </ComponentCard>
      </div>

      <FrontFooter />
    </>
  );
}
