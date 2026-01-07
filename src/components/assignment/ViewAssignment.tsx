import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

type Assignment = {
  id?: number | string;
  title?: string;
  description?: string;
  due_date?: string | null;
  course_id?: number | string;
  chapter_id?: number | string;
  content_id?: number | string;
  attachments?: Array<{
    id?: number | string;
    filename?: string;
    url?: string;
  }>;
  [k: string]: any;
};

type AssignmentStats = {
  total_students: number;
  completed: number;
  pending: number;
};

type Props = {
  assignmentId?: string | number;
};

export default function ViewAssignment({ assignmentId: propId }: Props) {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const id = propId ?? params.id;

  const [data, setData] = useState<Assignment | null>(null);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Assignment id is required.');
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        /* Assignment details */
        const res = await fetch(`${apiBase}/course-assignments/${id}`, {
          headers,
        });
        if (!res.ok) throw new Error('Failed to load assignment');
        const json = await res.json();
        if (mounted) setData(json?.data ?? json);

        /* Assignment stats */
        const statsRes = await fetch(
          `${apiBase}/course-assignments/${id}/stats`,
          { headers }
        );
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (mounted) setStats(statsJson?.data ?? statsJson);
        }
      } catch (err: any) {
        if (mounted)
          setError(err?.message ?? 'Failed to load assignment');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading assignment…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-6">No assignment found.</div>;

  return (
    <div className="space-y-6">

      {/* ================= OVERVIEW CARD ================= */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Assignment Overview
              </h1>
              <p className="text-sm text-gray-600">
                View assignment details, statistics, and actions
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/Assignment/list')}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>

              <button
                onClick={() =>
                  navigate(`/Assignment/add-student/${id}`)
                }
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Assign To Student
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Stats */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard
              title="Total Students"
              value={stats?.total_students ?? 0}
              bg="bg-blue-100"
              text="text-blue-700"
            />
            <StatCard
              title="Completed"
              value={stats?.completed ?? 0}
              bg="bg-indigo-100"
              text="text-indigo-700"
            />
            <StatCard
              title="Not Completed"
              value={stats?.pending ?? 0}
              bg="bg-emerald-100"
              text="text-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* ================= DETAILS CARD ================= */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        
        {/* Header */}
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {data.title ?? 'Untitled Assignment'}
          </h2>

          {data.due_date && (
            <div className="mt-1 text-sm text-gray-600">
              Due: {new Date(String(data.due_date)).toLocaleString()}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {data.description && (
            <div className="prose max-w-none">
              {data.description}
            </div>
          )}

          <div className="text-sm text-gray-700">
            <strong>Course:</strong>{' '}
            {String(data.course_id ?? '-')}&nbsp;&nbsp;
            <strong>Chapter:</strong>{' '}
            {String(data.chapter_id ?? '-')}&nbsp;&nbsp;
            <strong>Content:</strong>{' '}
            {String(data.content_id ?? '-')}
          </div>

          {data.attachments && data.attachments.length > 0 && (
            <div>
              <h4 className="font-medium">Attachments</h4>
              <ul className="ml-5 list-disc">
                {data.attachments.map((a) => (
                  <li key={a.id ?? a.filename}>
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {a.filename ?? a.url}
                      </a>
                    ) : (
                      <span>{a.filename ?? 'Attachment'}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({
  title,
  value,
  bg,
  text,
}: {
  title: string;
  value: number;
  bg: string;
  text: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl p-6 ${bg}`}
    >
      <div>
        <div className="text-sm font-medium text-gray-700">
          {title}
        </div>
        <div className={`text-3xl font-bold ${text}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
