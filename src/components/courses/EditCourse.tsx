import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import PageMeta from "../common/PageMeta";

const courseTypeOptions = [
  { id: "free", name: "Free" },
  { id: "paid", name: "Paid" },
];
const courseModes = [
  { id: "online", name: "Online" },
  { id: "offline", name: "Offline" },
  { id: "hybrid", name: "Hybrid" },
];
const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Hindi", "Spanish", "French", "German"];
const cafeteriaOptions = [
  { id: "core", name: "Core" },
  { id: "Elective Courses", name: "Elective Courses" },
  { id: "Skill-based Courses", name: "Skill-based Courses" },
];

export default function EditCourseComponent() {
  const { id } = useParams();
  const [formData, setFormData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [courseCategories, setCourseCategories] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch course details
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFormData(data.data || data.course || data);
      } catch {
        setMessage("Failed to fetch course");
      } finally {
        setLoading(false);
      }
    };
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/course-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const result = data.data;
        if (Array.isArray(result)) {
          setCourseCategories(result.map((cat: any) => ({ id: String(cat.id), name: cat.name })));
        } else if (Array.isArray(result.categories)) {
          setCourseCategories(result.categories.map((cat: any) => ({ id: String(cat.id), name: cat.name })));
        }
      } catch {}
    };
    fetchCourse();
    fetchCategories();
  }, [id]);

  const schema = Yup.object().shape({
    cafeteria: Yup.string().required("Cafeteria is required").max(200),
    nsqf_level: Yup.string().required("NSQF Level is required").max(200),
    credit: Yup.string().required("Credit is required").max(200),
    course_time: Yup.string().required("Course Time is required").max(200),
    title: Yup.string().required("Title is required").max(200),
    description: Yup.string().required("Description is required").max(5000),
    subtitle: Yup.string().required("Subtitle is required").max(255),
    learning_objectives: Yup.string().required("Learning objectives are required").max(2000),
    requirements: Yup.string().required("Requirements are required").max(2000),
    language: Yup.string().required("Language is required"),
    level: Yup.string().required("Level is required"),
    category_id: Yup.string().required("Course category is required"),
    course_mode: Yup.string().required("Course mode is required"),
    course_type: Yup.string().required("Course type is required"),
    course_price: Yup.string().when('course_type', {
      is: 'paid',
      then: (schema) => schema.required('Course price is required').matches(/^[0-9]+(\.[0-9]{1,2})?$/, 'Enter a valid price'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (name === "course_thumb" && type === "file" && files && files[0]) {
      setImageFile(files[0]);
      setErrors((prev) => ({ ...prev, course_thumb: "" }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
  // Add fields present in AddCourse form so updates include them
      formDataToSend.append("cafeteria", formData.cafeteria ?? "");
      formDataToSend.append("nsqf_level", formData.nsqf_level ?? "");
      formDataToSend.append("credit", formData.credit ?? "");
      formDataToSend.append("course_time", formData.course_time ?? "");
      formDataToSend.append("description", formData.description);
      formDataToSend.append("subtitle", formData.subtitle);
      formDataToSend.append("learning_objectives", formData.learning_objectives);
      formDataToSend.append("requirements", formData.requirements);
      formDataToSend.append("language", formData.language);
      formDataToSend.append("subtitle_languages", 'English');
      formDataToSend.append("slug", "Test");
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("course_mode", formData.course_mode);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("course_type", formData.course_type);
      if (formData.course_type === "paid") {
        formDataToSend.append("course_price", formData.course_price);
      } else {
        formDataToSend.append("course_price", '0.0');
      }
      if (imageFile) {
        formDataToSend.append("course_thumb", imageFile);
      }
      formDataToSend.append("promo_video_url", formData.promo_video_url);
      formDataToSend.append("user_id", formData.user_id ? String(formData.user_id) : "");
      formDataToSend.append("topic_tags", formData.topic_tags);
      const response = await fetch(`${apiBaseUrl}/courses/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.success === false) {
        setMessage(data.message || "Failed to update course");
        if (data.error_code === 403) {
          navigate("/permission-denied");
        }
      } else {
        setMessage(data.message || "Course updated successfully!");
        // Optionally redirect after save
        setTimeout(() => navigate("/courses"), 1000);
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

  if (!formData) return <div>Loading...</div>;

  return (
    <>
      <PageMeta title="BBDU LMS | Edit Course" description="BBDU LMS - Edit Course" />
      
      <PageBreadcrumb pageTitle="Edit Course" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <span>Edit Course</span>
              <button
                className="ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => navigate("/courses")}
              >
                Back
              </button>
            </div>
          }
        >
        {/* <ComponentCard title="Edit Course"> */}
          {message && (
            <p className={`mt-3 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Course Category</label>
                <select
                  name="category_id"
                  value={formData.category_id} 
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.category_id ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Category</option>
                  {courseCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course Mode</label>
                <select
                  name="course_mode"
                  value={formData.course_mode}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.course_mode ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Mode</option>
                  {courseModes.map(mode => (
                    <option key={mode.id} value={mode.id}>{mode.name}</option>
                  ))}
                </select>
                {errors.course_mode && <p className="text-red-600 text-sm mt-1">{errors.course_mode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="Enter course subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.subtitle ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.subtitle && <p className="text-red-600 text-sm mt-1">{errors.subtitle}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter course description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learning Objectives</label>
                <textarea
                  name="learning_objectives"
                  placeholder="Enter learning objectives"
                  value={formData.learning_objectives}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.learning_objectives ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.learning_objectives && <p className="text-red-600 text-sm mt-1">{errors.learning_objectives}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <textarea
                  name="requirements"
                  placeholder="Enter requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.requirements ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course Type</label>
                <select
                  name="course_type"
                  value={formData.course_type}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.course_type ? "border-red-500" : "border-gray-300"}`}
                >
                  {courseTypeOptions.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors.course_type && <p className="text-red-600 text-sm mt-1">{errors.course_type}</p>}
              </div>
              {formData.course_type === "paid" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Course Price</label>
                  <input
                    type="number"
                    name="course_price"
                    placeholder="Enter course price"
                    value={formData.course_price}
                    onChange={handleChange}
                    className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.course_price ? "border-red-500" : "border-gray-300"}`}
                    min="0"
                  />
                  {errors.course_price && <p className="text-red-600 text-sm mt-1">{errors.course_price}</p>}
                </div>
              ) : <div />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Cafeteria</label>
                <select
                  name="cafeteria"
                  value={formData.cafeteria}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.cafeteria ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Cafeteria</option>
                  {cafeteriaOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                {errors.cafeteria && <p className="text-red-600 text-sm mt-1">{errors.cafeteria}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit</label>
                <input
                  type="text"
                  name="credit"
                  value={formData.credit}
                  placeholder="Enter Credit"
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.credit ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.credit && <p className="text-red-600 text-sm mt-1">{errors.credit}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NSQF Level</label>
                <input
                  type="text"
                  name="nsqf_level"
                  value={formData.nsqf_level}
                  placeholder="Enter NSQF Level"
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.nsqf_level ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.nsqf_level && <p className="text-red-600 text-sm mt-1">{errors.nsqf_level}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Course Time</label>
                <input
                  type="text"
                  name="course_time"
                  value={formData.course_time}
                  placeholder="Enter Course Time"
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.course_time ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.course_time && <p className="text-red-600 text-sm mt-1">{errors.course_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.language ? "border-red-500" : "border-gray-300"}`}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {errors.language && <p className="text-red-600 text-sm mt-1">{errors.language}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.level ? "border-red-500" : "border-gray-300"}`}
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.level && <p className="text-red-600 text-sm mt-1">{errors.level}</p>}
              </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Course Thumbnail Image</label>
                <input
                  type="file"
                  name="course_thumb"
                  accept="image/*"
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.course_thumb ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.course_thumb && <p className="text-red-600 text-sm mt-1">{errors.course_thumb}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Promo Video URL</label>
                <input
                  type="text"
                  name="promo_video_url"
                  placeholder="Enter promo video URL"
                  value={formData.promo_video_url}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-2 focus:border-indigo-500 focus:ring-indigo-500 ${errors.promo_video_url ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.promo_video_url && <p className="text-red-600 text-sm mt-1">{errors.promo_video_url}</p>}
              </div>
              <div />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
