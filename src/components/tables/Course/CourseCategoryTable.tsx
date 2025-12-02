import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../ui/table";
import { useNavigate } from "react-router-dom";


interface CourseCategoryTableProps {
  onEdit?: (id: number) => void;
}

const CourseCategoryTable: React.FC<CourseCategoryTableProps> = ({ onEdit }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let timeout: any;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setMessage("");
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/course-categories?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const withParentName = data.data.map((cat: any) => {
            const parent = cat.parent_category_id
              ? data.data.find((c: any) => c.id === cat.parent_category_id)
              : null;
            return {
              ...cat,
              parent_category_name: parent ? parent.name : '-',
            };
          });
          setCategories(withParentName);
          setTotal(data.total || 0);
        } else {
          setCategories([]);
          setTotal(0);
          setMessage(data.message || "Failed to fetch categories");
        }
      } catch (err) {
        setCategories([]);
        setTotal(0);
        setMessage("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    if (search.length === 0 || search.length >= 3) {
      timeout = setTimeout(fetchCategories, 400);
    } else {
      setCategories([]);
      setTotal(0);
    }
    return () => clearTimeout(timeout);
  }, [page, pageSize, search]);

  const totalPages = Math.ceil(total / pageSize);

  // Delete handler
  const handleDelete = async (catId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      setLoading(true);
      setMessage("");
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/course-categories/${catId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Category deleted successfully!");
        // Refresh data
        const response = await fetch(`${apiBaseUrl}/course-categories?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const withParentName = data.data.map((cat: any) => {
            const parent = cat.parent_category_id
              ? data.data.find((c: any) => c.id === cat.parent_category_id)
              : null;
            return {
              ...cat,
              parent_category_name: parent ? parent.name : '-',
            };
          });
          setCategories(withParentName);
          setTotal(data.total || 0);
        } else {
          setCategories([]);
          setTotal(0);
          setMessage(data.message || "Failed to fetch categories");
        }
      } else {
        setMessage(data.message || "Failed to delete category");
      }
    } catch (err) {
      setMessage("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        {/* Search Input */}
        <div className="mb-4 mt-4 flex justify-end">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by category name"
            className="border rounded px-3 py-2 w-64"
            />
            
        </div>
        {message && <div className="p-3 text-red-500 text-sm font-medium">{message}</div>}
        {loading ? (
          <div className="p-5 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">S.No</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Keyword</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Parent Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {categories.map((cat, idx) => (
                  <TableRow key={cat.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{cat.name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cat.description}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cat.keyword || '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cat.parent_category_name || '-'}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        
                          <button
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200 shadow-sm"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to edit this category?")) {
                                if (onEdit) onEdit(cat.id);
                                if (cat.parent_category_name === '-') {
                                  navigate(`/courses/coursecategories/edit/${cat.id}`);
                                } else {
                                  navigate(`/courses/coursecategories/editsubcat/${cat.id}`);
                                }
                              }
                            }}
                            title="Edit"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z" /></svg>
                            Edit
                          </button>
                       
                        <button
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200 shadow-sm"
                          onClick={() => handleDelete(cat.id)}
                          title="Delete"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4 space-x-2 pb-8">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default CourseCategoryTable;
