import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function EnrolledCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // call only the student's courses endpoint
        const url = `${apiBaseUrl}/students/me/enrolled-courses`;
        // build query params from localStorage (fall back to sensible defaults)
        const payload = {
          student_id: Number(localStorage.getItem('user_id')) || undefined,
          organization_id: Number(localStorage.getItem('organization_id')) || 1,
          session_id: localStorage.getItem('session_id') || '2025-26',
          semester_id: localStorage.getItem('semester_id') || 'SEM1',
        };

        const params = new URLSearchParams();
        if (payload.student_id !== undefined) params.append('student_id', String(payload.student_id));
        if (payload.organization_id !== undefined) params.append('organization_id', String(payload.organization_id));
        if (payload.session_id) params.append('session_id', payload.session_id);
        if (payload.semester_id) params.append('semester_id', payload.semester_id);

        const urlWithParams = params.toString() ? `${url}?${params.toString()}` : url;
        const res = await fetch(urlWithParams, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setCourses([]);
          setError(`No enrolled courses found (${res.status} ${res.statusText})`);
        } else {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCourses(data);
            setError(null);
          } else if (Array.isArray(data.data)) {
            setCourses(data.data);
            setError(null);
          } else {
            setCourses([]);
            setError('Unexpected response from server');
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load enrolled courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading courses...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">My Enrolled Courses</h2>
      {courses.length === 0 ? (
        <div className="text-sm text-gray-500">You are not enrolled in any courses yet.</div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAll ? courses : courses.slice(0, 3)).map((c) => {
            // The API may return either a course object or an enrollment wrapper with a `course` field
            const courseObj = c.course ?? c;
            const id = courseObj.id ?? c.id ?? courseObj.course_id;
            const img = courseObj.course_thumb || courseObj.course_thumb || courseObj.course_thumb || '/forntend/certificates_course/free-artificial-intelligence.jpg';
            const title = courseObj.title || courseObj.name || courseObj.course_title || 'Untitled Course';
            const desc = courseObj.desc || courseObj.description || courseObj.summary || '';
            const instructor = courseObj.instructor || courseObj.teacher || c.instructor || '';
            const progress = Math.round(Number(c.progress ?? courseObj.progress ?? 0));
            const status = c.status ?? courseObj.status ?? '';
            const lessons = courseObj.lessons_count ?? courseObj.modules_count ?? c.lessons_count ?? null;
            const startDate = c.start_date ?? courseObj.start_date ?? null;
            const endDate = c.end_date ?? courseObj.end_date ?? null;
            const enrolledAt = c.enrolled_at ?? c.enrolled_date ?? null;

            const fmt = (d: any) => (d ? new Date(d).toLocaleDateString() : null);

            return (
              <div key={id ?? title} className="bg-white rounded-2xl shadow-lg transition-transform duration-150 hover:scale-105 hover:shadow-xl border border-gray-100">
                <img src={img} alt={title} className="rounded-t-3xl h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                      {desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{desc}</p>}
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                        {instructor && <span>By {instructor}</span>}
                        {lessons !== null && <span>&middot; {lessons} lessons</span>}
                        {status && <span className="px-2 py-0.5 bg-gray-100 rounded">{status}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">{progress}%</div>
                      <div className="text-xs text-gray-400 mt-2">{enrolledAt ? fmt(enrolledAt) : ''}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() => navigate(`/Student-Dashboard/course/${id}`)}
                    >
                      View
                    </button>
                    <div className="text-xs text-gray-400">{startDate ? `Start ${fmt(startDate)}` : ''} {endDate ? ` · End ${fmt(endDate)}` : ''}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {courses.length > 3 && (
          <div className="mt-6 flex justify-center">
            <button
              className="px-4 py-2 border rounded text-sm bg-white hover:bg-gray-50"
              onClick={() => setShowAll((s) => !s)}
            >
              {showAll ? 'Show Less' : `View More (${courses.length - 3} more)`}
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
