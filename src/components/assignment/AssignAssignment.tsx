import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';

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

  /* ---------------- Validation errors ---------------- */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------------- Helpers ---------------- */
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const selectErrorStyles = (hasError: boolean) => ({
    control: (provided: any) => ({
      ...provided,
      borderColor: hasError ? '#ef4444' : provided.borderColor,
      boxShadow: hasError ? '0 0 0 1px rgba(239,68,68,0.15)' : provided.boxShadow,
      '&:hover': { borderColor: hasError ? '#ef4444' : provided.borderColor },
    }),
  });

  /* ---------------- Load Assignment ---------------- */
  useEffect(() => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }

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
            value: s.code,
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
          (json ?? []).map((p: any) => ({
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
        const list = json ?? [];
        setStudents(
          list.map((s: any) => ({
            value: s.id,
            label: `${s.name ?? ''}`.trim(),
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

    // validation schema (Yup)
    const schema = yup.object({
      organization: yup.object().required('Organization is required'),
      program: yup.object().required('Program is required'),
      session: yup.object().required('Session is required'),
      semester: yup.object().required('Semester is required'),
      selectedStudents: yup.array().min(1, 'Select at least one student'),
      dueDate: yup.string().nullable(),
      notes: yup.string().nullable(),
    });

    try {
      await schema.validate(
        { organization, program, session, semester, selectedStudents, dueDate, notes },
        { abortEarly: false }
      );

      // clear previous errors when validation passes
      setErrors({});
      setError(null);
    } catch (validationErr: any) {
      // build field-level error map and show first message as toast
      const errMap: Record<string, string> = {};
      if (validationErr.inner && validationErr.inner.length) {
        validationErr.inner.forEach((vi: any) => {
          if (vi?.path) errMap[vi.path] = vi.message;
        });
      } else if (validationErr.message) {
        errMap.general = validationErr.message;
      }
      setErrors(errMap);
      const firstMsg = Object.values(errMap)[0] ?? 'Validation error';
      toast.error(firstMsg);
      setError(firstMsg);
      return;
    }

    // runtime guard for TypeScript / safety: ensure required filter objects are present
    if (!organization || !program || !session || !semester) {
      const msg = 'Please select Organization, Program, Session and Semester';
      toast.error(msg);
      setError(msg);
      setErrors({
        organization: !organization ? 'Organization is required' : '',
        program: !program ? 'Program is required' : '',
        session: !session ? 'Session is required' : '',
        semester: !semester ? 'Semester is required' : '',
      });
      return;
    }

    if (!assignmentId) return toast.error('Assignment ID missing');
    // payload validated by yup above

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization <span className="text-red-600 ml-1">*</span>
                </label>
                <Select
                  placeholder="Select organization"
                  options={organizations}
                  value={organization}
                  onChange={(v) => {
                    setOrganization(v);
                    setProgram(null);
                    setErrors(prev => { const p = { ...prev }; delete p.organization; delete p.program; return p; });
                  }}
                  styles={selectErrorStyles(!!errors.organization)}
                  aria-invalid={!!errors.organization}
                />
                {errors.organization && <div className="text-sm text-red-600 mt-1">{errors.organization}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program <span className="text-red-600 ml-1">*</span>
                </label>
                <Select
                  placeholder="Select program"
                  options={programs}
                  value={program}
                  onChange={(v) => { setProgram(v); setErrors(prev => { const p = { ...prev }; delete p.program; return p; }); }}
                  styles={selectErrorStyles(!!errors.program)}
                  isDisabled={!programs.length}
                  aria-invalid={!!errors.program}
                />
                {errors.program && <div className="text-sm text-red-600 mt-1">{errors.program}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session <span className="text-red-600 ml-1">*</span>
                </label>
                <Select
                  placeholder="Select session"
                  options={sessions}
                  value={session}
                  onChange={(v) => { setSession(v); setErrors(prev => { const p = { ...prev }; delete p.session; return p; }); }}
                  styles={selectErrorStyles(!!errors.session)}
                  aria-invalid={!!errors.session}
                />
                {errors.session && <div className="text-sm text-red-600 mt-1">{errors.session}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-600 ml-1">*</span>
                </label>
                <Select
                  placeholder="Select semester"
                  options={semesters}
                  value={semester}
                  onChange={(v) => { setSemester(v); setErrors(prev => { const p = { ...prev }; delete p.semester; return p; }); }}
                  styles={selectErrorStyles(!!errors.semester)}
                  aria-invalid={!!errors.semester}
                />
                {errors.semester && <div className="text-sm text-red-600 mt-1">{errors.semester}</div>}
              </div>
            </div>

            {/* Students */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Students <span className="text-red-600 ml-1">*</span>
              </label>
              <Select
                isMulti
                options={students}
                value={selectedStudents}
                onChange={(v) => { setSelectedStudents(v as Option[]); setErrors(prev => { const p = { ...prev }; delete p.selectedStudents; return p; }); }}
                placeholder="Select students"
                isDisabled={!students.length}
                styles={selectErrorStyles(!!errors.selectedStudents)}
                aria-invalid={!!errors.selectedStudents}
              />
              {errors.selectedStudents && <div className="text-sm text-red-600 mt-1">{errors.selectedStudents}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
              <input
                type="datetime-local"
                className={`w-full rounded-md px-3 py-2 text-sm border ${errors.dueDate ? 'border-red-600' : 'border-gray-200'}`}
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setErrors(prev => { const p = { ...prev }; delete p.dueDate; return p; }); }}
                aria-invalid={!!errors.dueDate}
              />
              {errors.dueDate && <div className="text-sm text-red-600 mt-1">{errors.dueDate}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                rows={4}
                className={`w-full rounded-md px-3 py-2 text-sm border ${errors.notes ? 'border-red-600' : 'border-gray-200'}`}
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setErrors(prev => { const p = { ...prev }; delete p.notes; return p; }); }}
                aria-invalid={!!errors.notes}
              />
              {errors.notes && <div className="text-sm text-red-600 mt-1">{errors.notes}</div>}
            </div>

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
