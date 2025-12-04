import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CourseTable: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    title: "",
    course_type: "",
    course_mode: "",
    category_id: ""
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/course-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const items = data.data;
        console.log('Fetched categories:', items);
        setCategories(items.map((cat: any) => ({ id: String(cat.id), name: cat.name })));
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const params = new URLSearchParams();
        if (filters.title) params.append("title", filters.title);
        if (filters.course_type) params.append("course_type", filters.course_type);
        if (filters.course_mode) params.append("course_mode", filters.course_mode);
        if (filters.category_id) params.append("category_id", filters.category_id);
        params.append("skip", String((page - 1) * pageSize));
        params.append("limit", String(pageSize));
        const res = await fetch(`${apiBaseUrl}/courses?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const items = data.data?.items || data.items || data.courses || [];
        // Try all possible total/count fields for robust pagination
        const totalCount =
          (data.data && (data.data.total || data.data.count)) ||
          data.total || 
          data.count ||
          items.length;
        setCourses(items);
        setTotal(totalCount);
      } catch (err: any) {
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [page, pageSize, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const navigate = useNavigate();
  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const handleAction = (action: string, course: any) => {
    
    if (action === 'Add Content') {
      alert(`Are You Sure You Want To Leave This Page?`);
      setOpenDropdown(null);
      navigate(`/courses/${course.id}/add-chapter`);
      return;
    }

    if (action === 'Edit') {
      alert(`Are You Sure You Want To ${action} for Course: ${course.title}`);
      setOpenDropdown(null);
      navigate(`/courses/edit/${course.id}`);
      return;
    }
    if (action === 'View') {
      //alert(`Are You Sure You Want To ${action} for Course: ${course.title}`);
      setOpenDropdown(null);
      navigate(`/courses/view/${course.id}`);
      return;
    }

    if (action === 'Delete') {
      if (!window.confirm('Are You Sure You Want to Delete This Course?')) {
        setOpenDropdown(null);
        return;
      }
      setOpenDropdown(null);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      fetch(`${apiBaseUrl}/courses/${course.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success !== false) {
            // Refresh course list
            setCourses(prev => prev.filter((c) => c.id !== course.id));
          } else {
            alert(data.message || 'Failed to delete course');
          }
        })
        .catch(() => {
          alert('Failed to delete course');
        });
      return;
    }
    // Placeholder for other actions
    
    setOpenDropdown(null);
  };

  // Close dropdown if click outside
  useEffect(() => {
    if (!openDropdown) return;
    const handleClick = (e: MouseEvent) => {
      // Only close if click is outside any open dropdown
      const dropdowns = document.querySelectorAll('.course-action-dropdown');
      let inside = false;
      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(e.target as Node)) inside = true;
      });
      if (!inside) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          name="title"
          value={filters.title}
          onChange={handleFilterChange}
          placeholder="Search by title"
          className="border rounded px-2 py-1"
        />
        <select name="course_type" value={filters.course_type} onChange={handleFilterChange} className="border rounded px-2 py-1">
          <option value="">All Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select name="course_mode" value={filters.course_mode} onChange={handleFilterChange} className="border rounded px-2 py-1">
          <option value="">All Modes</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name} (ID: {cat.id})</option>
          ))}
        </select>
      </div>
      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">#S.No</th>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              {/* <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Subtitle</th> */}
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Course Price</th>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Course Type</th>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Course Mode</th>
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Category ID</th>
              {/* <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Topic Tags</th> */}
              <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course, idx) => (
              <tr key={course.id}>
                <td className="px-4 py-1 whitespace-nowrap">{(page - 1) * pageSize + idx + 1}</td>
                <td className="px-4 py-1 whitespace-nowrap">{course.title}</td>
                {/* <td className="px-4 py-1 whitespace-nowrap">{course.subtitle}</td> */}
                <td className="px-4 py-1 whitespace-nowrap">{course.course_price}</td>
                <td className="px-4 py-1 whitespace-nowrap">{course.language}</td>
                <td className="px-4 py-1 whitespace-nowrap">{course.level}</td>
                <td className="px-4 py-1 whitespace-nowrap">{course.course_type}</td>
                <td className="px-4 py-1 whitespace-nowrap">{course.course_mode}</td>
                <td className="px-4 py-1 whitespace-nowrap">{course.category_name}</td>
                {/* <td className="px-4 py-1 whitespace-nowrap">{Array.isArray(course.topic_tags) ? course.topic_tags.join(', ') : course.topic_tags}</td> */}
                <td className="px-4 py-1 whitespace-nowrap relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onClick={() => handleDropdown(course.id)}
                    aria-label="Actions"
                  >
                    {/* SVG for three dots */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="2" fill="#6B7280" />
                      <circle cx="12" cy="12" r="2" fill="#6B7280" />
                      <circle cx="19" cy="12" r="2" fill="#6B7280" />
                    </svg>
                  </button>
                  {openDropdown === course.id && (
                    <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl animate-fade-in course-action-dropdown">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        onClick={() => handleAction('Add Content', course)}
                      >
                        <span className="inline-block mr-2">➕</span>Add Course Chapter
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        onClick={() => handleAction('View', course)}
                      >
                        <span className="inline-block mr-2">👁️</span>View
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        onClick={() => handleAction('Edit', course)}
                      >
                        <span className="inline-block mr-2">✏️</span>Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                        onClick={() => handleAction('Delete', course)}
                      >
                        <span className="inline-block mr-2">🗑️</span>Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {/* Page numbers */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const pages: number[] = [];
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return (
              <div className="flex items-center space-x-1">
                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2 py-1 rounded ${p === page ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            );
          })()}
          <span className="text-sm text-gray-600">of {Math.max(1, Math.ceil(total / pageSize))}</span>
        </div>

        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
          disabled={page === Math.ceil(total / pageSize) || total === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CourseTable;
