import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ComponentCard from "../common/ComponentCard";
import Select from "react-select";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function EditAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [maxMarks, setMaxMarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/courses/list-by-user/all`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data && Array.isArray(data.data)) setCourses(data.data);
        else if (Array.isArray(data)) setCourses(data);
        else setCourses([]);
      } catch {
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    const fetchAssignment = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/course-assignments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        // try multiple shapes
        const item = data?.data ?? data;
        if (item) {
          setTitle(item.title || "");
          setDescription(item.description || "");
          setCourseId(item.course_id ?? item.course?.id ?? item.course_id);
          setDueDate(item.due_date ? new Date(item.due_date) : null);
          setMaxMarks(item.max_marks ? String(item.max_marks) : "");
        }
      } catch (err) {
        setMessage("Failed to load assignment");
      }
    };
    fetchAssignment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const schema = Yup.object().shape({
      course_id: Yup.number().typeError("Course is required").required("Course is required"),
      title: Yup.string().required("Title is required").max(255),
      description: Yup.string().required("Description is required").max(5000),
      due_date: Yup.date().nullable().required("Due date is required"),
      max_marks: Yup.string().required("Max marks is required").matches(/^[0-9]+$/, "Enter a valid number"),
    });

    try {
      await schema.validate({ course_id: courseId, title, description, due_date: dueDate, max_marks: maxMarks }, { abortEarly: false });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: { [k: string]: string } = {};
        err.inner.forEach((e: any) => { if (e.path) newErrors[e.path] = e.message; });
        setErrors(newErrors);
        return;
      }
      setMessage(err.message || "Validation failed");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('course_id', courseId ? String(courseId) : '');
      body.append('title', title);
      body.append('description', description);
      body.append('due_date', dueDate ? dueDate.toISOString() : '');
      body.append('max_marks', maxMarks ?? '');
      if (file) body.append('file_path', file);

      const res = await fetch(`${apiBaseUrl}/course-assignments/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (data.success !== false) {
        setMessage(data.message || 'Assignment updated');
        navigate('/Assignment/list');
      } else {
        setMessage(data.message || 'Failed to update assignment');
      }
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title={<span>Edit Assignment</span>}>
      {message && (<p className={`mt-2 text-sm ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>)}

      <form onSubmit={handleSubmit} className="space-y-4 mt-3" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <Select
              name="course_id"
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
              value={courseId ? { value: courseId, label: courses.find((c) => c.id === courseId)?.title || String(courseId) } : null}
              onChange={(selected: any) => setCourseId(selected ? selected.value : null)}
              placeholder="Search or select course"
              classNamePrefix="react-select"
              isClearable
            />
            {errors.course_id && <p className="text-red-600 text-sm mt-1">{errors.course_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-lg border p-2 ${errors.title ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`w-full rounded-lg border p-2 ${errors.description ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <DatePicker
              selected={dueDate}
              onChange={(d) => setDueDate(d)}
              dateFormat="yyyy-MM-dd"
              className={`w-full rounded-lg border p-2 ${errors.due_date ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.due_date && <p className="text-red-600 text-sm mt-1">{errors.due_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Marks</label>
            <input
              name="max_marks"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className={`w-full rounded-lg border p-2 ${errors.max_marks ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.max_marks && <p className="text-red-600 text-sm mt-1">{errors.max_marks}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Attachment</label>
          <input name="file_path" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
          {errors.file_path && <p className="text-red-600 text-sm mt-1">{errors.file_path}</p>}
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Updating..." : "Update Assignment"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
