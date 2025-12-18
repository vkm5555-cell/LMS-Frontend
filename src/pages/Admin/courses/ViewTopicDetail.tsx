import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { decryptText } from '../../../utils/encryption';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { toSrc, tryAuthFetchAndSet } from '../../../utils/videoUtils';
import Discussions from '../../../components/courses/chapter/Discussions';
import Transcript from '../../../components/courses/chapter/Transcript';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function ViewTopicDetail() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'transcript' | 'content' | 'detail'>('transcript');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [attemptedAuthFetch, setAttemptedAuthFetch] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const { id } = useParams();
  const location = useLocation();
  const [courseIdFromUrl, setCourseIdFromUrl] = useState<string | number | null>(null);
  const [chapterIdFromUrl, setChapterIdFromUrl] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBaseUrl}/chapters/chapter-content/${id}`,{
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success === false) {
          setError(data.message || "Failed to load topic");
        } else {
          setResult(data.data);
        }
      } catch (err) {
        setError("Unable to fetch topic.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  useEffect(() => {
    // Read courseId from URL. Prefer encrypted `data` param (if VITE_ENCRYPTION_KEY is set),
    // otherwise fall back to plain `courseId` query param.
    let mounted = true;
    (async () => {
      try {
        const params = new URLSearchParams(location.search);
  const dataParam = params.get('data');
  const plainCourse = params.get('courseId');
  const plainChapter = params.get('chapterId');
        const encKey = import.meta.env.VITE_ENCRYPTION_KEY as string | undefined;
        if (dataParam && encKey) {
          try {
            const decoded = decodeURIComponent(dataParam);
            const decrypted = await decryptText(decoded, encKey);
            const parsed = JSON.parse(decrypted);
            if (mounted) {
              setCourseIdFromUrl(parsed?.courseId ?? null);
              setChapterIdFromUrl(parsed?.chapterId ?? null);
            }
            return;
          } catch (err) {
            // Decrypt failed, fall back to plain course param
            console.error('Failed to decrypt data param', err);
          }
        }
  if (plainCourse && mounted) setCourseIdFromUrl(plainCourse);
  if (plainChapter && mounted) setChapterIdFromUrl(plainChapter);
      } catch (err) {
        console.error('Error parsing URL params', err);
      }
    })();
    return () => { mounted = false; };
  }, [location.search]);

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (!isNaN(total)) {
      setProgress(Math.floor((current / total) * 100));
      setCurrentTime(current);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
  };

  const handleVideoError = async () => {
    const u = result?.content_url ?? result?.file_url ?? '';
    const src = toSrc(apiBaseUrl, u);
    setVideoError(src ? `Failed to load video: ${src}` : 'Failed to load video (no source)');
    if (!u || attemptedAuthFetch) return;
    await tryAuthFetchAndSet(src, videoRef, setAttemptedAuthFetch, setVideoError);
  };
  return (
    <>
      <PageMeta title={result?.title ?? 'View Topic'} description={result?.description} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <PageBreadcrumb pageTitle={result?.title ?? 'View Topic'} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
          <div className="lg:col-span-3">
            <div className="border rounded p-4">
              <div className="w-full h-[420px] bg-black flex items-center justify-center">
                {loading ? (
                  <div className="text-sm text-gray-400">Loading content…</div>
                ) : (
                  <>
                    {/* Render based on content type */}
                    {result?.content_type === 'video' ? (
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
                    ) : result?.content_type === 'html' ? (
                      <div className="w-full h-full overflow-auto bg-white p-4 text-sm text-gray-800" style={{ minHeight: 200 }}>
                        <div dangerouslySetInnerHTML={{ __html: result?.content ?? '' }} />
                      </div>
                    ) : result?.content_type === 'file' ? (
                      <div className="w-full h-full">
                        {result?.content_url ? (
                          <iframe
                            title={result?.title || 'Content file'}
                            src={toSrc(result?.content_url ?? result?.file_url)}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="text-sm text-gray-400">No file URL available.</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">No preview available for this content type.</div>
                    )}
                  </>
                )}
              </div>

              <h2 className="text-xl font-semibold mt-4">{result?.title ?? 'Topic'}</h2>
              <p className="text-sm text-gray-700 mt-2">{result?.description ?? ''}</p>

              <div className="mt-4">
                <div className="text-sm font-semibold">Progress</div>
                <div className="w-full bg-gray-200 h-2 rounded mt-1">
                  <div className="h-2 bg-indigo-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs mt-1 text-gray-600">{progress}% completed</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-xl shadow-sm bg-white sticky top-4 overflow-hidden">
              <div className="flex border-b bg-gray-50">
                <button className={`flex-1 px-4 py-3 text-sm text-center transition ${activeTab === 'transcript' ? 'font-semibold border-b-2 border-indigo-600 bg-white' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => setActiveTab('transcript')}>Transcript</button>
                <button className={`flex-1 px-4 py-3 text-sm text-center transition ${activeTab === 'content' ? 'font-semibold border-b-2 border-indigo-600 bg-white' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => setActiveTab('content')}>Content</button>
                <button className={`flex-1 px-4 py-3 text-sm text-center transition ${activeTab === 'detail' ? 'font-semibold border-b-2 border-indigo-600 bg-white' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => setActiveTab('detail')}>Detail</button>
              </div>

              <div className="p-4 text-sm">
                {activeTab === 'transcript' && (
                  <Transcript
                    transcript={null}
                    autoGenerate={true}
                    courseId={courseIdFromUrl ?? null}
                    chapterId={chapterIdFromUrl ?? id ?? result?.chapter_id ?? null}
                    contentId={result?.id ?? null}
                    videoUrl={result?.content_url ?? result?.file_url }
                    onLoadingChange={setTranscriptLoading}
                    currentTime={currentTime}
                    onSeek={seekTo}
                  />
                )}

                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="text-xs text-gray-500 mb-1">Progress</div>
                      <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-indigo-600 h-2 rounded" style={{ width: `${progress}%` }} /></div>
                      <div className="text-xs mt-2 text-gray-600">{progress}% watched</div>
                    </div>
                    <button onClick={() => navigate(-1)} className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Back to Topics</button>
                  </div>
                )}

                {activeTab === 'detail' && (
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <h4 className="font-semibold mb-2 text-gray-800">Topic Details</h4>
                      <p className="text-xs text-gray-600"><strong>Title:</strong> {result?.title}</p>
                      <p className="text-xs text-gray-600 mt-2"><strong>Duration:</strong> {result?.duration ?? '-'}</p>
                      <p className="text-xs text-gray-600 mt-2"><strong>Description:</strong> {result?.description ?? ''}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Discussions initialExpanded={false} contentData={result} />
      </div>
    </>
  );
}
