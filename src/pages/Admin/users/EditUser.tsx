import { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function EditUser() {
  type RoleType = { id: string; name: string };
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    role_id: number[];
    email: string;
    mobile: string;
    dob: Date | null;
    father_name: string;
    mother_name: string;
  }>({
    name: "",
    username: "",
    password: "",
    role_id: [],
    email: "",
    mobile: "",
    dob: null,
    father_name: "",
    mother_name: "",
  });
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string(),
    role_id: Yup.array().of(Yup.number()).min(1, "Role is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string().required("Mobile is required"),
    dob: Yup.date().nullable(),
    father_name: Yup.string(),
    mother_name: Yup.string(),
  });

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
          setRoles(data.data.map((r: any) => ({ id: Number(r.id), name: r.name })));
        } else {
          setRoles([]);
        }
      } catch {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/users/getUser/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          // Normalize role_id to always be an array of numbers (int)
          let userRoles: number[] = [];
          if (Array.isArray(data.data.roles)) {
            userRoles = data.data.roles.map((r: any) => typeof r === 'object' ? Number(r.id) : Number(r));
          } else if (data.data.roles) {
            userRoles = [Number(data.data.roles)];
          }
          //console.log('Fetched user roles:', userRoles);
          setFormData({
            name: data.data.name || "",
            username: data.data.username || "",
            password: "", // Don't prefill password
            role_id: userRoles, // If not admin, set to 'student' role
            email: data.data.email || "",
            mobile: data.data.mobile || "",
            dob: data.data.dob ? new Date(data.data.dob) : null,
            father_name: data.data.father_name || "",
            mother_name: data.data.mother_name || "",
          });
        }
      } catch {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, dob: date }));
    setErrors((prev) => ({ ...prev, dob: "" }));
  };

  // Function to update user
  const updateUser = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${apiBaseUrl}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          role_id: formData.role_id.map(Number),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("User updated successfully!");
        setTimeout(() => navigate("/users"), 1000);
      } else {
        setMessage(data.message || "Failed to update user");
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await schema.validate(formData, { abortEarly: false });
      await updateUser();
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
    }
  };

  return (
    <>
      <PageMeta title="BBD ED LMS | Edit User" description="BBD ED LMS - Edit User" />
      <PageBreadcrumb pageTitle="Edit User" />
      <div className="space-y-6">
        <ComponentCard title="Edit User">
          {message && (
            <p className={`mt-3 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select
                  isMulti
                  name="role_id"
                  options={roles.map(role => ({ value: Number(role.id), label: role.name }))}
                  value={roles.filter(role => formData.role_id.includes(Number(role.id))).map(role => ({ value: Number(role.id), label: role.name }))}
                  onChange={(selected) => {
                    const selectedIds = Array.isArray(selected) ? selected.map((s) => Number(s.value)) : [];
                    setFormData((prev) => ({ ...prev, role_id: selectedIds }));
                    setErrors((prev) => ({ ...prev, role_id: "" }));
                  }}
                  classNamePrefix="react-select"
                  className="w-full"
                  placeholder="Select roles..."
                />
                {formData.role_id.length > 0 && (
                  <div className="mt-2 text-sm text-gray-700">
                    Selected: {roles.filter(r => formData.role_id.includes(Number(r.id))).map(r => r.name).join(", ")}
                  </div>
                )}
                {errors.role_id && <p className="text-red-600 text-sm mt-1">{errors.role_id}</p>}
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
            </div>
            <div>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
