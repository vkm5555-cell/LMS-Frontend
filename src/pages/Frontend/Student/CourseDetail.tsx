import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import Pagination from '../../../components/common/Pagination';
import Navbar from '../../../components/common/frontend/Navbar';
import FrontFooter from '../../../components/common/frontend/FrontFooter';
import { Modal } from '../../../components/ui/modal';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any | null>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState<boolean | null>(null);
  const [hasPrev, setHasPrev] = useState<boolean | null>(null);
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [chapterItems, setChapterItems] = useState<Record<number, any[]>>({});
  const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChapter, setModalChapter] = useState<number | null>(null);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const [serverTotals, setServerTotals] = useState<{ totalContents: number; completedContents: number } | null>(null);

  async function fetchChapter(chapterId: number) {
    // return cached items if available
    if (chapterItems[chapterId]) return chapterItems[chapterId];
    // avoid duplicate fetches
    if (loadingChapters[chapterId]) {
      // wait until loadingChapters flag clears
      await new Promise<void>((resolve) => {
        const wait = setInterval(() => {
          if (!loadingChapters[chapterId]) {
            clearInterval(wait);
            resolve();
          }
        }, 50);
      });
      return chapterItems[chapterId] ?? [];
    }
    const token = localStorage.getItem('token');
    if (!token) return [];
    setLoadingChapters((s) => ({ ...s, [chapterId]: true }));
    try {
      const res = await fetch(`${apiBaseUrl}/chapters/${chapterId}/contents`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setChapterItems((s) => ({ ...s, [chapterId]: [] }));
        return [];
      }
      const json = await res.json();
      const items = Array.isArray(json?.data?.items)
        ? json.data.items
        : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json)
              ? json
              : [];
      setChapterItems((s) => ({ ...s, [chapterId]: items }));
      return items;
    } catch (e) {
      setChapterItems((s) => ({ ...s, [chapterId]: [] }));
      return [];
    } finally {
      setLoadingChapters((s) => ({ ...s, [chapterId]: false }));
    }
  }

  function getContentIcon(it: any) {
    const type = (it.type || it.content_type || '').toLowerCase();
    const url = (it.file_url || it.url || it.content_url || it.path || '').toLowerCase();
  const ext = url.split('.').pop() ?? '';

    // Only special-case video, html and generic file types as requested.
    if (type.includes('video') || ['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" d="M4 4v16l16-8L4 4z" />
        </svg>
      );
    }

    if (type.includes('html') || ext === 'html' || type.includes('htm')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" d="M3 4v16h18V4H3zm4 4h10v2H7V8zm0 4h10v2H7v-2z" />
        </svg>
      );
    }

    // treat any 'file' type or fallback as a generic file icon
    if (type.includes('file') || ext.length > 0) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.2" d="M12 2l4 4H8l4-4zM6 8v12h12V8" />
        </svg>
      );
    }

    // final fallback (shouldn't be reached because ext truthy handles many cases)
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth="1.2" d="M12 2l4 4H8l4-4zM6 8v12h12V8" />
      </svg>
    );
  }

  // read completion percent from common fields on an item
  function getItemCompletion(it: any): number | null {
    if (!it) return null;
    const candidates = [it.percentage, it.progress, it.completed_percentage, it.completion, it.completed, it.read_percentage, it.complete_per];
    for (const c of candidates) {
      if (c == null) continue;
      const n = Number(c);
      if (!Number.isNaN(n)) return Math.max(0, Math.min(100, Math.round(n)));
    }
    // nested progress object
    if (it.progress && typeof it.progress === 'object') {
      const p = Number(it.progress.percentage ?? it.progress.completed ?? NaN);
      if (!Number.isNaN(p)) return Math.max(0, Math.min(100, Math.round(p)));
    }
    return null;
  }

  // compute total contents and completed contents from available data
  function computeTotals() {
    let total = 0;
    let completed = 0;
    for (const ch of contents ?? []) {
      const items = chapterItems[ch.id] ?? ch.items ?? [];
      if (!Array.isArray(items) || items.length === 0) continue;
      total += items.length;
      for (const it of items) {
        const p = getItemCompletion(it);
        if (p != null && p >= 100) completed += 1;
        else if (it.completed === true) completed += 1;
      }
    }
    return { total, completed };
  }

  async function openItemInModal(chapterId: number, index: number) {

    const items = await fetchChapter(chapterId);

    if (!Array.isArray(items) || items.length === 0) return;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    setModalChapter(chapterId);
    setModalIndex(clamped);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalChapter(null);
    setModalIndex(0);
  }


