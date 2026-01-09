import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

type Option = {
  value: string | number;
  label: string;
};

type AssignAssignmentProps = {
  assignmentId?: string;
};

const AssignAssignment: React.FC<AssignAssignmentProps> = ({ assignmentId }) => {
  const navigate = useNavigate();
  const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';

  /* ---------------- Assignment ---------------- */
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Filters ---------------- */
  const [organizations, setOrganizations] = useState<Option[]>([]);
  const [programs, setPrograms] = useState<Option[]>([]);
  const [sessions, setSessions] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);

  const [organization, setOrganization] = useState<Option | null>(null);
  const [program, setProgram] = useState<Option | null>(null);
  const [session, setSession] = useState<Option | null>(null);
  const [semester, setSemester] = useState<Option | null>(null);

  /* ---------------- Students ---------------- */
  const [students, setStudents] = useState<Option[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Option[]>([]);

  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  /* ---------------- Helpers ---------------- */
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /* ---------------- Load Assignment ---------------- */
  useEffect(() => {
    if (!assignmentId) return;

    const loadAssignment = async () => {
      try {
        const res = await fetch(
          `${apiBase}/course-assignments/${assignmentId}`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error('Failed to load assignment');

        const json = await res.json();
        const payload = json?.data ?? json;
        setAssignmentTitle(payload?.title ?? '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId]);

  /* ---------------- Load Base Filters ---------------- */
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [orgRes, sessionRes, semRes] = await Promise.all([
          fetch(`${apiBase}/organizations/list/all`, { headers: authHeaders() }),
          fetch(`${apiBase}/session/list/all`, { headers: authHeaders() }),
          fetch(`${apiBase}/semesters/list/all`, { headers: authHeaders() }),
        ]);

        const orgJson = await orgRes.json();
        const sessionJson = await sessionRes.json();
        const semJson = await semRes.json();

        setOrganizations(
          (orgJson.data ?? []).map((o: any) => ({
            value: o.id,
            label: o.org_name,
          }))
        );

        setSessions(
          (sessionJson.data ?? []).map((s: any) => ({
            value: s.id,
            label: s.session,
          }))
        );

        setSemesters(
          (semJson.data ?? []).map((s: any) => ({
            value: s.id,
            label: s.name,
          }))
        );
      } catch {
        toast.error('Failed to load filters');
      }
    };

    loadFilters();
  }, []);

  /* ---------------- Load Programs (by Organization) ---------------- */
  useEffect(() => {
    if (!organization) {
      setPrograms([]);
      setProgram(null);
      return;
    }

    const loadPrograms = async () => {
      try {
        const res = await fetch(
          `${apiBase}/programs?organization_id=${organization.value}`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error();

        const json = await res.json();
        setPrograms(
          (json.data ?? []).map((p: any) => ({
            value: p.id,
            label: p.name,
          }))
        );
      } catch {
        toast.error('Failed to load programs');
      }
    };

    loadPrograms();
  }, [organization]);

  /* ---------------- Load Students (Filtered) ---------------- */
  useEffect(() => {
    if (!organization || !program || !session || !semester) {
      setStudents([]);
      setSelectedStudents([]);
      return;
    }

    const loadStudents = async () => {
      try {
        const params = new URLSearchParams({
          organization_id: String(organization.value),
          program_id: String(program.value),
          session_id: String(session.value),
          semester_id: String(semester.value),
        });

        const res = await fetch(
          `${apiBase}/students?${params.toString()}`,
          { headers: authHeaders() }
        );

        if (!res.ok) throw new Error();

        const json = await res.json();
        const list = json?.data ?? [];

        setStudents(
          list.map((s: any) => ({
            value: s.id,
            label: `${s.roll_no ?? ''} ${s.first_name ?? ''} ${s.last_name ?? ''}`.trim(),
          }))
        );
      } catch {
        toast.error('Failed to load students');
      }
    };

    loadStudents();
  }, [organization, program, session, semester]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignmentId) return toast.error('Assignment ID missing');
    if (!organization || !program || !session || !semester)
      return toast.error('Please select all filters');
    if (selectedStudents.length === 0)
      return toast.error('Please select students');

    setSubmitting(true);

    try {
      const payload = {
        student_ids: selectedStudents.map((s) => s.value),
        organization_id: organization.value,
        program_id: program.value,
        session_id: session.value,
        semester_id: semester.value,
        due_date: dueDate || null,
        notes: notes || null,
      };

      const res = await fetch(
        `${apiBase}/assignment/${assignmentId}/assign`,
        {
          method: 'POST',
          headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      toast.success('Assignment assigned successfully');
      navigate('/admin/assignment/list');
    } catch {
      toast.error('Failed to assign assignment');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Render ---------------- */
  if (loading) return <div>Loading assignment…</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white">
        <div className="px-6 py-4">
          <h3 className="text-base font-medium">{assignmentTitle}</h3>
        </div>

        <div className="border-t" />

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                placeholder="Organization"
                options={organizations}
                value={organization}
                onChange={(v) => {
                  setOrganization(v);
                  setProgram(null);
                }}
              />

              <Select
                placeholder="Program"
                options={programs}
                value={program}
                onChange={(v) => setProgram(v)}
                
              />

              <Select
                placeholder="Session"
                options={sessions}
                value={session}
                onChange={(v) => setSession(v)}
              />

              <Select
                placeholder="Semester"
                options={semesters}
                value={semester}
                onChange={(v) => setSemester(v)}
              />
            </div>

            {/* Students */}
            <Select
              isMulti
              options={students}
              value={selectedStudents}
              onChange={(v) => setSelectedStudents(v as Option[])}
              placeholder="Select students"
              isDisabled={!students.length}
            />

            <input
              type="datetime-local"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <textarea
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
              >
                {submitting ? 'Assigning…' : 'Assign'}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm"
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
