import { useState, useEffect } from "react";
import Select from "react-select";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function AddBatch() {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    organization_id: string;
    session_id: string;
    semester_id: string;
    course_id: string;
    start_date: Date | null;
    end_date: Date | null;
    status: string;
  }>({
    name: "",
    description: "",
    organization_id: "",
    session_id: "",
    semester_id: "",
    course_id: "",
    start_date: null,
    end_date: null,
    status: "active",
  });

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const schema = Yup.object().shape({
    name: Yup.string().required("Batch name is required"),
    organization_id: Yup.string().required("Organization is required"),
    session_id: Yup.string().required("Session is required"),
    semester_id: Yup.string().required("Semester is required"),
    course_id: Yup.string().required("Course is required"),
    description: Yup.string().required("Description is required"),
    start_date: Yup.date().nullable().required("Start date & time are required"),
    end_date: Yup.date()
      .nullable()
      .required("End date & time are required")
      .min(Yup.ref("start_date"), "End date must be after start date"),
    status: Yup.string().required("Status is required"),
  });


  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const [orgRes, sessionRes, semRes, courseRes] = await Promise.all([
          fetch(`${apiBaseUrl}/organizations/list/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBaseUrl}/session/list/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBaseUrl}/semesters/list/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBaseUrl}/courses/list/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [orgData, sessionData, semData, courseData] = await Promise.all([
          orgRes.json(),
          sessionRes.json(),
          semRes.json(),
          courseRes.json(),
        ]);

        if (orgData.success) setOrganizations(orgData.data);
        if (sessionData.success) setSessions(sessionData.data);
        if (semData.success) setSemesters(semData.data);
        if (courseData.success) setCourses(courseData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await schema.validate(formData, { abortEarly: false });
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        start_date: formData.start_date ? formData.start_date.toISOString() : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
      };

      const response = await fetch(`${apiBaseUrl}/student-batches/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Batch created successfully!");
        setFormData({
          name: "",
          description: "",
          organization_id: "",
          session_id: "",
          semester_id: "",
          course_id: "",
          start_date: null,
          end_date: null,
          status: "active",
        });
      } else {
        setMessage(data.message || "Failed to create batch");
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
      <PageMeta title="BBD ED LMS | Add Batch" description="Add a new batch" />
      <PageBreadcrumb pageTitle="Add Batch" />
      <div className="space-y-6">
        <ComponentCard title="Add Batch">
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
            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Batch Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>

            {/* Organization, Session, Semester (3 in one row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Organization */}
              <div>
                <label className="block text-sm font-medium mb-1">Organization</label>
                <Select
                  name="organization_id"
                  options={organizations.map((o) => ({ value: o.id, label: o.org_name }))}
                  value={
                    formData.organization_id
                      ? {
                          value: formData.organization_id,
                          label:
                            organizations.find(
                              (org) => org.id === formData.organization_id
                            )?.org_name || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      organization_id: selectedOption ? selectedOption.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, organization_id: "" }));
                  }}
                  placeholder="Search or select organization"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.organization_id ? "#f87171" : "#d1d5db",
                      borderRadius: "0.5rem",
                      padding: "2px",
                    }),
                  }}
                  isClearable
                />
                {errors.organization_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.organization_id}</p>
                )}
              </div>


              {/* Session */}
              <div>
                <label className="block text-sm font-medium mb-1">Session</label>
                <Select
                  name="session_id"
                  options={sessions.map((s) => ({ value: s.session, label: s.session }))}
                  value={
                    formData.session_id
                      ? {
                          value: formData.session_id,
                          label:
                            sessions.find((sess) => sess.session === formData.session_id)?.session ||
                            "",
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      session_id: selectedOption ? selectedOption.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, session_id: "" }));
                  }}
                  placeholder="Search or select session"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.session_id ? "#f87171" : "#d1d5db",
                      borderRadius: "0.5rem",
                      padding: "2px",
                    }),
                  }}
                  isClearable
                />
                {errors.session_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.session_id}</p>
                )}
              </div>


              {/* Semester */}
              <div>
                <label className="block text-sm font-medium mb-1">Semester</label>
                <Select
                  name="semester_id"
                  options={semesters.map((sem) => ({ value: sem.code, label: sem.name }))}
                  value={
                    formData.semester_id
                      ? {
                          value: formData.semester_id,
                          label:
                            semesters.find((s) => s.code === formData.semester_id)?.name || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      semester_id: selectedOption ? selectedOption.value : "",
                    }));
                    setErrors((prev) => ({ ...prev, semester_id: "" }));
                  }}
                  placeholder="Search or select semester"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.semester_id ? "#f87171" : "#d1d5db",
                      borderRadius: "0.5rem",
                      padding: "2px",
                    }),
                  }}
                  isClearable
                />
                {errors.semester_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.semester_id}</p>
                )}
              </div>

            </div>

            {/* Course + Start + End Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Course */}
              <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <Select
                name="course_id"
                options={courses.map((c) => ({ value: c.id, label: c.title }))}
                value={
                  formData.course_id
                    ? { value: formData.course_id, label: courses.find((c) => c.id === formData.course_id)?.title || "" }
                    : null
                }
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    course_id: selectedOption ? selectedOption.value : "",
                  }));
                  setErrors((prev) => ({ ...prev, course_id: "" }));
                }}
                placeholder="Search or select course"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.course_id ? "#f87171" : "#d1d5db",
                    borderRadius: "0.5rem",
                    padding: "2px",
                  }),
                }}
                isClearable
              />
              {errors.course_id && (
                <p className="text-red-600 text-sm mt-1">{errors.course_id}</p>
              )}
            </div>

              {/* Start Date & Time */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                <DatePicker
                  selected={formData.start_date}
                  onChange={(date) => handleDateChange("start_date", date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  placeholderText="Select start date & time"
                  wrapperClassName="w-full"
                  className={`w-full rounded-lg border p-2 h-[42px] ${
                    errors.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-600 text-sm">{errors.start_date}</p>
                )}
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-sm font-medium mb-1">End Date & Time</label>
                <DatePicker
                  selected={formData.end_date}
                  onChange={(date) => handleDateChange("end_date", date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  placeholderText="Select end date & time"
                  wrapperClassName="w-full"
                  className={`w-full rounded-lg border p-2 h-[42px] ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_date && (
                  <p className="text-red-600 text-sm">{errors.end_date}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                rows={3}
              />
              {errors.description && (
                <p className="text-red-600 text-sm">{errors.description}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-red-600 text-sm">{errors.status}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Batch"}
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
