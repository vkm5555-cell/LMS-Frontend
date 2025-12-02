import { useState } from "react";
import * as yup from 'yup';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

export default function AddCourseChapter() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Array<{ title: string; description: string; order: number; course_id?: string; user_id?: number }>>([
    { title: "", description: "", order: 1 },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<number, { title?: string; description?: string; order?: string }>>({});
  const [loadingSave, setLoadingSave] = useState(false);
  const { id: course_id } = useParams<{ id: string }>();

  const addChapter = () => setChapters(prev => [...prev, { course_id: course_id, title: "", description: "", order: prev.length + 1 }]);

  const updateChapter = (index: number, key: 'title' | 'description' | 'order', value: string | number) => {
    setChapters(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: key === 'order' ? Number(value) : value } as any;
      return next;
    });
  };

  const removeChapter = (index: number) => {
    // Do not allow removing the first (base) row to ensure at least one chapter remains
    if (index === 0) return;
    setChapters(prev => {
      const next = prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i + 1 }));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    // validation: each chapter needs a title
    // prepare payload for validation
    const payloadToValidate = [...chapters].sort((a, b) => (a.order || 0) - (b.order || 0)).map((c, idx) => ({ ...c, order: idx + 1, course_id }));

    // Yup schema
    const schema = yup.object({
      chapters: yup.array().of(
        yup.object({
          title: yup.string().required('Title is required').max(255, 'Title is too long'),
          description: yup.string().max(2000, 'Description is too long').nullable(),
          order: yup.number().required('Order is required').min(1, 'Order must be at least 1').integer('Order must be an integer'),
        })
      ).min(1, 'At least one chapter is required')
    });

    try {
      await schema.validate({ chapters: payloadToValidate }, { abortEarly: false });
    } catch (valErr: any) {
      if (valErr?.inner && Array.isArray(valErr.inner)) {
        const perField: Record<number, any> = {};
        for (const item of valErr.inner) {
          // item.path like 'chapters[0].title'
          const m = /chapters\[(\d+)\]\.?(\w+)?/.exec(item.path || '');
          if (m) {
            const idx = Number(m[1]);
            const key = m[2] || 'title';
            perField[idx] = perField[idx] || {};
            perField[idx][key] = item.message;
          } else {
            // global error
            setError(item.message);
          }
        }
        setFieldErrors(perField);
        setError('Please fix the highlighted errors.');
        return;
      }
      setError(valErr?.message || 'Validation failed');
      return;
    }
    if (!course_id) {
      setError('Course ID not found in URL. Unable to save chapters.');
      return;
    }

    setLoadingSave(true);
    try {
      // sort by order before sending and attach course_id to each chapter
    const payload = payloadToValidate.map((c, _idx) => ({ ...c, user_id: 0 }));
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/chapters/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ course_id, chapters: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Server responded with ${res.status}`);
      }
      const data = await res.json().catch(() => ({}));
      setSuccess(data?.message || 'Chapters added successfully!');
      setChapters([{ title: "", description: "", order: 1 }]);
    } catch (err: any) {
      console.error('Save chapters error', err);
      setError(err?.message || 'Unable to save chapters.');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
      <PageMeta title="Add Course Chapter" description="Add a new chapter to a course" />
      <PageBreadcrumb pageTitle="Add Course Chapter" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Add Course Chapters</h1>
              <p className="text-sm text-gray-500 mt-1">Add chapters for the selected course. You can add multiple chapters and remove any before saving.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={addChapter}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-50"
              >
                <span className="text-lg">＋</span>
                <span className="text-sm font-semibold">Add Chapter</span>
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Hidden field to include course id in the form */}
            
            {chapters.map((chapter, idx) => (
              <div key={idx} className="relative rounded-lg border border-gray-100 p-4 shadow-sm">
                {idx > 0 && (
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => removeChapter(idx)}
                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-sm font-medium"
                      aria-label={`Remove chapter ${idx + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                      value={chapter.title}
                      onChange={e => updateChapter(idx, 'title', e.target.value)}
                      placeholder={`Chapter ${idx + 1} title`}
                      
                    />
                    {fieldErrors[idx]?.title && (
                      <div className="text-red-600 text-sm mt-1">{fieldErrors[idx].title}</div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring focus:border-blue-500"
                      value={chapter.description}
                      onChange={e => updateChapter(idx, 'description', e.target.value)}
                      placeholder="Brief description (optional)"
                      rows={4}
                    />
                    {fieldErrors[idx]?.description && (
                      <div className="text-red-600 text-sm mt-1">{fieldErrors[idx].description}</div>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">Order</label>
                    <input
                      type="number"
                      min={1}
                      value={chapter.order}
                      onChange={e => updateChapter(idx, 'order', Number(e.target.value))}
                      className="w-full border rounded px-2 py-2 text-sm"
                    />
                    {fieldErrors[idx]?.order && (
                      <div className="text-red-600 text-sm mt-1">{fieldErrors[idx].order}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-60"
                  disabled={loadingSave}
                >
                  {loadingSave ? 'Saving...' : 'Save Chapters'}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>

              <div className="text-sm text-gray-500">You have {chapters.length} chapter{chapters.length > 1 ? 's' : ''} ready to save.</div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </form>
        </div>
      </div>
    </>
  );
}
