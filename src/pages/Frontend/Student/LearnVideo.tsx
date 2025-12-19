import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/modal';
import QuickCheck from '../../../components/courses/chapter/QuickCheck';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import Navbar from '../../../components/common/frontend/Navbar';
import FrontFooter from '../../../components/common/frontend/FrontFooter';
import ComponentCard from '../../../components/common/ComponentCard';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function LearnVideo() { 
  const { id, chapterId: routeChapterId, courseId: routeCourseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [nextPopupAt, setNextPopupAt] = useState<number>(180);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!id || !token) {
      setError('No content specified');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/contents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          setError('Content not found');
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        setContent(json?.data ?? json);
      } catch (e: any) {
        setError(e?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // report progress periodically (every 10s) or when leaving
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const sendProgress = async () => {
      if (!content) return;
      try {
        const form = new FormData();
        form.append('content_id', String(content.id));
        form.append('percentage', String(Math.round(progress)));
        await fetch(`${apiBaseUrl}/student-course-progress/mark-read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      } catch (e) {
        // ignore
      }
    };
    const intv = setInterval(sendProgress, 10000);
    const onUnload = () => { void sendProgress(); };
    window.addEventListener('beforeunload', onUnload);
    return () => { clearInterval(intv); window.removeEventListener('beforeunload', onUnload); };
  }, [content, progress]);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
    setProgress(Math.min(100, Math.round(pct)));

    // Periodic popup trigger
    if (typeof nextPopupAt === 'number' && v.currentTime >= nextPopupAt) {
      const next = Math.ceil((v.currentTime + 0.001) / 120) * 120;
      setNextPopupAt(next);
      try { wasPlayingRef.current = !v.paused; } catch { wasPlayingRef.current = false; }
      try { v.pause(); } catch {}
      setPopupOpen(true);
    }
  };

  const closePopup = () => {
    setPopupOpen(false);
    if (videoRef.current && wasPlayingRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
 
  return (
    <>
      <PageMeta title={content?.title ?? 'Learn Video'} description={content?.summary ?? ''} />
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ComponentCard title={content?.title ?? 'Loading...'}>
              {loading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : content ? (
                <div>
                  {((content.type || content.content_type) ?? '').toLowerCase().includes('video') || (content.file_url && content.file_url.endsWith('.mp4')) ? (
                    <div>
                      <video
                        ref={videoRef}
                        src={content.content ?? content.file_url}
                        controls
                        onTimeUpdate={onTimeUpdate}
                        className="w-full bg-black rounded"
                      />
                        <Modal isOpen={popupOpen} onClose={closePopup} className="max-w-md p-6" showCloseButton={false}>
                          {
                            (() => {
                              const q = new URLSearchParams(location.search);
                              const urlUserId = q.get('user_id') ?? q.get('userId') ?? null;
                              const urlChapterId = q.get('chapterId') ?? q.get('chapter_id') ?? null;
                              const urlCourseId = q.get('courseId') ?? q.get('course_id') ?? null;
                              const currentUserId = urlUserId ?? localStorage.getItem('user_id') ?? null;
                              const chapterId = routeChapterId ?? urlChapterId;
                              const courseId = routeCourseId ?? urlCourseId;

                              // report handler
                              const handleOpenReport = async (payload: { user_id?: string | number | null; content_id?: string | number | null; video_time?: number; chapter_id?: string | number | null; course_id?: string | number | null }) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                  if (token) headers.Authorization = `Bearer ${token}`;
                                  const endpoint = (import.meta as any).env?.VITE_API_BASE_URL
                                    ? `${(import.meta as any).env.VITE_API_BASE_URL}/quick-quiz/get`
                                    : '/quick-quiz/get';
                                  await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
                                } catch (e) {
                                  // ignore
                                }
                              };

                              return (
                                <QuickCheck
                                  header="Quick check"
                                  message="You've been watching for a while — take a short break or continue when ready."
                                  onClose={closePopup}
                                  currentTime={videoRef.current?.currentTime}
                                  userId={currentUserId}
                                  contentId={content?.id ?? id ?? null}
                                  chapterId={chapterId}
                                  courseId={courseId}
                                  autoReport={true}
                                  onOpenReport={handleOpenReport}
                                  fetchQuiz={true}
                                />
                              );
                            })()
                          }
                        </Modal>
                      <div className="mt-2 text-sm text-gray-600">{progress}% watched</div>
                    </div>
                  ) : ((content.type || content.content_type) ?? '').toLowerCase().includes('html') ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content ?? '' }} />
                  ) : (
                    <div>
                      <iframe src={content.content_url ?? content.file_url} className="w-full h-[70vh]" />
                    </div>
                  )}
                </div>
              ) : null}
            </ComponentCard>
          </div>

          <div className="lg:col-span-1">
            <ComponentCard title="Actions">
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">Progress</div>
                  <div className="mt-2 w-full bg-gray-100 rounded h-2 overflow-hidden">
                    <div className="h-2 bg-indigo-600" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{progress}% complete</div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime = Math.max(0, (videoRef.current.duration || 0) * (progress / 100) - 10);
                    }}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    Back 10s
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime = Math.min((videoRef.current.duration || 0), (videoRef.current.duration || 0) * (progress / 100) + 10);
                    }}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    Forward 10s
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => {
                      // mark complete
                      const token = localStorage.getItem('token');
                      const form = new FormData();
                      form.append('content_id', String(content?.id ?? id));
                      form.append('percentage', '100');
                      fetch(`${apiBaseUrl}/student-course-progress/mark-read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }).catch(console.error);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    Mark complete
                  </button>
                </div>

                <div>
                  <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
      <FrontFooter />
    </>
  );
}
