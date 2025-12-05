import { useState } from "react";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ComponentCard from "../common/ComponentCard";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

type Props = {
  onCreated?: (data?: any) => void;
};

export default function CreateAssignment({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [maxMarks, setMaxMarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    // validate with Yup (include attachment so it's reported inline)
    const schema = Yup.object().shape({
      title: Yup.string().required("Title is required").max(255),
      description: Yup.string().required("Description is required").max(5000),
      due_date: Yup.date().nullable().required("Due date is required"),
      max_marks: Yup.string().required("Max marks is required").matches(/^[0-9]+$/, "Enter a valid number"),
      attachment: Yup.mixed().required("Attachment is required"),
    });
    try {
      await schema.validate({ title, description, due_date: dueDate, max_marks: maxMarks, attachment: file }, { abortEarly: false });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const newErrors: { [k: string]: string } = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
        return;
      }
      setMessage(err.message || "Validation failed");
      return;
    }
    // only set loading after validation passes
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = new FormData();
      body.append("title", title);
      body.append("description", description);
      body.append("due_date", dueDate ? dueDate.toISOString() : "");
      body.append("max_marks", maxMarks ?? "");
      if (file) {
        body.append("attachment", file);
      }

      const res = await fetch(`${apiBaseUrl}/assignments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || "Assignment created successfully");
        setTitle("");
        setDescription("");
        setDueDate(null);
        setMaxMarks("");
        setFile(null);
        onCreated && onCreated(data.data || data);
      } else {
        setMessage(data.message || "Failed to create assignment");
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title={<span>Create Assignment</span>}>
      {message && (
        <p className={`mt-2 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-3">
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
            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            {errors.attachment && <p className="text-red-600 text-sm mt-1">{errors.attachment}</p>}
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
