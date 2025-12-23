import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface InitialValues {
  courseId?: string | number;
  chapterId?: string | number;
  contentId?: string | number;
  question?: string;
  questionType?: 'true_false' | 'mcq';
  showAtSeconds?: number;
  options?: Option[];
}

interface Props {
  initial?: InitialValues;
  editId?: string | number; // if present, component will fetch item and use PUT to save
  submitEndpoint?: string; // if omitted, defaults to /quick-quiz/add (POST)
  method?: 'POST' | 'PUT' | 'PATCH';
  submitLabel?: string;
  onCreated?: (resp: any) => void; // called on successful submit
  onSaved?: (resp: any) => void; // alias for edit flows
  onError?: (err: any) => void;
  // optional callback to run after a successful submit instead of the default clear
}

const defaultEndpoint = (import.meta as any).env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL}/quick-quiz/add`
  : '/quick-quiz/add';

export default function QuickQuizForm({ initial, editId, submitEndpoint, method = 'POST', submitLabel, onCreated, onSaved, onError }: Props) {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
  const endpoint = submitEndpoint ?? defaultEndpoint;

  const [courseId, setCourseId] = useState<string>(String(initial?.courseId ?? ''));
  const [chapterId, setChapterId] = useState<string>(String(initial?.chapterId ?? ''));
  const [contentId, setContentId] = useState<string>(String(initial?.contentId ?? ''));
  const [question, setQuestion] = useState<string>(initial?.question ?? '');
  const [questionType, setQuestionType] = useState<'true_false' | 'mcq'>(initial?.questionType ?? 'true_false');
  const [showAtSeconds, setShowAtSeconds] = useState<number>(Number(initial?.showAtSeconds ?? 0));

  const [options, setOptions] = useState<Option[]>(
    (initial?.options && initial.options.length)
      ? initial!.options.map((o) => ({ id: String(o.id ?? (crypto?.randomUUID ? crypto.randomUUID() : Date.now())), text: o.text ?? '', isCorrect: !!o.isCorrect }))
      : [
          { id: crypto?.randomUUID?.() ?? String(Date.now()), text: '', isCorrect: false },
          { id: crypto?.randomUUID?.() ?? String(Date.now() + 1), text: '', isCorrect: false },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  // If editId is provided, fetch the existing quiz and populate fields
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBase}/quick-quiz/single/${editId}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load');
        const q = json?.data ?? json;
        setCourseId(String(q.course_id ?? q.course?.id ?? q.courseId ?? ''));
        setChapterId(String(q.chapter_id ?? q.chapter?.id ?? q.chapterId ?? ''));
        setContentId(String(q.content_id ?? q.content?.id ?? q.contentId ?? ''));
        setQuestion(q.question ?? '');
        setQuestionType((q.question_type ?? q.questionType ?? 'true_false') as 'true_false' | 'mcq');
        setShowAtSeconds(Number(q.show_at_seconds ?? q.showAtSeconds ?? 0));
        setOptions((q.options || []).map((o: any) => ({ id: String(o.id ?? (crypto?.randomUUID ? crypto.randomUUID() : Date.now())), text: o.text ?? o.title ?? '', isCorrect: Boolean(o.is_correct ?? o.isCorrect) })));
      } catch (err: any) {
        console.error('Failed to load quick quiz for edit', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [editId]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBase}/courses/list-by-user/all`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load courses');
        setCourses(json.data || []);
      } catch (err) {
        console.error('Course fetch failed', err);
      }
    }
    fetchCourses();
  }, []);

  // load chapters when courseId changes (imperative handler style)
  async function handleCourseSelect(selected: any) {
    const id = String(selected?.value ?? '');
    setCourseId(id);
    setChapters([]);
    setChapterId('');
    setContents([]);
    setContentId('');

    if (!id) return;

    setChapterLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const url = `${apiBase}/chapters/by-course/${id}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Bad status ${res.status}`);
      const json = await res.json();
      const list = json?.data ?? json?.chapters ?? json?.items ?? json;
      if (!Array.isArray(list)) throw new Error('No list');
      setChapters(list.map((c: any) => ({ id: c.id ?? c.chapter_id ?? c._id ?? c.chapterId ?? c.chapter_id, title: c.title ?? c.name ?? c.chapter_name ?? String(c.id) })));
    } catch (err) {
      console.error('Failed to load chapters for course', err);
      setChapters([]);
    } finally {
      setChapterLoading(false);
    }
  }

  async function handleChapterSelect(selected: any) {
    const id = String(selected?.value ?? '');
    setChapterId(id);
    setContents([]);
    setContentId('');

    if (!id) return;
    setContentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const url = `${apiBase}/chapters/${id}/contents/select`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Bad status ${res.status}`);
      const json = await res.json();
      const list = json?.data ?? json?.items ?? json?.contents ?? json;
      if (!Array.isArray(list)) throw new Error('No list');
      setContents(list.map((c: any) => ({ id: c.id ?? c.content_id ?? c._id ?? c.contentId ?? String(c.id), title: c.title ?? c.name ?? c.content_title ?? String(c.id) })));
    } catch (err) {
      console.error('Failed to load contents for chapter', err);
      setContents([]);
    } finally {
      setContentLoading(false);
    }
  }

  function updateOption(id: string, patch: Partial<Option>) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }
  function addOption() {
    setOptions((prev) => [...prev, { id: crypto?.randomUUID?.() ?? String(Date.now()), text: '', isCorrect: false }]);
  }
  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }
  function toggleCorrect(id: string) {
    if (questionType === 'true_false') {
      setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.id === id })));
    } else {
      setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // basic validation
    if (!courseId || !chapterId || !contentId) {
      setError('Course, chapter and content IDs are required');
      return;
    }
    if (!question.trim()) {
      setError('Question text is required');
      return;
    }
    if (options.length < 2) {
      setError('Provide at least two options');
      return;
    }
    if (!options.some((o) => o.text.trim())) {
      setError('Options cannot be empty');
      return;
    }

    const payload = {
      courseId: Number(courseId) || courseId,
      chapterId: Number(chapterId) || chapterId,
      contentId: Number(contentId) || contentId,
      question: question.trim(),
      questionType: questionType,
      showAtSeconds: Number(showAtSeconds) || 0,
      options: options.map((o) => ({ text: o.text.trim(), isCorrect: !!o.isCorrect })),
    } as any;

    const userId = localStorage.getItem('user_id') ?? null;
    if (userId) {
      payload.user_id = Number(userId) || userId;
      payload.student_id = Number(userId) || userId;
    }

    setLoading(true);
    try {
      // Determine final endpoint and method: if editId present, save to /quick-quiz/{id} using PUT unless overridden
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      let url = endpoint;
      let httpMethod = method ?? 'POST';
      if (editId) {
        url = submitEndpoint ?? `${apiBase}/quick-quiz/${editId}`;
        httpMethod = method === 'POST' ? 'PUT' : method;
      }

      const res = await fetch(url, { method: httpMethod, headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || JSON.stringify(json) || `Server ${res.status}`);
      }
      setSuccess(json);
      if (!editId && httpMethod === 'POST' && onCreated) onCreated(json);
      if (editId && (httpMethod === 'PUT' || httpMethod === 'PATCH') && onSaved) onSaved(json);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col text-sm">
          Course
          <Select
            options={courses.map((c) => ({ value: c.id, label: c.title }))}
            onChange={(opt) => handleCourseSelect(opt)}
            placeholder={chapterLoading ? 'Loading chapters…' : 'Select course...'}
            isSearchable
            isClearable
            value={courseId ? { value: courseId, label: courses.find((c) => String(c.id) === String(courseId))?.title ?? String(courseId) } : null}
          />
        </label>

        <label className="flex flex-col text-sm">
          Chapter
          <Select
            options={chapters.map((c) => ({ value: c.id, label: c.title }))}
            onChange={(opt) => handleChapterSelect(opt)}
            placeholder={chapterLoading ? 'Loading chapters…' : chapters.length ? 'Select chapter...' : 'No chapters'}
            isSearchable
            isClearable
            isLoading={chapterLoading}
            value={chapterId ? { value: chapterId, label: chapters.find((c) => String(c.id) === String(chapterId))?.title ?? String(chapterId) } : null}
          />
        </label>

        <label className="flex flex-col text-sm">
          Content
          <Select
            options={contents.map((c) => ({ value: c.id, label: c.title }))}
            onChange={(opt) => setContentId(String(opt?.value ?? ''))}
            placeholder={contentLoading ? 'Loading contents…' : contents.length ? 'Select content...' : 'No contents'}
            isSearchable
            isClearable
            isLoading={contentLoading}
            value={contentId ? { value: contentId, label: contents.find((c) => String(c.id) === String(contentId))?.title ?? String(contentId) } : null}
          />
        </label>
      </div>

      <label className="flex flex-col text-sm">
        Question
        <textarea className="mt-1 p-2 border rounded" value={question} onChange={(e) => setQuestion(e.target.value)} />
      </label>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 text-sm">
          <input type="radio" name="qtype" checked={questionType === 'true_false'} onChange={() => setQuestionType('true_false')} />
          <span>True / False</span>
        </label>
        <label className="flex items-center space-x-2 text-sm">
          <input type="radio" name="qtype" checked={questionType === 'mcq'} onChange={() => setQuestionType('mcq')} />
          <span>MCQ</span>
        </label>
        <label className="flex items-center space-x-2 text-sm">
          Show at (seconds)
          <input type="number" className="ml-2 w-28 p-1 border rounded" value={showAtSeconds} onChange={(e) => setShowAtSeconds(Number(e.target.value))} />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Options</div>
          <button type="button" onClick={addOption} className="text-sm text-indigo-600">Add option</button>
        </div>

        <div className="mt-2 space-y-2">
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-2">
              <input type={questionType === 'mcq' ? 'checkbox' : 'radio'} checked={opt.isCorrect} onChange={() => toggleCorrect(opt.id)} />
              <input className="flex-1 p-2 border rounded" value={opt.text} onChange={(e) => updateOption(opt.id, { text: e.target.value })} />
              <button type="button" className="text-red-500" onClick={() => removeOption(opt.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}
      {success && <div className="text-sm text-green-600">Saved</div>}

      <div className="flex items-center space-x-3">
        <button type="submit" disabled={loading} className="px-3 py-2 bg-indigo-600 text-white rounded">{loading ? (method === 'POST' ? 'Submitting…' : 'Saving…') : (submitLabel ?? (method === 'POST' ? 'Create Quick Quiz' : 'Save Changes'))}</button>
      </div>
    </form>
  );
}
