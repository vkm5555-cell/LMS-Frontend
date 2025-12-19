import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Modal } from '../../../components/ui/modal';
import QuickCheck from '../../../components/courses/chapter/QuickCheck';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import Navbar from '../../../components/common/frontend/Navbar';
import FrontFooter from '../../../components/common/frontend/FrontFooter';
import { toSrc, tryAuthFetchAndSet } from '../../../utils/videoUtils';
import Discussions from '../../../components/courses/chapter/Discussions';
import StudentTranscript from '../../../components/courses/chapter/StudentTranscript';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function LearnChapter() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Discussions are handled by the reusable Discussions component

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'transcript' | 'content' | 'detail'>('transcript');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [attemptedAuthFetch, setAttemptedAuthFetch] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  // popup modal state for periodic reminders
  const [popupOpen, setPopupOpen] = useState(false);
  const [nextPopupAt, setNextPopupAt] = useState<number>(180); // seconds
  const wasPlayingRef = useRef(false);

  // Transcript state
  // transcript is handled by the Transcript component when autoGenerate=true

  const { id, chapterId: routeChapterId, courseId: routeCourseId } = useParams();
  const location = useLocation();
  // keep backward-compatible local names used across this file
  const chapterId = routeChapterId ?? null;
  const courseId = routeCourseId ?? null;
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // transcript state removed - using demo transcript1


  useEffect(() => {
  const fetchChapterContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/chapters/chapter-content/${id}`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success === false) {
        setError(data.message || "Failed to load chapter content");
      } else {
  setResult(data.data);
  // transcript fetching not enabled here; using demo transcript
        
      }
    } catch (err) {
      setError("Unable to fetch chapter content.");
    } finally {
      setLoading(false);
    }
  };

  fetchChapterContent();
}, [id]);

// Fetch transcript lazily when user opens the transcript tab
// transcript fetching moved into `Transcript` component (autoGenerate)




  // Demo chapter
  const content = {
    id: 'demo-1',
    title: 'Introduction to Java 8',
    summary: 'Learn the basics of Java 8 features.',
    type: 'video/mp4',
    file_url: 'http://127.0.0.1:8000/uploads/chapter_contents/Introduction_Java8.mp4',
    duration: '5:00',
  };

  /** Auto progress update */
  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (!isNaN(total)) {
      setProgress(Math.floor((current / total) * 100));
      setCurrentTime(current);
    }

    // Periodic popup: trigger when currentTime crosses nextPopupAt
    if (typeof nextPopupAt === 'number' && current >= nextPopupAt) {
      // compute the next threshold (avoid multiple immediate triggers)
      const next = Math.ceil((current + 0.001) / 180) * 180;
      setNextPopupAt(next);
      // open popup and pause video
      if (videoRef.current) {
        try { wasPlayingRef.current = !videoRef.current.paused; } catch { wasPlayingRef.current = false; }
        try { videoRef.current.pause(); } catch {}
      }
      setPopupOpen(true);
    }
  };

  // Dummy transcript data (start in seconds)
  // demo transcript removed — Transcript component will fetch when autoGenerate=true

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
  };
  //console.log("Result:", result);

  const handleVideoError = async () => {
    const u = result?.content_url ?? result?.file_url ?? '';
    const src = toSrc(apiBaseUrl, u);
    setVideoError(src ? `Failed to load video: ${src}` : 'Failed to load video (no source)');
    if (!u || attemptedAuthFetch) return;
    await tryAuthFetchAndSet(src, videoRef, setAttemptedAuthFetch, setVideoError);
  };

  const closePopup = () => {
    setPopupOpen(false);
    // resume playback if it was playing before popup
    if (videoRef.current && wasPlayingRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
  return (
    <>
      <PageMeta title={result?.title} description={result?.description} />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <PageBreadcrumb pageTitle={result?.title} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">

          {/* ================= LEFT: VIDEO PLAYER ================= */}
          <div className="lg:col-span-3">
            <div className="border rounded p-4">
              <div className="w-full h-[420px] bg-black relative flex items-center justify-center">
                {loading ? (
                  <div className="text-sm text-gray-400">Loading video…</div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      onTimeUpdate={onTimeUpdate}
                      onError={handleVideoError}
                    >
                      <source src={toSrc(result?.content_url ?? result?.file_url)} type="video/mp4" />
                    </video>

                    {/* periodic popup modal every 180s of playback */}
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

                            return (
                            <QuickCheck
                              header="Quick check"
                              message="You've been watching for a while — take a short break or continue when ready."
                              onClose={closePopup}
                              currentTime={currentTime}
                              userId={currentUserId}
                              contentId={result?.id ?? id ?? null}
                              chapterId={chapterId}
                              courseId={courseId}
                              autoReport={true}
                              //onOpenReport={handleOpenReport}
                              fetchQuiz={true}
                            />
                          );
                        })()
                      }
                    </Modal>

                    {/* Transcript loading overlay on top of video */}
                    {transcriptLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {videoError && (
                      <div className="mt-3 text-sm text-red-500">{videoError}</div>
                    )}
                    {error && !videoError && (
                      <div className="mt-3 text-sm text-red-500">{error}</div>
                    )}
                  </>
                )}
              </div>

              <h2 className="text-xl font-semibold mt-4">{content.title}</h2>

              <p className="text-sm text-gray-700 mt-2">{content.summary}</p>

              {/* Progress */}
              <div className="mt-4">
                <div className="text-sm font-semibold">Progress</div>
                <div className="w-full bg-gray-200 h-2 rounded mt-1">
                  <div
                    className="h-2 bg-indigo-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs mt-1 text-gray-600">
                  {progress}% completed
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: TABS (CONTENT / DETAIL) ================= */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl shadow-sm bg-white sticky top-4 overflow-hidden">

                {/* TABS */}
                <div className="flex border-b bg-gray-50">
                  <button
                    className={`flex-1 px-4 py-3 text-sm text-center transition ${
                    activeTab === 'transcript'
                      ? 'font-semibold border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('transcript')}
                  >
                    Transcript
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 text-sm text-center transition ${
                    activeTab === 'content'
                      ? 'font-semibold border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('content')}
                  >
                    Content
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 text-sm text-center transition ${
                    activeTab === 'detail'
                      ? 'font-semibold border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('detail')}
                  >
                    Detail
                  </button>
                </div>

                {/* TAB CONTENT AREA */}
                <div className="p-4 text-sm">

                {/* TRANSCRIPT TAB */}
                {activeTab === 'transcript' && (
                  <StudentTranscript
                    transcript={null}
                    autoGenerate={true}
                    courseId={courseId ?? null}
                    chapterId={chapterId ?? null}
                    contentId={id ?? null}
                    videoUrl={result?.content_url ?? result?.file_url ?? content.file_url}
                    onLoadingChange={setTranscriptLoading}
                    currentTime={currentTime}
                    onSeek={seekTo}
                  />
                )}

                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <div className="space-y-4">

                      {/* PROGRESS BOX */}
                      <div className="border rounded-lg p-3 bg-gray-50">
                          <div className="text-xs text-gray-500 mb-1">Progress</div>

                          <div className="w-full bg-gray-200 h-2 rounded">
                          <div
                              className="bg-indigo-600 h-2 rounded"
                              style={{ width: `${progress}%` }}
                          />
                          </div>

                          <div className="text-xs mt-2 text-gray-600">
                          {progress}% watched
                          </div>
                      </div>

                      {/* BACK BUTTON */}
                      <button
                          onClick={() => navigate(-1)}
                          className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                      >
                          Back to Chapters
                      </button>
                    </div>
                )}

                {/* DETAIL TAB */}
                {activeTab === 'detail' && (
                    <div className="space-y-3">

                    <div className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-semibold mb-2 text-gray-800">Chapter Details</h4>

                        <p className="text-xs text-gray-600">
                        <strong>Title:</strong> {content.title}
                        </p>

                        <p className="text-xs text-gray-600 mt-2">
                        <strong>Duration:</strong> {content.duration}
                        </p>

                        <p className="text-xs text-gray-600 mt-2">
                        <strong>Description:</strong> {content.summary}
                        </p>
                    </div>

                    </div>
                )}

                </div>
              </div>
            </div>


        </div>
      </div>

      {/* Discussions component (moved to separate file) */}
      <Discussions        
        initialExpanded={false}
        contentData={result}
       
      />


      <FrontFooter />
    </>
  );
}