function HtmlContentViewer({ it }: { it: any }) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(false);
  const markedRef = useRef<boolean>(false);

  
  const { id } = useParams<{ id: string }>();
  // Track scroll progress manually
  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    const percent = scrollHeight <= 0 ? 100 : Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
    setProgress(percent);
  };

  // Lock scroll for a few seconds before enabling it
  useEffect(() => {
    setScrollEnabled(false);
    const el = contentRef.current;
    if (el) el.scrollTop = 0;

    const timer = setTimeout(() => setScrollEnabled(true), 5000); // lock for 5 seconds
    return () => clearTimeout(timer);
  }, [it?.id]);

  const formData = new FormData();
  formData.append("course_id", id || '');
  formData.append("chapter_id", it.chapter_id);
  formData.append("content_id", it.id);
  formData.append("percentage", progress.toString());
  //console.log("formData", it);
  // Mark as read when 90% reached
  useEffect(() => {
    if (progress >= 90 && !markedRef.current) {
      markedRef.current = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch(`${apiBaseUrl}/student-course-progress/mark-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }).catch(console.error);
    }
  }, [progress, it?.id]);

  // Prevent super-fast scrolling by throttling wheel speed
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!scrollEnabled) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      el.scrollBy({
        top: e.deltaY * 0.3, // ⏱️ slow scroll speed (30%)
        behavior: 'smooth',
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [scrollEnabled]);

  const raw = it?.content || '';
  const html = raw.replace(/\n\s*\n/g, '<br><br>').replace(/\n/g, '<br>');

  return (
    <>
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="p-4 text-gray-800"
        style={{
          height: '60vh',
          overflowY: 'auto',
          lineHeight: '1.6',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          pointerEvents: scrollEnabled ? 'auto' : 'none',
          userSelect: 'none',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-3">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 text-right mt-1">
          {progress}% read {scrollEnabled ? '' : '(Scroll unlocks in 5s...)'}
        </p>
      </div>
    </>
  );
}
  




  function renderModalContent(it: any) {
    if (!it) return <div className="p-6 text-sm text-gray-600">No content</div>;
      const url = it.content || it.url || it.path || '';
      const type = (it.type || it.content_type || '').toLowerCase();

        if (type.includes('video')) {
          return (
            <div className="p-4">
              <iframe
                width="560"
                height="415"
                src={it.content ?? ''}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full"
              ></iframe>
              {/* <video src={url} controls className="w-full h-auto rounded bg-black" /> */}
            </div>
          );
        }

    if (type.includes('html')) {
        return <HtmlContentViewer it={it} />;
    }
    
    if (type.includes('file') ) {
      return (
        <div className="w-full h-[70vh]">
          <iframe
              title={it.title || 'content'}
              src={
                it.content_url.startsWith('http')
                  ? it.content_url
                  : `${import.meta.env.VITE_API_BASE_URL}/${it.content_url}#navpanes=0&scrollbar=0&toolbar=0` 
              }
              className="w-full h-full"
            />         
        </div>
      );
    }


    return (
      <div className="p-6">
        <div className="text-sm text-gray-700">Can't preview this file. You can open it in a new tab.</div>
        <div className="mt-4">
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded">
            Open file
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') ?? '').toLowerCase();
    if (!token) {
      navigate('/admin');
      return;
    }
    if (role !== 'student') {
      setError('Only students can view this page');
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const courseRes = await fetch(`${apiBaseUrl}/courses/view/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!courseRes.ok) {
          setError('Course not found');
          setLoading(false);
          return;
        }
        const courseJson = await courseRes.json();
        setCourse(courseJson?.data ?? courseJson);

        const contentsUrl = new URL(`${apiBaseUrl}/chapters/student-course/${id}`);
        contentsUrl.searchParams.set('page', String(page));
        contentsUrl.searchParams.set('limit', String(pageSize));
        const contentsRes = await fetch(contentsUrl.toString(), { headers: { Authorization: `Bearer ${token}` } });
        if (contentsRes.ok) {
          const contentsJson = await contentsRes.json();
          
          // normalize items array from several possible shapes
          const itemsArray = Array.isArray(contentsJson?.items)
            ? contentsJson.items
            : Array.isArray(contentsJson?.items)
              ? contentsJson.items
              : Array.isArray(contentsJson?.results)
                ? contentsJson.results
                : Array.isArray(contentsJson)
                  ? contentsJson
                  : [];

          // sync pageSize if server returned a per-page/limit
          const respLimit = Number(contentsJson?.limit ?? contentsJson?.per_page ?? contentsJson?.page_size ?? NaN);
          if (!Number.isNaN(respLimit) && respLimit > 0 && respLimit !== pageSize) setPageSize(respLimit);

          // if requested page is empty and not the first page, step back
          if (itemsArray.length === 0 && page > 1) {
            const respTotalPages = Number(contentsJson?.total_pages ?? contentsJson?.meta?.total_pages ?? NaN);
            if (!Number.isNaN(respTotalPages) && respTotalPages > 0) {
              setTotalPages(respTotalPages);
              setPage((p) => Math.min(respTotalPages, Math.max(1, p - 1)));
            } else {
              setPage((p) => Math.max(1, p - 1));
            }
            return;
          }

          setContents(itemsArray);

          // helper: try common pagination keys, including nested shapes
          const tryFindNumber = (obj: any, names: string[]) => {
            for (const name of names) {
              const v = obj?.[name];
              if (v != null && !Number.isNaN(Number(v))) return Number(v);
            }
            return null;
          };

          // recursive search for keys like total, total_items, total_pages, count
          const recursiveFind = (o: any, keys: string[], depth = 0): number | null => {
            if (!o || depth > 4) return null;
            if (typeof o !== 'object') return null;
            for (const k of Object.keys(o)) {
              const lk = k.toLowerCase();
              if (keys.includes(lk) && o[k] != null && !Number.isNaN(Number(o[k]))) return Number(o[k]);
            }
            for (const k of Object.keys(o)) {
              const res = recursiveFind(o[k], keys, depth + 1);
              if (res != null) return res;
            }
            return null;
          };

          const totalItemsVal = tryFindNumber(contentsJson, ['total_items', 'total', 'count'])
            ?? tryFindNumber(contentsJson?.meta, ['total', 'count'])
            ?? recursiveFind(contentsJson, ['total_items', 'total', 'count']);
          setTotalItems(totalItemsVal);

          let totalPagesVal = tryFindNumber(contentsJson, ['total_pages'])
            ?? tryFindNumber(contentsJson?.meta, ['total_pages'])
            ?? recursiveFind(contentsJson, ['total_pages']);
          if (totalPagesVal == null && totalItemsVal != null && pageSize > 0) totalPagesVal = Math.ceil(totalItemsVal / pageSize);
          setTotalPages(totalPagesVal);

          // hasNext/hasPrev: prefer explicit flags, otherwise infer from page/totalPages
          if (typeof contentsJson?.has_next === 'boolean') setHasNext(contentsJson.has_next);
          else if (typeof contentsJson?.next !== 'undefined') setHasNext(Boolean(contentsJson.next));
          else if (totalPagesVal != null) setHasNext(page < totalPagesVal);
          else setHasNext(null);

          if (typeof contentsJson?.has_prev === 'boolean') setHasPrev(contentsJson.has_prev);
          else if (typeof contentsJson?.previous !== 'undefined') setHasPrev(Boolean(contentsJson.previous));
          else if (totalPagesVal != null) setHasPrev(page > 1);
          else setHasPrev(null);
        } else {
          setContents([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
  })();
 
  }, [id, page, pageSize]);

  // fetch totals from server API (if implemented)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const studentId = localStorage.getItem('student_id') ?? localStorage.getItem('user_id');
    if (!id || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const url = new URL(`${apiBaseUrl}/chapters/content-totals/${id}`);
        if (studentId) url.searchParams.set('studentId', studentId);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const totalContents = Number(json.total_contents ?? 0);
        const completedContents = Number(json.completed_contents ?? 0);
        setServerTotals({ totalContents: totalContents, completedContents: completedContents });
      } catch (e) {
        // ignore
        console.debug('fetchServerTotals error', e);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // prefer server totals, otherwise compute from loaded chapters/items or fall back to course fields
  const computedTotals = computeTotals();
  const totalContentsVal = serverTotals ? serverTotals.totalContents : (computedTotals.total ?? course?.lessons_count ?? 0);
  const completedContentsVal = serverTotals ? serverTotals.completedContents : (computedTotals.completed ?? course?.completed_lessons ?? 0);
  const percentDone = totalContentsVal ? Math.round((completedContentsVal / Math.max(1, totalContentsVal)) * 100) : 0;

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  
  return (
    <>
      <PageMeta title={course?.title ?? 'Course'} description={course?.summary ?? ''} />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 mb-12">
        <PageBreadcrumb pageTitle={'Course Detail'} />
        {/* Hero */}
        <div className="relative rounded-lg overflow-hidden shadow-lg mb-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center px-6 py-6">
            <div className="col-span-1 flex items-center justify-center">
              <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {course?.course_thumb ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={`${course.course_thumb}`} alt="course cover" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z"/></svg>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{course?.title ?? 'Course Detail'}</h1>
              <p className="mt-2 text-sm text-gray-600">{course?.summary ?? course?.description ?? 'No description available.'}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-sm">Instructor: {course?.user?.name || '—'}</span>
                {/* <span className="inline-flex items-center px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-sm">Duration: {course?.duration || '—'}</span>
                <span className="inline-flex items-center px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-sm">Lessons: {course?.lessons_count ?? course?.modules_count ?? '—'}</span> */}
              </div>

              <div className="mt-4 flex items-center gap-3">
                {/* <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{course?.is_enrolled ? 'Continue Course' : 'Enroll'}</button> */}
                <a className="text-sm text-gray-500">{course?.level ? `Level: ${course.level}` : ''}</a>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                  <div className="h-2 bg-indigo-600" style={{ width: `${Math.min(100, percentDone)}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {completedContentsVal} / {totalContentsVal} contents completed ({percentDone}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div >
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-9">
                <ComponentCard title="Course Contents" className="mt-0">
                      {contents.length === 0 ? (
                        <p className="text-sm text-gray-500">No contents available.</p>
                      ) : (
                        <div className="space-y-3">
                          {contents.map((ch: any) => (
                            <div key={ch.id} className="bg-white border rounded-lg shadow-sm">
                              <button
                                type="button"
                                onClick={async () => {
                                  const newId = openChapter === ch.id ? null : ch.id;
                                  setOpenChapter(newId);
                                  if (newId) await fetchChapter(newId);
                                }}
                                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                              >
                                <div>
                                  <div className="font-medium text-gray-800">{ch.chapter_name ?? ch.title ?? ch.name ?? `Chapter ${ch.id}`}</div>
                                  <div className="text-xs text-gray-500 mt-1">Updated: {ch.updated_at ? new Date(ch.updated_at).toLocaleString() : '—'}</div>
                                </div>
                                <div className="text-sm text-gray-500">{openChapter === ch.id ? '−' : '+'}</div>
                              </button>
                              <div className={`px-4 py-3 border-t bg-gray-50 ${openChapter === ch.id ? 'block' : 'hidden'} transition-all duration-200`}> 
                                {loadingChapters[ch.id] ? (
                                  <div className="text-sm text-gray-500">Loading chapter...</div>
                                ) : (
                                  (() => {
                                    const items = chapterItems[ch.id] ?? ch.items ?? [];
                                    if (Array.isArray(items) && items.length > 0) {
                                      return (
                                        <ul className="space-y-3">
                                          {items.map((it: any) => (
                                            <li key={it.id} className="flex items-start gap-4 p-3 bg-white border rounded-lg hover:shadow-sm transition">
                                              <div className="flex-shrink-0 mt-1">
                                                <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                  {getContentIcon(it)}
                                                </div>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="text-sm font-medium text-gray-800 truncate">{it.title || it.name}</h4>
                                                  <span className="ml-2 text-xs text-gray-500">{(it.type || it.content_type) ?? ''}</span>
                                                </div>
                                                {it.description && <p className="mt-1 text-xs text-gray-500 truncate">{it.description}</p>}
                                                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                                  {it.duration && <span className="px-2 py-0.5 bg-gray-100 rounded">{it.duration}</span>}
                                                  {it.size && <span className="px-2 py-0.5 bg-gray-100 rounded">{it.size}</span>}
                                                </div>
                                                <div className="mt-3">
                                                  {(() => {
                                                    const pct = getItemCompletion(it) ?? (typeof it.complete_per !== 'undefined' ? Number(it.complete_per) : null);
                                                    if (pct != null && !Number.isNaN(pct)) {
                                                      const p = Math.max(0, Math.min(100, Math.round(pct)));
                                                      return (
                                                        <div>
                                                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                            <div className="h-2 bg-green-500 transition-all" style={{ width: `${p}%` }} />
                                                          </div>
                                                          <div className="text-xs text-gray-500 mt-1">{p}% complete</div>
                                                        </div>
                                                      );
                                                    }
                                                    return null;
                                                  })()}
                                                </div>
                                              </div>
                                              <div className="flex-shrink-0 self-center">                                                
                                               {it?.content_type === 'video' ? (  
                                                <button
                                                  onClick={() => navigate(`/student-Dashboard/learn/${it.id}/${it.chapter_id}/${it.course_id}`)}
                                                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                >
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                  </svg>
                                                  <span className="text-sm">Open</span>
                                                </button>
                                                ) : 
                                                 <button onClick={async () => await openItemInModal(ch.id, items.indexOf(it))} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                                  <span className="text-sm">Open</span>
                                                </button>
                                                }
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      );
                                    }
                                    return <div className="text-sm text-gray-500">No items in this chapter.</div>;
                                  })()
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {totalItems != null ? (
                          <span>Showing page {page} of {totalPages ?? 1} — {totalItems} items</span>
                        ) : (
                          <span>Page {page}</span>
                        )}
                      </div>
                      <div>
                        <Pagination page={page} totalPages={totalPages} hasNext={hasNext} hasPrev={hasPrev} onPageChange={(p) => setPage(p)} windowSize={5} />
                      </div>
                    </div>
                  </ComponentCard>
              </div>            

              <div className="md:col-span-3">
                <ComponentCard title="Course Activity">
                  <div className="text-sm text-gray-700 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Last accessed</div>
                      <div className="font-medium">{course?.last_accessed ? new Date(course.last_accessed).toLocaleString() : '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Progress</div>
                      <div className="mt-2 w-full bg-gray-100 rounded h-2 overflow-hidden">
                        <div className="h-2 bg-indigo-600" style={{ width: `${Math.min(100, ((course?.completed_lessons ?? 0) / Math.max(1, course?.lessons_count ?? 1)) * 100)}%` }} />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">{course?.completed_lessons ?? 0} / {course?.lessons_count ?? course?.modules_count ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Recent chapters</div>
                      <ul className="mt-2 space-y-2">
                        {(contents ?? []).slice(0, 6).map((ch: any) => (
                          <li key={`act-${ch.id}`}>
                            <button
                              onClick={async () => {
                                setOpenChapter(ch.id);
                                await fetchChapter(ch.id);
                              }}
                              className="w-full text-left text-sm hover:bg-gray-50 px-2 py-1 rounded"
                            >
                              <div className="font-medium text-gray-800 truncate">{ch.chapter_name ?? ch.title ?? ch.name ?? `Chapter ${ch.id}`}</div>
                              <div className="text-xs text-gray-500">{ch.updated_at ? new Date(ch.updated_at).toLocaleString() : ''}</div>
                            </button>
                          </li>
                        ))}
                        {(contents ?? []).length === 0 && <li className="text-xs text-gray-500">No recent activity</li>}
                      </ul>
                    </div>
                  </div>
                </ComponentCard>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FrontFooter />
      {/* Modal viewer for chapter items (single-item navigation) */}
      <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          isFullscreen={false}
          showCloseButton={true}
          className="max-w-4xl mx-auto"
        >
          <div className="p-4">
            {modalChapter != null ? (
              (() => {
                const items = chapterItems[modalChapter] ?? [];
                const it = items[modalIndex] ?? null;
                return (
                  <div className="flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between flex-shrink-0">
                      <div className="text-sm font-medium">{it?.title || it?.name || 'Item'}</div>
                      <div className="text-xs text-gray-500">{modalIndex + 1} / {items.length}</div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="bg-white rounded border overflow-y-auto flex-1 p-4">
                      {renderModalContent(it)}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between flex-shrink-0">
                      <div>
                        <button
                          disabled={modalIndex <= 0}
                          onClick={() => setModalIndex((i) => Math.max(0, i - 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          disabled={
                            modalChapter == null ||
                            (chapterItems[modalChapter] ?? []).length === 0 ||
                            modalIndex >= ((chapterItems[modalChapter] ?? []).length - 1)
                          }
                          onClick={() => setModalIndex((i) => i + 1)}
                          className="ml-2 px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-6 text-sm text-gray-600">No chapter selected</div>
            )}
          </div>
        </Modal>

    </>
  );
}
