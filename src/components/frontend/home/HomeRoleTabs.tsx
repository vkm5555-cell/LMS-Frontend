import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { Link } from "react-router-dom"; 

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Define the allowed tab names and category id
type Tab = {
  label: string;
  categoryId: string;
};

// Role is intentionally declared for documentation/typing of external data shapes
export interface Role {
  title: string;
  desc: string;
  like: string;
  salary: string;
  jobs: string;
  img: string;
  credentials: string[];
}

// Tabs array with category ids
const tabs: Tab[] = [
  { label: "Popular", categoryId: "1" },
  { label: "Software Engineering & IT", categoryId: "2" },
  { label: "Business", categoryId: "4" },
  { label: "Sales & Marketing", categoryId: "5" },
  { label: "Data Science & Analytics", categoryId: "6" },
  { label: "Healthcare", categoryId: "7" },

];




const HomeRoleTabs = () => {
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/courses/by-category/${activeTab.categoryId}/latest?limit=3`);
        const data = await res.json();
        const items = data.data;
        setCourses(items);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [activeTab]);

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.categoryId}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full border transition ${
                activeTab.label === tab.label
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Cards */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#f8fbff] rounded-2xl shadow-md p-6 flex flex-col cursor-pointer 
                           transform transition duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate(`/course/view/${course.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/course/view/${course.id}`); }}
              >
                <div className="flex justify-center mb-4">
                  <img
                    src={
                      course.course_thumb
                        ? course.course_thumb.startsWith('http')
                          ? course.course_thumb
                          : `${apiBaseUrl}/${course.course_thumb}`
                        : '/frontend/roles/data-analyst.png'
                    }
                    alt={course.title}
                    className="h-70 object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-600 mt-2 flex-grow">{course.description}</p>
                <p className="text-sm text-gray-700 mt-3">
                  <span className="font-semibold">Level:</span> {course.level}
                </p>
                <p className="mt-3 font-medium text-gray-900">{course.course_price ? `₹${course.course_price}` : "Free"}</p>
                <p className="text-sm text-gray-600">{course.language}</p>
                {/* <div className="mt-3">
                  <span className="font-semibold text-gray-800">Category ID:</span> {course.category_id}
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeRoleTabs;
