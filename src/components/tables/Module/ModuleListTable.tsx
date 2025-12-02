import { useEffect, useState } from "react";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Button from "../../ui/button/Button";
import { useNavigate } from "react-router";

interface Module {
  id: number;
  name: string;
  description?: string;
}

export default function ModuleListTable() {
  const [modules, setModules] = useState<Module[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/modules`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success === false) {
          if (data.error_code === 300) {
            setMessage(data.message);
            navigate("/admin"); // redirect to login
          }
          if (data.error_code === 401) {
            navigate("/permission-denied");
          }
        } else {
          setModules(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        setMessage("Failed to load modules.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [navigate]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this module?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/modules/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setModules((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert(data.message || "Failed to delete module.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting module.");
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/module/edit/${id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {message && (
        <div className="p-3 text-red-500 text-sm font-medium">{message}</div>
      )}

      {loading ? (
        <div className="p-5 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start">
                  S. No
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">
                  Description
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {modules.map((module, index) => (
                <TableRow key={module.id}>
                  <TableCell className="px-5 py-4 text-start">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {module.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {module.description || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(module.id)}
                    >
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => handleDelete(module.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
