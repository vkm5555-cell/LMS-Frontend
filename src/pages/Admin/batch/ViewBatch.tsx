import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function ViewBatch() {
  const { id } = useParams<{ id?: string }>();
  //const navigate = useNavigate();

  const [batch, setBatch] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!id) return;
    const fetchBatch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/student-batches/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data && data.success && data.data) {
          setBatch(data.data);
        } else if (data && Array.isArray(data)) {
          setBatch(data[0] ?? null);
        } else {
          setError('Batch not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load batch');
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/student-batches/${id}/students`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        setStudents(Array.isArray(d.data) ? d.data : (Array.isArray(d) ? d : []));
      } catch (err) {
        // ignore
      }
    };

    fetchBatch();
    fetchStudents();
  }, [id]);

  const toggleStudent = async (studentId: number) => {
    const token = localStorage.getItem('token');
    try {
      // Assumes API: PATCH /student-batches/:id/students/:studentId toggles enrollment
      const res = await fetch(`${apiBaseUrl}/student-batches/${id}/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d && d.success) {
        // refresh students
        const updated = students.map((s) => (s.id === studentId ? { ...s, enrolled: !s.enrolled } : s));
        setStudents(updated);
      } else {
        alert(d.message || 'Failed to update student');
      }
    } catch (err) {
      alert('Failed to update student');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!batch) return <div className="p-4">No batch found.</div>;

  return (
    <>
      <PageMeta title={`BBD ED LMS | Batch ${batch.name}`} description={`Details for ${batch.name}`} />
      <PageBreadcrumb pageTitle={`View Batch: ${batch.name}`} />

      <div className="space-y-6">
        <ComponentCard title={`Batch: ${batch.name}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Organization:</strong> {batch.organization_name || batch.organization_id}</p>
              <p><strong>Course:</strong> {batch.course_title || batch.course_id}</p>
              <p><strong>Session:</strong> {batch.session_id}</p>
              <p><strong>Semester:</strong> {batch.semester_id}</p>
              <p><strong>Start:</strong> {batch.start_date ? new Date(batch.start_date).toLocaleString() : '-'}</p>
              <p><strong>End:</strong> {batch.end_date ? new Date(batch.end_date).toLocaleString() : '-'}</p>
              <p><strong>Status:</strong> {batch.status}</p>
            </div>
            <div>
              <p className="font-semibold">Description</p>
              <p className="text-sm">{batch.description || '-'}</p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={`Students (${students.length})`}>
          {students.length === 0 ? (
            <p className="text-gray-500">No students enrolled.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Enrolled</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.email}</td>
                    <td className="px-4 py-2">{s.enrolled ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">
                      <button
                        className={`px-2 py-1 rounded ${s.enrolled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        onClick={() => toggleStudent(s.id)}
                      >
                        {s.enrolled ? 'Remove' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
