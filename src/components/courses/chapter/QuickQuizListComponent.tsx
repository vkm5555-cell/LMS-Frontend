import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import usePagination from '../../../hooks/usePagination';
import { useNavigate } from 'react-router-dom';

interface Props {
  apiBase?: string;
  listEndpoint?: string;
}

export default function QuickQuizListComponent({ apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '', listEndpoint }: Props) {
  const endpoint = listEndpoint ?? `${apiBase}/quick-quiz/list`;
  const { page, setPage, pageSize, setPageSize, total, setTotal, totalPages, buildPaginationParams } = usePagination({ initialPage: 1, initialPageSize: 10 });

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<{ q?: string; course_id?: string | number; chapter_id?: string | number; content_id?: string | number }>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  // replicate the course/chapter/content fetching behavior from CreateQuickQuiz
  const [chapterLoading, setChapterLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBase}/courses/list-by-user/all`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load courses');
        setCourses(json.data || []);
      } catch (err) {
        console.error('Course fetch failed', err);
      }
    }
    fetchCourses();
  }, []);

  async function handleCourseSelect(selected: any) {
    const id = String(selected?.value ?? '');
    setSelectedCourse(selected);
    // reset dependent fields
    setChapters([]);
    setSelectedChapter(null);
    setContents([]);
    setSelectedContent(null);

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
    setSelectedChapter(selected);
    setContents([]);
    setSelectedContent(null);

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

  // debounce search -> filters.q
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: searchInput || undefined }));
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // build combined filters when selects change
  useEffect(() => {
    setFilters((prev) => ({ ...prev, course_id: selectedCourse?.value ?? undefined, chapter_id: selectedChapter?.value ?? undefined, content_id: selectedContent?.value ?? undefined }));
    setPage(1);
  }, [selectedCourse, selectedChapter, selectedContent]);

  // fetch items when page, pageSize or filters change
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const params = buildPaginationParams(filters as any);
        // also include broad search keys
        if (filters.q) {
          params.set('search', String(filters.q));
          params.set('q', String(filters.q));
        }
        if (filters.course_id) params.set('course_id', String(filters.course_id));
        if (filters.chapter_id) params.set('chapter_id', String(filters.chapter_id));
        if (filters.content_id) params.set('content_id', String(filters.content_id));

        if (import.meta.env.DEV) console.debug('QuickQuiz list params', params.toString());
        const res = await fetch(`${endpoint}?${params.toString()}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed');

        const list = json?.data?.items ?? json?.items ?? (Array.isArray(json?.data) ? json.data : undefined) ?? (Array.isArray(json) ? json : []);
        const totalCount = Number(json?.data?.total ?? json?.total ?? json?.count ?? json?.meta?.total ?? list.length) || 0;
        setItems(list);
        setTotal(totalCount);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [page, pageSize, filters]);

  // close any open action dropdown when clicking outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest('.course-action-dropdown') || target.closest('[data-dropdown-toggle]')) return;
      if (openDropdown !== null) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [openDropdown]);

  const handleAction = async (action: string, item: any) => {
    setOpenDropdown(null);
    const token = localStorage.getItem('token');
    if (action === 'View') {
      alert(JSON.stringify(item, null, 2));
      return;
    }
    if (action === 'Edit') {
      // navigate to the edit page we added
      navigate(`/quick-quiz/edit/${item.id}`);
      return;
    }
    if (action === 'Delete') {
      if (!window.confirm('Are you sure you want to delete this quick quiz?')) return;
      try {
        const res = await fetch(`${apiBase}/quick-quiz/${item.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
        const data = await res.json();
        if (res.ok) {
          setItems((prev) => prev.filter((it) => it.id !== item.id));
        } else {
          alert(data?.message || 'Failed to delete');
        }
      } catch (e) {
        alert('Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <input className="border rounded px-2 py-1" placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />

  <Select options={courses.map((c) => ({ value: c.id, label: c.title }))} value={selectedCourse} onChange={(v) => handleCourseSelect(v)} isClearable isLoading={false} />
  <Select options={chapters.map((c) => ({ value: c.id, label: c.title }))} value={selectedChapter} onChange={(v) => handleChapterSelect(v)} isClearable isLoading={chapterLoading} />
  <Select options={contents.map((c) => ({ value: c.id, label: c.title }))} value={selectedContent} onChange={(v) => setSelectedContent(v)} isClearable isLoading={contentLoading} />

        <div className="ml-auto">Total: {total}</div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course / Chapter / Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((it: any, idx: number) => (
              <tr key={it.id}>
                <td className="px-6 py-2 whitespace-nowrap">{(page - 1) * pageSize + idx + 1}</td>
                <td className="px-6 py-2 whitespace-nowrap">{it.question ?? it.title ?? it.text ?? '-'}</td>
                <td className="px-6 py-2 whitespace-nowrap">{it.question_type ?? '-'}</td>
                <td className="px-6 py-2 whitespace-nowrap">{(it.course?.title ?? it.course_title ?? it.course_name ?? '-') + ' / ' + (it.chapter?.title ?? it.chapter_title ?? '-') + ' / ' + (it.content?.title ?? it.content_title ?? '-')}</td>
                <td className="px-6 py-2 whitespace-nowrap relative"> 
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onClick={() => setOpenDropdown((prev) => (prev === String(it.id) ? null : String(it.id)))}
                    data-dropdown-toggle
                    aria-label="Actions"
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="2" fill="#6B7280" />
                      <circle cx="12" cy="12" r="2" fill="#6B7280" />
                      <circle cx="19" cy="12" r="2" fill="#6B7280" />
                    </svg>
                  </button>
                  {openDropdown === String(it.id) && (
                    <div className="absolute right-0 z-20 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl animate-fade-in course-action-dropdown">
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition" onClick={() => handleAction('View', it)}>👁️ View</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition" onClick={() => handleAction('Edit', it)}>✏️ Edit</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition" onClick={() => handleAction('Delete', it)}>🗑️ Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
        <div className="flex items-center gap-2">
          {(() => {
            const totalP = Math.max(1, totalPages);
            const pageWindow = 5;
            let start = Math.max(1, page - Math.floor(pageWindow / 2));
            let end = Math.min(totalP, start + pageWindow - 1);
            if (end - start + 1 < pageWindow) start = Math.max(1, end - pageWindow + 1);
            const buttons = [] as React.ReactNode[];
            for (let p = start; p <= end; p++) buttons.push(<button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p}</button>);
            return buttons;
          })()}
        </div>
        <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || total === 0}>Next</button>
      </div>
    </div>
  );
}
