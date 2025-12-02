import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";

export default function AddSubCourseCategory() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    keyword: "",
    parent_category_id: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/course-categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    };
    fetchCategories();
  }, []);

  const schema = Yup.object().shape({
    name: Yup.string().required("Category name is required").min(3, "Name must be at least 3 characters"),
    description: Yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
    keyword: Yup.string().required("Keyword is required"),
    parent_category_id: Yup.string().required("Parent category is required"),
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/course-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          parent_category_id: formData.parent_category_id ? Number(formData.parent_category_id) : null
        }),
      });
      const data = await response.json();
      if (data.success === false) {
        setMessage(data.message || "Failed to add sub course category");
        if (data.error_code === 403) {
          navigate("/permission-denied");
        }
        setFormData({ name: "", description: "", keyword: "", parent_category_id: "" });
      } else {
        setMessage(data.message || "Sub category added successfully!");
        setFormData({ name: "", description: "", keyword: "", parent_category_id: "" });
        setTimeout(() => {
          navigate("/courses/coursecategories/list");
        }, 1000);
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
      <PageMeta title="BBDU LMS | Add Sub Course Category" description="BBDU LMS - Add Sub Course Category" />
      <PageBreadcrumb pageTitle="Add Sub Course Category" />
      <div className="space-y-6">
        <ComponentCard title="Add Sub Course Category">
          {message && (
            <p className={`mt-3 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Parent Category</label>
              <select
                name="parent_category_id"
                value={formData.parent_category_id}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.parent_category_id ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Parent Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.parent_category_id && <p className="text-red-600 text-sm mt-1">{errors.parent_category_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter sub category name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keyword</label>
              <input
                type="text"
                name="keyword"
                placeholder="Enter keyword"
                value={formData.keyword}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.keyword ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.keyword && <p className="text-red-600 text-sm mt-1">{errors.keyword}</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Sub Course Category"}
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
