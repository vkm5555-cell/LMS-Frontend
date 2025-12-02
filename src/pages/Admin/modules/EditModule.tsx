import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as Yup from "yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function EditModule() {
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
      .required("Module name is required")
      .min(3, "Name must be at least 3 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters"),
  });

  // Fetch module details for editing
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/modules/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success === false) {
          if (data.error_code === 300) {
            setMessage(data.message);
            navigate("/admin");
          } else {
            setMessage(data.message || "Failed to fetch module");
          }
          if (data.error_code === 401) {
            navigate("/permission-denied");
          }
        } else {
          setFormData({
            name: data.data.name || "",
            description: data.data.description || "",
            status: data.data.status || "active",
          });
        }
      } catch (error) {
        console.error("Error fetching module:", error);
        setMessage("Failed to load module.");
      }
    };

    if (id) fetchModule();
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
      const response = await fetch(`${apiBaseUrl}/modules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success === false) {
        if (data.error_code === 300) {
          setMessage(data.message);
          navigate("/");
        } else {
          setMessage(data.message || "Failed to update module");
        }
      } else {
        setMessage("Module updated successfully!");
        // redirect after success
        setTimeout(() => navigate("/module"), 1000);
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
        title="BBD ED LMS | Edit Module"
        description="BBD ED LMS - Edit Module"
      />
      <PageBreadcrumb pageTitle="Edit Module" />

      <div className="space-y-6">
        <ComponentCard title="Edit Module">
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
            {/* Module Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Module Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter module name"
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
              {loading ? "Updating..." : "Update Module"}
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
