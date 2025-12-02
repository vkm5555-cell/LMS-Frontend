import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { useNavigate } from "react-router";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


interface CourseType {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_at?: string;
}

export default function CourseList() {
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // loader state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseTypes = async () => {
      try {
        const token = localStorage.getItem("token"); // token from login
        const response = await fetch(`${apiBaseUrl}/course-types` , {
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
          if (data.error_code === 403) {
            navigate("/permission-denied");
          }
        } else {
          setCourseTypes(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching course types:", error);
        setMessage("Failed to load course types.");
      } finally {
        setLoading(false); // stop loader in all cases
      }
    };

    fetchCourseTypes();
  }, [navigate]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this course type?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/course-types/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCourseTypes((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data.message || "Failed to delete course type.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting course type.");
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/courses/type/edit/${id}`);
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
            {/* Table Header */}
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
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {courseTypes.map((course, index) => (
                <TableRow key={course.id}>
                  <TableCell className="px-5 py-4 text-start">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {course.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    {course.description || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Badge
                      size="sm"
                      color={
                        course.status === "active"
                          ? "success"
                          : course.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(course.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                     //variant="destructive"
                     onClick={() => handleDelete(course.id)}
                    >
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
