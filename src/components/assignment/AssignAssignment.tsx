import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

type StudentOption = {
  value: string | number;
  label: string;
};

type AssignAssignmentProps = {
  assignmentId?: string;
};

const AssignAssignment: React.FC<AssignAssignmentProps> = ({ assignmentId }) => {
  const navigate = useNavigate();

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';

  /* ---------------- Load assignment ---------------- */
  useEffect(() => {
    if (!assignmentId) return;

    const loadAssignment = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/assignment/${assignmentId}`, { headers });
        if (!res.ok) throw new Error('Failed to load assignment');

        const json = await res.json();
        const payload = json?.data ?? json;

        setAssignmentTitle(payload?.title ?? '');
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId, apiBase]);

  /* ---------------- Load students ---------------- */
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/students?limit=1000`, { headers });
        if (!res.ok) return;

        const json = await res.json();
        const list = json?.data ?? json?.students ?? [];

        if (!Array.isArray(list)) return;

        setStudents(
          list.map((s: any) => ({
            value: s.id ?? s.user_id ?? s._id,
            label: s.name ?? s.fullname ?? s.email ?? String(s.id),
          }))
        );
      } catch {
        // ignore
      }
    };

    loadStudents();
  }, [apiBase]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignmentId) return toast.error('Assignment ID missing');
    if (selectedStudents.length === 0)
      return toast.error('Please select at least one student');

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const payload = {
        student_ids: selectedStudents.map((s) => s.value),
        due_date: dueDate || null,
        notes: notes || null,
      };

      const res = await fetch(
        `${apiBase}/assignment/${assignmentId}/assign`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message ?? 'Assignment failed');
      }

      toast.success('Assignment assigned successfully');
      navigate('/admin/assignment/list');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to assign assignment');
      toast.error(err?.message ?? 'Failed to assign assignment');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Render ---------------- */
  if (loading) {
    return <div>Loading assignment…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        
        {/* Header */}
        <div className="px-6 py-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {assignmentTitle || 'Untitled Assignment'}
          </h3>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Body */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Students
              </span>
              <Select
                isMulti
                options={students}
                value={selectedStudents}
                onChange={(v) => setSelectedStudents(v as StudentOption[])}
                placeholder="Search & select students..."
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Due date
              </span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes (optional)
              </span>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Assigning…' : 'Assign'}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );

};

export default AssignAssignment;
