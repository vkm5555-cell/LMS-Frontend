import { useEffect, useState } from "react";

type OptionResult = {
  id: number;
  text: string;
  selected: boolean;
  is_correct: boolean;
};

type QuestionResult = {
  id: number;
  question: string;
  attempted: number;
  is_correct: boolean;
  options: OptionResult[];
};

type QuizResult = {
  score: number;
  total: number;
  questions: QuestionResult[];
};

type Props = {
  courseId: number | string | null;
  chapterId: number | string | null;
  contentId: number | string | null;
  apiBaseUrl: string;
  onScoreLoaded?: (score: number, total: number) => void;
};

export default function QuickQuizResultViewer({
  courseId,
  chapterId,
  contentId,
  apiBaseUrl,
  onScoreLoaded,
}: Props) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !chapterId || !contentId) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${apiBaseUrl}/quick-quiz/result?course_id=${courseId}&chapter_id=${chapterId}&content_id=${contentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok || json.success === false) {
          throw new Error(json.message || "Failed to load quiz result");
        }

        setResult(json.data);
        onScoreLoaded?.(json.data.score, json.data.total);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [courseId, chapterId, contentId, apiBaseUrl, onScoreLoaded]);

  if (loading) return <div className="text-sm text-gray-500">Loading quiz result…</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!result) return <div className="text-sm text-gray-500">No result available.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="border px-4 py-2 text-left">Question</th>
            <th className="border px-4 py-2 text-left">Attempts</th>
            <th className="border px-4 py-2 text-left">Correct?</th>
            <th className="border px-4 py-2 text-left">Score</th>
          </tr>
        </thead>
        <tbody>
          {result.questions.map((q, idx) => {
            // get all selected options (attempts)
            const attempts = q.options.filter(o => o.selected);

            return (
              <tr key={q.id}>
                <td className="border px-4 py-2 font-semibold">{q.question}</td>
                <td className="border px-4 py-2">
                  {attempts.map((a, i) => (
                    <span
                      key={i}
                      className={`inline-block px-2 py-1 mr-1 rounded text-white font-bold ${
                        a.is_correct ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {a.is_correct ? "✔" : "✖"}
                    </span>
                  ))}
                </td>
                <td className="border px-4 py-2">{q.is_correct ? "Yes" : "No"}</td>
                <td className="border px-4 py-2">{q.is_correct ? 1 : 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 p-4 border rounded-lg bg-indigo-50 text-indigo-700 font-semibold">
        Total Score: {result.score} / {result.total}
      </div>
    </div>
  );
}
