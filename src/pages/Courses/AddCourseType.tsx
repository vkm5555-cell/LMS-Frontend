import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup"; 
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function AddCourseType() {
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
      .required("Course type name is required")
      .min(3, "Name must be at least 3 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters"),
    status: Yup.string()
      .required("Status is required")
      .oneOf(["active", "inactive"], "Invalid status selected"),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      const response = await fetch(`${apiBaseUrl}/course-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          role: user_role
        }),
      });
      const data = await response.json();
      console.log(data); 
      if(data.success == false)
      {
        if(data.error_code === 300)
        {
          setMessage(data.message || data.message);
          navigate("/admin");
        }
        if(data.error_code === 301)
        {
          setMessage(data.message || data.message);
          setFormData({ name: "", description: "", status: "active" });
        }
        if (data.error_code === 403) {
            navigate("/permission-denied");
          }
      }else{
        setMessage(data.message);
        setFormData({ name: "", description: "", status: "active" });
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
      <PageMeta title="BBDU LMS | Add Course Type" description="BBDU LMS - Add Course Type" />
      <PageBreadcrumb pageTitle="Add Course Type" />

      <div className="space-y-6">
        <ComponentCard title="Add Course Type">
          {message && (
            <p
              className={`mt-3 text-sm ${
                message.includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Course Type Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Course Type Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter course type name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
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
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Course Type"}
            </button>
          </form>

          
        </ComponentCard>
      </div>
    </>
  );
}
