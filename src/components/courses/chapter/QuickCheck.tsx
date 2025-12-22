import React, { useEffect, useState } from 'react';

interface QuickCheckProps {
  header?: string;
  message?: string;
  onClose: () => void;
  closeLabel?: string;

  // quiz context
  currentTime?: number;
  contentId?: number | string | null;
  chapterId?: number | string | null;
  courseId?: number | string | null;
  userId?: number | string | null;
  autoReport?: boolean;

  fetchQuiz?: boolean;
  quizEndpoint?: string;
  onOpenReport?: (payload: { user_id?: string | number | null; content_id?: string | number | null; video_time?: number; chapter_id?: string | number | null; course_id?: string | number | null }) => void;
  submitEndpoint?: string; // optional override endpoint for submitting answers
  onSubmit?: (result: { success: boolean; data?: any }) => void;
}

const QuickCheck: React.FC<QuickCheckProps> = ({
  header = 'Quick check',
  message = "You've been watching for a while — take a short break or continue when ready.",
  // onClose,
  // closeLabel = 'Close',
  currentTime,
  contentId,
  chapterId,
  courseId,
  userId,
  autoReport,
  fetchQuiz = true,
  quizEndpoint,
  onOpenReport,
  submitEndpoint,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

  // form state: support single-choice (string) or multi-choice (Set)
  const [selected, setSelected] = useState<any>(null);

  // call onOpenReport automatically if requested (avoid unused prop warnings)
  useEffect(() => {
    if (autoReport && onOpenReport) {
      try {
        onOpenReport({
          user_id: userId ?? null,
          content_id: contentId ?? null,
          video_time: currentTime ? Math.round(currentTime) : 0,
          chapter_id: chapterId ?? null,
          course_id: courseId ?? null,
        });
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fetchQuiz) return;

    let cancelled = false;

    const fetchQuickQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
        const endpoint = quizEndpoint ?? `${baseUrl}/quick-quiz/get`;

        const payload: Record<string, any> = {
          video_time: currentTime ? Math.floor(currentTime) : 0,
        };

        if (contentId != null) payload.content_id = contentId;
        if (chapterId != null) payload.chapter_id = chapterId;
        if (courseId != null) payload.course_id = courseId;
        if (userId != null) payload.user_id = userId;

        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();

        if (!cancelled) {
          setQuiz(json?.quizzes?.[0] ?? json?.data ?? null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError('Failed to load quiz');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchQuickQuiz();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{header}</h3>
      <p className="text-sm text-gray-700">{message}</p>

      {/* Quiz section */}
      <div>
        {loading && <p className="text-sm text-gray-500">Loading quiz…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {quiz && (
          <div className="mt-2 p-3 border rounded bg-gray-50">
            {/* helper to stringify/question text */}
            {/**/}
            {(() => {
              const toText = (v: any) => {
                if (v == null) return '';
                if (typeof v === 'string' || typeof v === 'number') return String(v);
                if (typeof v === 'object') {
                  return v.text ?? v.question ?? v.title ?? JSON.stringify(v);
                }
                return String(v);
              };

              const questionText = toText(quiz.question ?? quiz.q ?? quiz.prompt);
              const opts: any[] = quiz.options ?? quiz.choices ?? quiz.answers ?? [];
              const multi = quiz.multiple === true || quiz.type === 'multiple' || quiz.allow_multiple === true;

              return (
                <>
                  <div className="font-medium mb-2">{questionText}</div>
                  <ul className="space-y-1">
                    {Array.isArray(opts) && opts.length > 0 ? (
                      opts.map((opt: any, idx: number) => {
                        const optValue = opt?.id ?? opt?.value ?? opt ?? idx;
                        const checked = multi ? (selected instanceof Set ? selected.has(optValue) : false) : selected === optValue;
                        return (
                          <li key={idx} className="text-sm">
                            <label className="inline-flex items-center space-x-2">
                              {multi ? (
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    if (!(selected instanceof Set)) setSelected(new Set());
                                    setSelected((prev: any) => {
                                      const s = new Set(prev instanceof Set ? Array.from(prev) : []);
                                      if (s.has(optValue)) s.delete(optValue); else s.add(optValue);
                                      return s;
                                    });
                                  }}
                                />
                              ) : (
                                <input
                                  type="radio"
                                  name={`qc-${quiz.id ?? 'q'}`}
                                  checked={checked}
                                  onChange={() => setSelected(optValue)}
                                />
                              )}
                              <span> {toText(opt)}</span>
                            </label>
                          </li>
                        );
                      })
                    ) : (
                      quiz.message && <li className="text-sm">{toText(quiz.message)}</li>
                    )}
                  </ul>
                </>
              );
            })()}
          </div>
        )}

        {/* Submit area */}
        {quiz && (
          <div className="mt-3 flex items-center space-x-3">
            <button
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
              disabled={submitting || (selected == null || (selected instanceof Set && selected.size === 0))}
              onClick={async () => {
                setSubmitting(true);
                setSubmitError(null);
                setSubmitSuccess(null);
                try {
                  const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
                  const endpoint = submitEndpoint ?? `${baseUrl}/quick-quiz/submit-answer`;
                  const token = localStorage.getItem('token');
                  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                  if (token) headers.Authorization = `Bearer ${token}`;

                  const body: any = {
                    quiz_id: quiz.id ?? quiz.quiz_id ?? null,
                    // backend expects quick_quiz_id (snake_case); include it from available fields
                    quick_quiz_id: quiz.quick_quiz_id ?? quiz.id ?? quiz.quiz_id ?? null,
                    content_id: contentId ?? null,
                    chapter_id: chapterId ?? null,
                    course_id: courseId ?? null,
                    video_time: currentTime ? Math.round(currentTime) : 0,
                  };
                  // include student identifier if available
                  const studentId = localStorage.getItem('student_id') ?? localStorage.getItem('user_id') ?? localStorage.getItem('id') ?? null;
                  if (studentId) body.student_id = studentId;

                  if (selected instanceof Set) {
                    const arr = Array.from(selected);
                    body.answer = arr;
                    body.selected_option_ids = arr;
                  } else {
                    body.answer = selected;
                    body.selected_option_id = selected;
                  }

                  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
                  if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    throw new Error(text || `Server ${res.status}`);
                  }
                  const json = await res.json();
                  setSubmitSuccess(true);
                  if (onSubmit) onSubmit({ success: true, data: json });
                } catch (e: any) {
                  setSubmitError(e?.message ?? 'Failed to submit');
                  setSubmitSuccess(false);
                  if (onSubmit) onSubmit({ success: false, data: e });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
            {submitError && <div className="text-sm text-red-500">{submitError}</div>}
            {submitSuccess && <div className="text-sm text-green-600">Answer submitted</div>}
          </div>
        )}
      </div>

        {/* close button removed; modal header/controls should handle closing */}
    </div>
  );
};

export default QuickCheck;
