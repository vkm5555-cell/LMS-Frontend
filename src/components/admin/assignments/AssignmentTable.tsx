import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AssignmentTable: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 2;
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ title: "" });
  const [searchInput, setSearchInput] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // debounce searchInput -> filters.title
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, title: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams();
        if (filters.title) params.append("title", filters.title);
        // also include common q/search keys for flexibility
        if (filters.title) {
          params.append("q", filters.title);
          params.append("search", filters.title);
        }
        // include several common pagination param names so backend accepts one of them
        const offset = (page - 1) * PAGE_SIZE;
        params.append("skip", String(offset));
        params.append("offset", String(offset));
        params.append("page", String(page));
        params.append("limit", String(PAGE_SIZE));
        params.append("per_page", String(PAGE_SIZE));
        // cache-busting to avoid proxy/server returning cached results for different pages
        params.append("_t", String(Date.now()));
        const res = await fetch(`${apiBaseUrl}/course-assignments?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // debug only in development
        if (import.meta.env.DEV) console.debug("Assignments list response", { params: params.toString(), data });

        // normalize items array from common response shapes
        const itemsList: any[] =
          data?.data?.items ?? data?.items ?? data?.assignments ?? (Array.isArray(data?.data) ? data.data : undefined) ?? (Array.isArray(data) ? data : []);
        const totalCount = data?.data?.total ?? data?.data?.count ?? data?.total ?? data?.count ?? data?.meta?.total ?? data?.pagination?.total ?? itemsList.length;
        setItems(itemsList || []);
        setTotal(Number(totalCount) || 0);
        // clamp page if backend returned fewer total pages than current page
        const totalPages = Math.max(1, Math.ceil(Number(totalCount) / PAGE_SIZE));
        if (page > totalPages) {
          setPage(totalPages);
          return; // will refetch with new page
        }
      } catch (err) {
        setError("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [page, PAGE_SIZE, filters]);

  // close any open action dropdown when clicking anywhere outside the dropdown or its toggle
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      // if click is inside a dropdown or on the toggle button, keep it open
      if (target.closest('.course-action-dropdown') || target.closest('[data-dropdown-toggle]')) return;
      if (openDropdown !== null) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [openDropdown]);

  // search input is debounced into filters via useEffect

  const handleDropdown = (id: string) => setOpenDropdown((prev) => (prev === id ? null : id));

  const handleAction = async (action: string, item: any) => {
    setOpenDropdown(null);
    const token = localStorage.getItem("token");
    if (action === "View") {
      navigate(`/Assignment/view/${item.id}`);
      return;
    }
    if (action === "Edit") {
      navigate(`/Assignment/edit/${item.id}`);
      return;
    }
    if (action === "Assign") {
      // open assign to student UI - navigate to a page where admin/teacher can assign
      navigate(`/Assignment/${item.id}/assign`);
      return;
    }
    if (action === "Delete") {
      if (!window.confirm("Are you sure you want to delete this assignment?")) return;
      try {
        const res = await fetch(`${apiBaseUrl}/course-assignments/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success !== false) {
          setItems((prev) => prev.filter((it) => it.id !== item.id));
        } else {
          alert(d.message || "Failed to delete assignment");
        }
      } catch {
        alert("Failed to delete assignment");
      }
      return;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          name="title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title"
          className="border rounded px-2 py-1"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((it: any, idx: number) => (
              <tr key={it.id}>
                <td className="px-6 py-2 whitespace-nowrap">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="px-6 py-2 whitespace-nowrap">{it.title}</td>
                <td className="px-6 py-2 whitespace-nowrap">{it.course?.title || it.course_title || it.course_name || '-'}</td>
                <td className="px-6 py-2 whitespace-nowrap">{it.due_date ? new Date(it.due_date).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-2 whitespace-nowrap relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onClick={() => handleDropdown(String(it.id))}
                    data-dropdown-toggle
                    aria-label="Actions"
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="2" fill="#6B7280" />
                      <circle cx="12" cy="12" r="2" fill="#6B7280" />
                      <circle cx="19" cy="12" r="2" fill="#6B7280" />
                    </svg>
                  </button>
                  {openDropdown === String(it.id) && (
                    <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl animate-fade-in course-action-dropdown">
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition" onClick={() => handleAction('View', it)}>👁️ View</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition" onClick={() => handleAction('Edit', it)}>✏️ Edit</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition" onClick={() => handleAction('Assign', it)}>👥 Assign to Student</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition" onClick={() => handleAction('Delete', it)}>🗑️ Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>

        {/* numbered pagination */}
        <div className="flex items-center gap-2">
          {(() => {
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
            // show a window of pages around the current page for long lists
            const pageWindow = 5; // max buttons to display
            let start = Math.max(1, page - Math.floor(pageWindow / 2));
            let end = Math.min(totalPages, start + pageWindow - 1);
            if (end - start + 1 < pageWindow) {
              start = Math.max(1, end - pageWindow + 1);
            }
            const buttons = [] as React.ReactNode[];
            for (let p = start; p <= end; p++) {
              buttons.push(
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {p}
                </button>
              );
            }
            return buttons;
          })()}
        </div>

        <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE_SIZE), p + 1))} disabled={page === Math.ceil(total / PAGE_SIZE) || total === 0}>Next</button>
      </div>
    </div>
  );
};

export default AssignmentTable;
