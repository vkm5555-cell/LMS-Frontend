import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { useNavigate } from "react-router"; // Removed unused import
import * as Yup from "yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function AddUser() {
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    role: string;
    email: string;
    mobile: string;
    dob: Date | null;
    father_name: string;
    mother_name: string;
  }>({
    name: "",
    username: "",
    password: "",
    role: "",
    email: "",
    mobile: "",
    dob: null,
    father_name: "",
    mother_name: "",
  });
  const [roles, setRoles] = useState<string[]>([]);
  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/roles`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setRoles(data.data.map((r: any) => r.name));
        } else {
          setRoles(["student", "teacher", "admin"]);
        }
      } catch {
        setRoles(["student", "teacher", "admin"]);
      }
    };
    fetchRoles();
  }, []);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // const navigate = useNavigate(); // Removed unused variable

  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
    role: Yup.string().required("Role is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string().required("Mobile is required"),
  dob: Yup.date().nullable(),
    father_name: Yup.string(),
    mother_name: Yup.string(),
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, dob: date }));
    setErrors((prev) => ({ ...prev, dob: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const token = localStorage.getItem("token");
      //const user_role = localStorage.getItem("role");
      const response = await fetch(`${apiBaseUrl}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("User created successfully!");
        //setTimeout(() => navigate("/users"), 1000);
      } else {
        setMessage(data.message || "Failed to create user");
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
      <PageMeta title="BBD ED LMS | Add User" description="BBD ED LMS - Add User" />
      <PageBreadcrumb pageTitle="Add User" />
      <div className="space-y-6">
        <ComponentCard title="Add User">
          {message && (
            <p className={`mt-3 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.name ? "border-red-500" : "border-gray-300"}`} />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.username ? "border-red-500" : "border-gray-300"}`} />
              {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.password ? "border-red-500" : "border-gray-300"}`} />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.role ? "border-red-500" : "border-gray-300"}`}>
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
              {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.email ? "border-red-500" : "border-gray-300"}`} />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.mobile ? "border-red-500" : "border-gray-300"}`} />
              {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <DatePicker
                selected={formData.dob}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                className={`w-full rounded-lg border p-2 ${errors.dob ? "border-red-500" : "border-gray-300"}`}
                placeholderText="Select date of birth"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Father's Name</label>
              <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.father_name ? "border-red-500" : "border-gray-300"}`} />
              {errors.father_name && <p className="text-red-600 text-sm mt-1">{errors.father_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother's Name</label>
              <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={`w-full rounded-lg border p-2 ${errors.mother_name ? "border-red-500" : "border-gray-300"}`} />
              {errors.mother_name && <p className="text-red-600 text-sm mt-1">{errors.mother_name}</p>}
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
