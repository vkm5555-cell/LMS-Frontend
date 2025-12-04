import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import PageMeta from "../common/PageMeta";
import ChaptersList from "./ChaptersList";

export default function ViewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChapters, setShowChapters] = useState(true);
  // menu state moved into ChapterCard

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourse(data.data || data.course || data);
      } catch {
        setError("Failed to fetch course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Chapters are fetched and rendered by the ChaptersList component
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <>
      <PageMeta title={`BBDU LMS | View Course`} description="BBDU LMS - View Course" />
      <PageBreadcrumb pageTitle="View Course" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Course Details</h3>
                <p className="text-sm text-gray-500">Overview and metadata for this course</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition"
                  onClick={() => navigate(`/courses/edit/${course.id}`)}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => navigate("/courses")}
                >
                  Back
                </button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{course.course_type}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{course.course_mode}</span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{course.level}</span>
              </div>

              <div className="space-y-2 text-gray-700">
                <p><strong>Subtitle:</strong> {course.subtitle}</p>
                <p><strong>Description:</strong> {course.description}</p>
                <p><strong>Learning Objectives:</strong> {course.learning_objectives}</p>
                <p><strong>Requirements:</strong> {course.requirements}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
                <div><strong>Category:</strong> {course.category_name || course.category_id}</div>
                <div><strong>Language:</strong> {course.language}</div>
                <div><strong>Price:</strong> {course.course_price}</div>
                <div><strong>Promo Video:</strong> {course.promo_video_url ? <a href={course.promo_video_url} className="text-blue-600 underline">View</a> : '-'}</div>
                <div><strong>Topic Tags:</strong> {Array.isArray(course.topic_tags) ? course.topic_tags.join(', ') : course.topic_tags}</div>
                <div><strong>Created:</strong> {course.created_at ? new Date(course.created_at).toLocaleString() : '-'}</div>
                <div><strong>Cafeteria:</strong> {course.cafeteria ?? '-'}</div>
                <div><strong>NSQF Level:</strong> {course.nsqf_level ?? '-'}</div>
                <div><strong>Credit:</strong> {course.credit ?? '-'}</div>
                <div><strong>Course Time:</strong> {course.course_time ?? '-'}</div>
              </div>
            </div>
            <div className="flex items-start justify-center">
              {course.course_thumb && (
                <img
                  src={course.course_thumb.startsWith('http') ? course.course_thumb : `${import.meta.env.VITE_API_BASE_URL}/${course.course_thumb}`}
                  alt="Course Thumbnail"
                  className="w-full max-w-xs h-auto rounded shadow"
                />
              )}
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Course Chapters</h3>
              <p className="text-sm text-gray-500">Manage and review chapters in this course</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChapters(s => !s)}
                className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded"
              >
                {showChapters ? 'Hide Chapters' : 'Show Chapters'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/courses/${id}/add-chapter`)}
                className="text-sm bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-50"
              >
                + Add Chapter
              </button>
            </div>
          </div>
        }>
          {showChapters && <ChaptersList courseId={id} initialChapters={course?.chapters ?? null} />}
        </ComponentCard>
      </div>
    </>
  );
}
