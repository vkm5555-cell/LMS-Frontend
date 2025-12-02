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
              <span>Course Details</span>
              <button
                className="ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => navigate("/courses")}
              >
                Back
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="mb-2 text-gray-700"><strong>Subtitle:</strong> {course.subtitle}</p>
              <p className="mb-2 text-gray-700"><strong>Description:</strong> {course.description}</p>
              <p className="mb-2 text-gray-700"><strong>Learning Objectives:</strong> {course.learning_objectives}</p>
              <p className="mb-2 text-gray-700"><strong>Requirements:</strong> {course.requirements}</p>
              <p className="mb-2 text-gray-700"><strong>Category:</strong> {course.category_name || course.category_id}</p>
              <p className="mb-2 text-gray-700"><strong>Mode:</strong> {course.course_mode}</p>
              <p className="mb-2 text-gray-700"><strong>Type:</strong> {course.course_type}</p>
              <p className="mb-2 text-gray-700"><strong>Level:</strong> {course.level}</p>
              <p className="mb-2 text-gray-700"><strong>Language:</strong> {course.language}</p>
              <p className="mb-2 text-gray-700"><strong>Price:</strong> {course.course_price}</p>
              <p className="mb-2 text-gray-700"><strong>Promo Video URL:</strong> {course.promo_video_url}</p>
              <p className="mb-2 text-gray-700"><strong>Topic Tags:</strong> {Array.isArray(course.topic_tags) ? course.topic_tags.join(', ') : course.topic_tags}</p>
              <p className="mb-2 text-gray-700"><strong>User ID:</strong> {course.user_id}</p>
              <p className="mb-2 text-gray-700"><strong>Created At:</strong> {course.created_at ? new Date(course.created_at).toLocaleString() : '-'}</p>
              <p className="mb-2 text-gray-700"><strong>Updated At:</strong> {course.updated_at ? new Date(course.updated_at).toLocaleString() : '-'}</p>
            </div>
            <div>
              {course.course_thumb && (
                <img
                  src={course.course_thumb.startsWith('http') ? course.course_thumb : `${import.meta.env.VITE_API_BASE_URL}/${course.course_thumb}`}
                  alt="Course Thumbnail"
                  className="w-full h-auto rounded shadow"
                />
              )}
            </div>
          </div>
        </ComponentCard>
        <ComponentCard title={<span>Course Chapters</span>}>
          <div className="flex items-center justify-between mb-3">
            <div />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowChapters(s => !s)}
                className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded"
              >
                {showChapters ? 'Hide Chapters' : 'Show Chapters'}
              </button>
            </div>
          </div>
          {showChapters && <ChaptersList courseId={id} initialChapters={course?.chapters ?? null} />}
        </ComponentCard>
      </div>
    </>
  );
}
