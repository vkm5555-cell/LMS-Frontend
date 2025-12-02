import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as Yup from "yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";

export default function EditRole() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Role name is required")
      .min(3, "Name must be at least 3 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters"),
  });

  // Fetch role details for editing
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/roles/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success === false) {
          if (data.error_code === 300) {
            setMessage(data.message);
            navigate("/");
          } else {
            setMessage(data.message || "Failed to fetch role");
          }
        } else {
          setFormData({
            name: data.data.name || "",
            description: data.data.description || "",
            status: data.data.status || "active",
          });
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        setMessage("Failed to load role.");
      }
    };

    if (id) fetchRole();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);

      const token = localStorage.getItem("token");
      const user_role = localStorage.getItem("role");
      const response = await fetch(`http://127.0.0.1:8000/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          role: user_role,
        }),
      });

      const data = await response.json();
      if (data.success === false) {
        if (data.error_code === 300) {
          setMessage(data.message);
          navigate("/");
        } else {
          setMessage(data.message || "Failed to update role");
        }
      } else {
        setMessage("Role updated successfully!");
        // redirect after success
        setTimeout(() => navigate("/role"), 1000);
      }
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        setMessage(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="BBD ED LMS | Edit User Role"
        description="BBD ED LMS - Edit User Role"
      />
      <PageBreadcrumb pageTitle="Edit Role" />

      <div className="space-y-6">
        <ComponentCard title="Edit User Role">
          {message && (
            <p
              className={`mt-3 text-sm ${
                message.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Role Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter role name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
