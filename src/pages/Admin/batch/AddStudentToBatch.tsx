import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function AddStudentToBatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]); // right-side selected
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      setLoading(true);
      try {
        // fetch batch info, all students, and students already in the batch
        const [batchRes, studentsRes, batchStudentsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/student-batches/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiBaseUrl}/users/students/by-role/Student`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiBaseUrl}/student-batches/${id}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const batchJson = await batchRes.json();
        const studentsJson = await studentsRes.json();
        const batchStudentsJson = await batchStudentsRes.json();

        const studentsArray = Array.isArray(studentsJson?.data) ? studentsJson.data : (Array.isArray(studentsJson) ? studentsJson : []);
        const batchStudentsArray = Array.isArray(batchStudentsJson?.data) ? batchStudentsJson.data : (Array.isArray(batchStudentsJson) ? batchStudentsJson : []);

        setBatch(batchJson?.data ?? batchJson);
        setStudents(studentsArray);

        // populate selectedStudents with already-added students, matching against the full students list when possible
        const idOf = (o: any) => o?.id ?? o?.user_id ?? o?.student_id ?? null;
        const seen = new Set<number | string>();
        const selected: any[] = [];
        for (const bs of batchStudentsArray) {
          const key = idOf(bs);
          if (!key || seen.has(key)) continue;
          seen.add(key);
          const full = studentsArray.find((s: any) => idOf(s) === key);
          selected.push(full ?? bs);
        }
        if (selected.length > 0) setSelectedStudents(selected);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudents || selectedStudents.length === 0) {
      setError('Please select at least one student to add');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      // send bulk student IDs; adjust to your API shape if needed
      const payload = { student_ids: selectedStudents.map((s) => s.id) };
      const res = await fetch(`${apiBaseUrl}/student-batches-assignments/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      // handle 204 No Content or JSON responses
      let data: any = null;
      try {
        data = await res.json();
      } catch (err) {
        // no json; ignore
      }

      if (res.ok && (data === null || data.success || res.status === 204)) {
        alert(`Added ${selectedStudents.length} student${selectedStudents.length === 1 ? '' : 's'} to batch`);
        navigate(`/Batch/viewBatch/${id}`);
      } else {
        setError(data?.message || `Failed to add students (status ${res.status})`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add student to batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Add Student to Batch" description="Add an existing student to a batch" />
      <PageBreadcrumb pageTitle="Add Student to Batch" />

      <ComponentCard title={`Add Student to Batch ${batch?.name ?? ''}`}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}

              {/* Dual list: left = all students, right = selected */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">All Students</label>
                  <div className="h-80 overflow-auto border rounded p-2 bg-white">
                    {students.length === 0 ? (
                      <div className="text-sm text-gray-500">No students available</div>
                    ) : (
                      students.map((s) => {
                        const isSelected = selectedStudents.some((sel) => sel.id === s.id);
                        return (
                          <div
                            key={s.id}
                            draggable={!isSelected}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', String(s.id));
                            }}
                            onClick={() => {
                              // click to move to right
                              if (!isSelected) setSelectedStudents((prev) => [...prev, s]);
                            }}
                            className={`p-2 mb-1 rounded cursor-pointer flex items-center justify-between hover:bg-gray-50 ${isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div>
                              <div className="text-sm font-medium">{s.name || s.full_name || s.email || `#${s.id}`}</div>
                              <div className="text-xs text-gray-500">{s.email}</div>
                            </div>
                            {!isSelected && <div className="text-xs text-gray-400">➕</div>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Selected Students</label>
                  <div
                    className="h-80 overflow-auto border rounded p-2 bg-white"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const idStr = e.dataTransfer.getData('text/plain');
                      const idNum = Number(idStr);
                      const found = students.find((st) => st.id === idNum);
                      if (found && !selectedStudents.some((s) => s.id === found.id)) {
                        setSelectedStudents((prev) => [...prev, found]);
                      }
                    }}
                  >
                    {selectedStudents.length === 0 ? (
                      <div className="text-sm text-gray-500">Drag students here or click to add</div>
                    ) : (
                      selectedStudents.map((s) => (
                        <div key={s.id} className="p-2 mb-1 rounded flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <div className="text-sm font-medium">{s.name || s.full_name || s.email || `#${s.id}`}</div>
                            <div className="text-xs text-gray-500">{s.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="text-sm text-blue-600"
                              onClick={() => {
                                // remove
                                setSelectedStudents((prev) => prev.filter((x) => x.id !== s.id));
                              }}
                            >Remove</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                  disabled={saving || selectedStudents.length === 0}
                >
                  {saving ? 'Saving…' : `Add ${selectedStudents.length} Student${selectedStudents.length === 1 ? '' : 's'}`}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>
            </form>
        )}
      </ComponentCard>
    </>
  );
}
