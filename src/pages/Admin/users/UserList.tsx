import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  name: string | null;
  username: string;
  email: string;
  mobile: string | null;
  roles: string[];
  dob?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
}

export default function UserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/users?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []);
          setTotal(data.total || 0);
        } else {
          setMessage(data.message || "Failed to fetch users");
        }
      } catch (error) {
        setMessage("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
  let timeout: number;
    if (search.length === 0 || search.length >= 3) {
      timeout = setTimeout(fetchUsers, 400);
    } else {
      setUsers([]);
      setTotal(0);
    }
    return () => clearTimeout(timeout);
  }, [page, pageSize, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <PageMeta title="BBD ED LMS | User List" description="BBD ED LMS - User List" />
      <PageBreadcrumb pageTitle="User List" />
      <div className="space-y-6">
        <div className="relative">
          <button
            className="absolute right-4 top-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <ComponentCard title="User List">
          {/* Search Input */}
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, username, email, mobile..."
              className="border rounded px-3 py-2 w-64 bg-gradient-to-r from-indigo-100 via-pink-100 to-yellow-100"
            />
          </div>
          {message && <div className="p-3 text-red-500 text-sm font-medium">{message}</div>}
          {loading ? (
            <div className="p-5 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Username</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">Mobile</th>
                      <th className="px-4 py-2 border">Role</th>
                      <th className="px-4 py-2 border">DOB</th>
                      <th className="px-4 py-2 border">Father's Name</th>
                      <th className="px-4 py-2 border">Mother's Name</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-2 border">{user.id}</td>
                        <td className="px-4 py-2 border">{user.name ? user.name : "-"}</td>
                        <td className="px-4 py-2 border">{user.username}</td>
                        <td className="px-4 py-2 border">{user.email}</td>
                        <td className="px-4 py-2 border">{user.mobile ? user.mobile : "-"}</td>
                        <td className="px-4 py-2 border">{user.roles && user.roles.length > 0 ? user.roles.join(", ") : "-"}</td>
                        <td className="px-4 py-2 border">{user.dob ? user.dob : "-"}</td>
                        <td className="px-4 py-2 border">{user.father_name ? user.father_name : "-"}</td>
                        <td className="px-4 py-2 border">{user.mother_name ? user.mother_name : "-"}</td>
                        <td className="px-4 py-2 border">
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded mr-1"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                          >Edit</button>
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded mr-1"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this user?")) {
                                try {
                                  const token = localStorage.getItem("token");
                                  const response = await fetch(`${apiBaseUrl}/users/${user.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    setUsers((prev) => prev.filter((u) => u.id !== user.id));
                                    setMessage("User deleted successfully.");
                                  } else {
                                    setMessage(data.message || "Failed to delete user");
                                  }
                                } catch {
                                  setMessage("Error deleting user.");
                                }
                              }
                            }}
                          >Delete</button>
                          <button
                            className="px-2 py-1 bg-green-500 text-white rounded"
                            onClick={() => navigate(`/users/${user.id}/assigned-role`)}
                          >Permission</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
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
        </ComponentCard>
        </div>
      </div>
    </>
  );
}
