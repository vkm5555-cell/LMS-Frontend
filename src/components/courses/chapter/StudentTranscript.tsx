import React, { useEffect, useRef, useState } from "react";

type TranscriptItem = {
  start: number;
  end: number;
  text: string;
};

type Props = {
  transcript?: TranscriptItem[] | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  autoGenerate?: boolean;
  courseId?: string | number | null;
  chapterId?: string | number | null;
  contentId?: string | number | null;
  videoUrl?: string | null;
  onLoadingChange?: (loading: boolean) => void;
};

const formatTime = (seconds: number) => {
  try {
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  } catch {
    return "0:00";
  }
};

const Transcript: React.FC<Props> = ({
  transcript = null,
  currentTime,
  onSeek,
  autoGenerate = false,
  courseId,
  chapterId,
  contentId,
  videoUrl,
  onLoadingChange,
}) => {
  const [internal, setInternal] = useState<TranscriptItem[] | null>(transcript ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof onLoadingChange === "function") onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    setInternal(transcript ?? null);
  }, [transcript]);

  useEffect(() => {
    if (internal && internal.length > 0) return;
    if (!autoGenerate) return;
    if (!videoUrl && !chapterId) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "";
        const token = localStorage.getItem("token");

        // Normalize video url
        let videoSrc: string | undefined = typeof videoUrl === "string" ? videoUrl : undefined;
        if (videoSrc && !/^https?:\/\//i.test(videoSrc) && apiBase) {
          //const base = apiBase.replace(/\/$/, "");
          videoSrc = `${videoSrc.replace(/^\//, "")}`;
        }

        // Build body with both camelCase and snake_case ids where helpful
        const body: any = {};
        if (courseId != null) body.courseId = courseId;
        if (chapterId != null) body.chapterId = chapterId;
        if (contentId != null) body.contentId = contentId;
        if (body.courseId != null) body.course_id = body.courseId;
        if (body.chapterId != null) body.chapter_id = body.chapterId;
        if (body.contentId != null) body.content_id = body.contentId;

        const normalizedVideo = videoSrc ? String(videoSrc) : "";
        if (!normalizedVideo) {
          setError('videoUrl is required for transcript generation');
          setLoading(false);
          return;
        }
        body.videoUrl = normalizedVideo;
        body.videoUrl = normalizedVideo;

        // Minimal payload expected by backend
        const payload: any = {
          body,
          courseId: courseId,
          chapterId: chapterId,
          contentId: contentId,
          video_url: normalizedVideo,
          videoUrl: normalizedVideo,
        };

        // First, try to GET the transcript (some backends expose a GET endpoint accepting query params)
        let res = null as Response | null;
        let data: any = null;
        try {
          const params = new URLSearchParams();
          if (courseId != null) params.set('courseId', String(courseId));
          if (chapterId != null) params.set('chapterId', String(chapterId));
          if (contentId != null) params.set('contentId', String(contentId));
       
          const getUrl = `${apiBase}/transcript/generate${params.toString() ? `?${params.toString()}` : ''}`;
          res = await fetch(getUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (res.ok) {
            data = await res.json();
          } else {
            // fallback to POST when GET isn't supported or returns an error
            const postRes = await fetch(`${apiBase}/transcript/generate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });
            res = postRes;
            data = await postRes.json();
          }
        } catch (err) {
          // If network or unexpected error, attempt POST as last resort
          try {
            const postRes = await fetch(`${apiBase}/transcript/generate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });
            res = postRes;
            data = await postRes.json();
          } catch (err2) {
            throw err2;
          }
        }
        if (!res.ok || data.success === false) {
          setError(data.message || "Failed to generate transcript");
          setLoading(false);
          return;
        }

        let segments: TranscriptItem[] = [];
        const arr = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.segments)
          ? data.segments
          : Array.isArray(data.transcript)
          ? data.transcript
          : null;

        if (arr) {
          segments = arr.map((s: any) => {
            const start = Number(s.start ?? s.start_time ?? s.from ?? 0) || 0;
            const end = Number(s.end ?? s.end_time ?? s.to ?? start + 5) || start + 5;
            const text = String(s.text ?? s.content ?? s.transcript ?? s.t ?? "");
            return { start, end, text } as TranscriptItem;
          });
        } else if (typeof data.transcript === "string" && data.transcript.trim()) {
          segments = [{ start: 0, end: 5, text: data.transcript }];
        } else if (typeof data.data === "string" && data.data.trim()) {
          segments = [{ start: 0, end: 5, text: data.data }];
        } else {
          setError("Unexpected transcript format from API");
        }

        if (segments.length > 0) setInternal(segments);
      } catch (err: any) {
        setError(err?.message ?? "Unable to fetch transcript");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [autoGenerate, videoUrl, chapterId, courseId, contentId]);

  const items = internal ?? [];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const prevActive = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (items.length === 0) return;

    const activeIndex = items.findIndex((t) => currentTime >= t.start && currentTime < t.end);
    if (activeIndex === -1 || activeIndex === prevActive.current) return;

    const el = itemRefs.current[activeIndex];
    if (!el) {
      prevActive.current = activeIndex;
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
      const container = containerRef.current!;
      const relativeTop = elRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({ top: Math.max(0, relativeTop), behavior: "smooth" });
    }

    prevActive.current = activeIndex;
  }, [currentTime, items]);

  if (loading) return <div className="text-sm text-gray-500">Loading transcript…</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 mb-2">Video Transcript</div>
      <div ref={containerRef} className="h-[420px] overflow-y-auto bg-white border rounded p-3 text-sm space-y-3">
        {items.map((t, idx) => {
          const active = currentTime >= t.start && currentTime < t.end;
          return (
            <div
              key={idx}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className={`p-2 rounded ${active ? "bg-indigo-50 border-l-4 border-indigo-600" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">{formatTime(t.start)}</div>
                <button onClick={() => onSeek(t.start)} className="text-xs text-indigo-600 hover:underline">Play from here</button>
              </div>
              <div className="mt-1 text-gray-800">{t.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Transcript;
