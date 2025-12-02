import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignupModal from "../../Modal/SignupModal";
import LoginModal from "../../Modal/LoginModal";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [_isOpen, setIsOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${apiBaseUrl}/courses/view/${id}`)
      .then((res) => res.json())
      .then((data) => {        
        setCourse(data || data || null);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-10 text-center">Loading...</div>;
  if (!course) return <div className="py-10 text-center text-red-500">Course not found.</div>;
  
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <button
          className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-6">
          <img
            src={
              course.course_thumb
                ? course.course_thumb.startsWith('http')
                  ? course.course_thumb
                  : `${apiBaseUrl}/${course.course_thumb}`
                : '/frontend/roles/data-analyst.png'
            }
            alt={course.title}
            className="w-64 h-64 object-contain rounded-lg border"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-2">{course.learning_objectives}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Level: {course.level}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {course.course_price ? `₹${course.course_price}` : "Free"}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                Language: {course.language}
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Category: {course.category_name}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Details</h3>
          <ul className="list-disc pl-6 text-gray-700">
            {course.duration && <li>Duration: {course.duration}</li>}
            {course.user.name && <li>Instructor: {course.user.name}</li>}
            {course.start_date && <li>Start Date: {course.start_date}</li>}
            {course.end_date && <li>End Date: {course.end_date}</li>}
            {/* Add more fields as needed */}
          </ul>
          <p className="text-gray-600 mb-2">{course.description}</p>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={async () => {
              const token = localStorage.getItem("token");
              console.log("Enroll button clicked. Token:", token);
              if (token) {
                // Fetch user details to check role
                try {
                  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
                  const res = await fetch(`${apiBaseUrl}/users/me`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  const user = await res.json();
                  const rolesArr = user?.data.roles || user?.data?.roles || [];
                  const isStudent = Array.isArray(rolesArr) && rolesArr.some(r => r.name?.toLowerCase() === "student");
                  if (isStudent) {
                    navigate(`/Student-Dashboard/batches/${course.id}`);
                  } else {
                    alert("Only students can enroll in courses.");
                  }
                } catch (err) {
                  alert("Unable to verify user role. Please try again.");
                }
              } else {
                setIsLoginOpen(true);
                setIsOpen(false);
              }
            }}
          >
            Enroll
          </button>
        </div>
      </div>
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </section>
  );
}
