import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function BatchList() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");  
  const navigate = useNavigate();

  // dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const pageSizes = [5, 10, 25, 50];
  const [totalItems, setTotalItems] = useState<number>(0);

  // compute paging helpers
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStartIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEndIndex = Math.min(totalItems, (currentPage - 1) * pageSize + batches.length);

  // Fetch page from server whenever currentPage or pageSize changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchBatches = async (page: number, size: number) => {
      setLoading(true);
      try {
        // API expected to support page & limit query params and return { success, data: [], total }
        const url = `${apiBaseUrl}/student-batches/list/all?page=${page}&limit=${size}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data && data.success === false) {
          setError(data.message || "Failed to load batches");
          setBatches([]);
          setTotalItems(0);
        } else if (data && Array.isArray(data.data)) {
          setBatches(data.data);
          setTotalItems(typeof data.total === 'number' ? data.total : (data.meta?.total ?? 0));
          setError("");
        } else if (Array.isArray(data)) {
          // fallback: API returned array
          setBatches(data);
          setTotalItems(data.length);
          setError("");
        } else {
          setBatches([]);
          setTotalItems(0);
          setError('Unexpected response from server');
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching batches");
        setBatches([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches(currentPage, pageSize);
  }, [currentPage, pageSize]);


  const handleDropdown = (index: number) => {
    const btn = buttonRefs.current[index];
    if (openDropdown === index) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 190, // adjust to align
      });
      setOpenDropdown(index);
    }
  };


  const handleAction = async (action: string, batch: any) => {
    setOpenDropdown(null);

    if (action === 'Add') {
      navigate(`/Batch/add-student/${batch.id}`);
      return;
    }

    if (action === 'View') {
      navigate(`/Batch/viewBatch/${batch.id}`);
      return;
    }

    if (action === 'Edit') {
      navigate(`/Batch/editBatch/${batch.id}`);
      return;
    }

    if (action === 'Delete') {
      const confirmed = window.confirm(`Are you sure you want to delete batch "${batch.name}"? This action cannot be undone.`);
      if (!confirmed) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBaseUrl}/student-batches/${batch.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.success) {
          // remove locally and adjust total
          setBatches((prev) => prev.filter((b) => b.id !== batch.id));
          setTotalItems((t) => Math.max(0, t - 1));
          alert('Batch deleted successfully');
        } else {
          alert(data?.message || 'Failed to delete batch');
        }
      } catch (err: any) {
        alert(err?.message || 'Failed to delete batch');
      }
      return;
    }

    // fallback action
    alert(`${action} clicked for batch: ${batch.name}`);
  };


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isButtonClick = buttonRefs.current.some((btn) => btn && btn.contains(e.target as Node));
      const isDropdownClick = dropdownRef.current && dropdownRef.current.contains(e.target as Node);
      if (!isButtonClick && !isDropdownClick) {
        setOpenDropdown(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const handleClose = (e: any) => {
      if (e.key === "Escape") setOpenDropdown(null);
      else setDropdownPosition(null);
    };
    window.addEventListener("scroll", handleClose);
    window.addEventListener("keydown", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose);
      window.removeEventListener("keydown", handleClose);
    };
  }, []);

  // ensure buttonRefs length matches current page rows
  useEffect(() => { buttonRefs.current = new Array(batches.length); }, [batches.length]);

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages || 1); }, [currentPage, totalPages]);

  return (
    <>
      <PageMeta title="BBD ED LMS | Student Batches" description="View all student batches" />
      <PageBreadcrumb pageTitle="Student Batches" />

      <ComponentCard title="Student Batch List">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading batches...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : batches.length === 0 ? (
          <p className="text-gray-500 text-sm">No batches found.</p>
        ) : (
          <div className="overflow-x-auto relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, idx) => {
                  const globalIndex = (currentPage - 1) * pageSize + idx;
                  return (
                    <tr key={batch.id ?? globalIndex} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-sm">{globalIndex + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium">{batch.name}</td>
                      <td className="px-4 py-2 text-sm">{batch.organization_name || "-"}</td>
                      <td className="px-4 py-2 text-sm">{batch.course_title || "-"}</td>
                      <td className="px-4 py-2 text-sm">{batch.session_id || "-"}</td>
                      <td className="px-4 py-2 text-sm">{batch.semester_id || "-"}</td>
                      <td className="px-4 py-2 text-sm">{new Date(batch.start_date).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{new Date(batch.end_date).toLocaleString()}</td>
                      <td
                        className={`px-4 py-2 text-sm font-semibold ${
                          batch.status === "active" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {batch.status}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          ref={(el: HTMLButtonElement | null) => { buttonRefs.current[idx] = el; }}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                          onClick={() => handleDropdown(idx)}
                          aria-label="Actions"
                        >
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="2" fill="#6B7280" />
                            <circle cx="12" cy="12" r="2" fill="#6B7280" />
                            <circle cx="19" cy="12" r="2" fill="#6B7280" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div className="flex items-center justify-between gap-4 mt-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rows per page:</label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {pageSizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">Showing {pageStartIndex} - {pageEndIndex} of {totalItems}</div>
                <div className="flex items-center gap-1">
                  <button
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  <span className="px-3 text-sm">{currentPage} / {totalPages}</span>
                  <button
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                  <button
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ Render Dropdown outside table, positioned correctly */}
            {openDropdown !== null && dropdownPosition && (
              <div
                ref={dropdownRef}
                className="fixed z-[99999] w-48 bg-white border border-gray-200 rounded-lg shadow-xl animate-fade-in"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                }}
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  onClick={() => handleAction("Add", batches[openDropdown])}
                >
                   <span className="inline-block mr-2">➕</span>Add Student
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  onClick={() => handleAction("View", batches[openDropdown])}
                >
                  <span className="inline-block mr-2">👁️</span>View
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  onClick={() => handleAction("Edit", batches[openDropdown])}
                >
                  <span className="inline-block mr-2">✏️</span>Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  onClick={() => handleAction("Delete", batches[openDropdown])}
                >
                  <span className="inline-block mr-2">🗑️</span>Delete
                </button>
              </div>
            )}
          </div>
        )}
      </ComponentCard>
    </>
  );
}
