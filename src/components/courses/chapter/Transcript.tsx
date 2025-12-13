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
  // When true and `transcript` is empty, the component will POST to /transcript/generate
  autoGenerate?: boolean;
  // identifiers for the backend
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
  const [internal, setInternal] = useState<TranscriptItem[] | null>(
    transcript ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // notify parent when loading state changes
  useEffect(() => {
    if (typeof onLoadingChange === "function") onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    // keep internal in sync when prop changes
    setInternal(transcript ?? null);
  }, [transcript]);

  useEffect(() => {
    if (internal && internal.length > 0) return; // already have
    if (!autoGenerate) return;
    // Need at least a videoUrl or chapterId (prefer course/content ids too)
    if (!videoUrl && !chapterId) return;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "";
        const token = localStorage.getItem("token");

        // Normalize videoUrl: if it's relative, prepend VITE_API_BASE_URL from env
        let videoSrc = videoUrl ?? undefined;
        if (typeof videoSrc === "string" && videoSrc) {
          // if not an absolute URL, join with apiBase
          if (!/^https?:\/\//i.test(videoSrc) && apiBase) {
            const base = apiBase.replace(/\/$/, "");
            videoSrc = `${base}/${videoSrc.replace(/^\//, "")}`;
          }
        }

        const payload: any = { videoUrl: videoSrc ?? undefined, chapterId };
        if (courseId) payload.courseId = courseId;
        if (contentId) payload.contentId = contentId;

        const res = await fetch(`${apiBase}/transcript/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || data.success === false) {
          setError(data.message || "Failed to generate transcript");
          setLoading(false);
          return;
        }

        let segments: TranscriptItem[] = [];

        // Prefer array-shaped responses (multiple possible keys)
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
            const end = Number(s.end ?? s.end_time ?? s.to ?? (start + 5)) || (start + 5);
            const text = String(s.text ?? s.content ?? s.transcript ?? s.t ?? "");
            return { start, end, text } as TranscriptItem;
          });
        } else if (typeof data.transcript === "string" && data.transcript.trim()) {
          // Single string transcript returned — show as a single segment (0..5s fallback)
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

  // Refs for scrolling the active transcript item into view
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
    // If element is not fully visible within the container, scroll the container only
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
              className={`p-2 rounded ${active ? "bg-indigo-50 border-l-4 border-indigo-600" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">{formatTime(t.start)}</div>
                <button
                  onClick={() => onSeek(t.start)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Play from here
                </button>
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
