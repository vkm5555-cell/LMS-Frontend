import React, { useState, useEffect  } from 'react';
import Select from 'react-select';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Props {
  submitEndpoint?: string; // override backend endpoint
  onCreated?: (quiz: any) => void;
}

const defaultEndpoint = (import.meta as any).env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL}/quick-quiz/add`
  : '/quick-quiz/add';

export default function CreateQuickQuiz({ submitEndpoint, onCreated }: Props) {
  const [courseId, setCourseId] = useState<string>('');
  const [chapterId, setChapterId] = useState<string>('');
  const [contentId, setContentId] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [questionType, setQuestionType] = useState<'true_false' | 'mcq'>('true_false');
  const [showAtSeconds, setShowAtSeconds] = useState<number>(0);
  const [options, setOptions] = useState<Option[]>([
    { id: crypto?.randomUUID?.() ?? String(Date.now()), text: '', isCorrect: false },
    { id: crypto?.randomUUID?.() ?? String(Date.now() + 1), text: '', isCorrect: false },
  ]);

  interface Course {
  id: string | number;
  title: string;
}

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  interface Chapter {
    id: string | number;
    title: string;
  }
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [contents, setContents] = useState<{ id: string | number; title: string }[]>([]);
  const [contentLoading, setContentLoading] = useState(false);


useEffect(() => {
  async function fetchCourses() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${(import.meta as any).env.VITE_API_BASE_URL}/courses/list-by-user/all`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to load courses');

      setCourses(json.data || []);
    } catch (err) {
      console.error('Course fetch failed', err);
    }
  }

  fetchCourses();
}, []);

// We'll load chapters directly when the user picks a course to keep the select handler
// imperative and avoid implicit effects.

async function handleCourseSelect(selected: any) {
  const id = String(selected?.value ?? '');
  setCourseId(id);
  // reset dependent fields
  setChapters([]);
  setChapterId('');
  setContentId('');

  if (!id) return;

  setChapterLoading(true);
  try {
    const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';
    const token = localStorage.getItem('token');
    const headers: Record<string,string> = {};
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
    const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';
    const token = localStorage.getItem('token');
    const headers: Record<string,string> = {};
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

// NOTE: chapter-loading is handled directly in handleCourseSelect to keep a single
// direct call path from the Course Select onChange (user requested one direct call).

  const endpoint = submitEndpoint ?? defaultEndpoint;

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
      // ensure only one correct
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
    };

    // include user identifier (project uses student_id/user_id/id in other places)
    const userId = localStorage.getItem('user_id') ?? null;
    if (userId) {
      (payload as any).user_id = Number(userId) || userId;
      (payload as any).student_id = Number(userId) || userId;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || JSON.stringify(json) || `Server ${res.status}`);
      }
      setSuccess(json);
      if (onCreated) onCreated(json);
      // clear form (optional)
      setQuestion('');
      setOptions([
        { id: crypto?.randomUUID?.() ?? String(Date.now()), text: '', isCorrect: false },
        { id: crypto?.randomUUID?.() ?? String(Date.now() + 1), text: '', isCorrect: false },
      ]);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  }



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col text-sm">
          Course ID
          <Select
            options={courses.map(c => ({ value: c.id, label: c.title }))}
            onChange={(opt) => handleCourseSelect(opt)}
            placeholder={chapterLoading ? 'Loading chapters…' : 'Select course...'}
            isSearchable
            isClearable
            />
        </label>
        <label className="flex flex-col text-sm">
          Chapter
          <Select
            options={chapters.map(c => ({ value: c.id, label: c.title }))}
            onChange={(opt) => handleChapterSelect(opt)}
            placeholder={chapterLoading ? 'Loading chapters…' : (chapters.length ? 'Select chapter...' : 'No chapters')}
            isSearchable
            isClearable
            isLoading={chapterLoading}
          />
        </label>
        <label className="flex flex-col text-sm">
          Content
          <Select
            options={contents.map(c => ({ value: c.id, label: c.title }))}
            onChange={(opt) => setContentId(String(opt?.value ?? ''))}
            placeholder={contentLoading ? 'Loading contents…' : (contents.length ? 'Select content...' : 'No contents')}
            isSearchable
            isClearable
            isLoading={contentLoading}
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
      {success && <div className="text-sm text-green-600">Created — ID: {String(success?.data?.id ?? success?.id ?? '')}</div>}

      <div className="flex items-center space-x-3">
        <button type="submit" disabled={loading} className="px-3 py-2 bg-indigo-600 text-white rounded">{loading ? 'Creating…' : 'Create Quick Quiz'}</button>
      </div>
    </form>
  );
}
