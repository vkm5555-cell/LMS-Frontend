import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


  export default function Discussions({ comments = [], initialExpanded = false, contentData }: any) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [text, setText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user: currentUser } = useCurrentUser();
  const [items, setItems] = useState<any[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

  const pageSize = 2;
  const [visibleCount, setVisibleCount] = useState(Math.min(pageSize, comments.length));
  const [replyErrors, setReplyErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    fetchDiscussions();
  }, [contentData?.id]);

  const fetchDiscussions = async () => {
  if (!contentData?.id) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${apiBaseUrl}/discussions?content_id=${contentData.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!res.ok) return;

    const data = await res.json();

    // ---- FETCH USER DETAILS FOR EACH COMMENT ----
   
    setItems(data);
    setVisibleCount(Math.min(pageSize, data.length));
  } catch (err) {
    console.error("Error loading discussions", err);
  }
};



  async function postThread(bodyText: string, setError?: (msg: string | null) => void): Promise<boolean> {
    const trimmed = (bodyText || '').trim();

    if (!trimmed) {
      setError?.("Comment cannot be empty.");
      return false;
    }
    if (trimmed.length < 2) {
      setError?.("Comment must be at least 2 characters.");
      return false;
    }
    if (trimmed.length > 2000) {
      setError?.("Comment cannot exceed 2000 characters.");
      return false;
    }

    setError?.(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ course_id: 10,
                              chapter_id: contentData?.chapter_id,
                              content_id: contentData?.id,      
                              user_id: currentUser?.id,
                              title: trimmed.slice(0, 80),      
                              content: trimmed }),
                            });

      if (!res.ok) {
        setError?.("Failed to save comment. Please try again.");
        return false;
      }
      fetchDiscussions();      
      return true;
    } catch (err) {
      setError?.("Network error while posting comment.");
      console.warn("Error posting thread", err);
      return false;
    }
  }

  async function postReply(parentId: number | string, bodyText: string): Promise<boolean> {
    const trimmed = (bodyText || '').trim();
    if (!trimmed) return false;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${apiBaseUrl}/discussions/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          discussion_id: parentId,
          parent_id: parentId,
          content: trimmed,
          user_id:  currentUser?.id,
          course_id: 10,
          chapter_id: contentData?.chapter_id,
          content_id: contentData?.id,
        }),
      });

      if (!res.ok) {
        console.log("Reply save failed");
        return false;
      }

      // Refresh list after saving
      await fetchDiscussions();

      return true;

    } catch (err) {
      console.error("Reply error", err);
      return false;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 mb-16">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Discussions</h2>
          <p className="text-sm text-gray-500">Questions and conversations about this chapter</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-white border rounded-full px-3 py-1 shadow-sm">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-6l-4 4v-4H7a2 2 0 01-2-2V8a2 2 0 012-2h2"></path></svg>
            <span className="text-sm text-gray-700">{items.length}</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {expanded ? 'Hide' : 'Show'}
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">

          {/* Posts List */}
          <div className="space-y-3">
            {items.slice(0, visibleCount).map((c) => (
              <article key={c.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="flex-none">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                      {c.user?.name
                        ? c.user.name.split(" ").map((n:any) => n[0]).join("").slice(0, 2)  
                        : "U"}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{c.user?.name ?? 'Unknown'}</span>
                        <span className="text-xs text-gray-400">
                          {c.created_at 
                            ? new Date(c.created_at).toLocaleDateString() + " " + new Date(c.created_at).toLocaleTimeString()
                            : ''
                          }
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">{c.created_at 
                            ? new Date(c.created_at).toLocaleDateString() + " " + new Date(c.created_at).toLocaleTimeString()
                            : ''
                          }</div>
                    </div>

                    <p className="mt-2 text-gray-800 leading-relaxed">{c.content}</p>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition">
                        <span>👍</span>
                        <span className="text-gray-700">{c.likes ?? 0}</span>
                      </button>

                      <button
                        onClick={() => setReplyOpen(prev => ({ ...prev, [String(c.id)]: !prev[String(c.id)] }))}
                        className="px-2 py-1 rounded hover:bg-gray-100 transition text-indigo-600"
                      >
                        Respond({c.comments.length ?? 0})
                      </button>

                      <button className="px-2 py-1 rounded hover:bg-gray-100 transition">Share</button>
                    </div>

                    {/* Replies */}
                    {c.comments && c.comments.length > 0 && (
                      <div className="mt-3 space-y-2 pl-12">
                        {c.comments.map((r:any) => (
                          <div key={r.id} className="bg-gray-50 border rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-800">{r.user?.name ?? 'Unknown'}</div>
                              <div className="text-xs text-gray-400">
                                {r.created_at
                                  ? new Date(r.created_at).toLocaleDateString() + " " + new Date(r.created_at).toLocaleTimeString()
                                  : ''
                                }
                              </div>
                            </div>
                            <div className="mt-1 text-gray-700">{r.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {/* Reply Input */}
                    {replyOpen[String(c.id)] && (
                      <div className="mt-3 pl-12">
                        <textarea
                          value={replyDrafts[String(c.id)] ?? ''}
                          onChange={(e) => {
                            setReplyDrafts(prev => ({ ...prev, [String(c.id)]: e.target.value }));
                            setReplyErrors(prev => ({ ...prev, [String(c.id)]: null })); // clear error on typing
                          }}
                          rows={2}
                          placeholder="Write a reply..."
                          className={`w-full border rounded-md p-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 ${
                            replyErrors[String(c.id)] ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200'
                          }`}
                        />

                        {/* Error message */}
                        {replyErrors[String(c.id)] && (
                          <p className="text-red-600 text-xs mt-1">
                            {replyErrors[String(c.id)]}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setReplyDrafts(prev => ({ ...prev, [String(c.id)]: '' }));
                              setReplyErrors(prev => ({ ...prev, [String(c.id)]: null }));
                            }}
                            className="px-3 py-1 border rounded-md text-sm"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={async () => {
                              const key = String(c.id);
                              const replyText = (replyDrafts[key] || '').trim();

                              // VALIDATION
                              if (!replyText) {
                                setReplyErrors(prev => ({ ...prev, [key]: "Reply cannot be empty." }));
                                return;
                              }
                              if (replyText.length < 2) {
                                setReplyErrors(prev => ({ ...prev, [key]: "Reply must be at least 2 characters." }));
                                return;
                              }
                              if (replyText.length > 2000) {
                                setReplyErrors(prev => ({ ...prev, [key]: "Reply cannot exceed 2000 characters." }));
                                return;
                              }

                              // If passes validation → call API
                              const success = await postReply(c.id, replyText);

                              if (success) {
                                setReplyDrafts(prev => ({ ...prev, [key]: '' }));
                                setReplyErrors(prev => ({ ...prev, [key]: null }));
                                setReplyOpen(prev => ({ ...prev, [key]: false }));
                              }
                            }}
                            className="px-4 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleCount < items.length && (
            <div className="mt-2">
              <button
                onClick={() => setVisibleCount(v => Math.min(items.length, v + pageSize))}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700"
              >
                Show More Posts
              </button>
            </div>
          )}

          {/* New Post Box */}
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-none">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-semibold text-gray-700">
                  {(() => {
                    const fn = currentUser?.first_name ?? '';
                    const ln = currentUser?.last_name ?? '';
                    const initials = (fn ? fn[0] : '') + (ln ? ln[0] : '');
                    return initials || 'You';
                  })()}
                </div>
              </div>

              <div className="flex-1">
                <textarea
                  id="new-thread"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  rows={3}
                  placeholder="Ask a question or add a helpful comment..."
                  className={`w-full border rounded-xl p-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 ${errorMessage ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200'}`}
                />

                {errorMessage && (
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">{text.length} / 2000</div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => setText('')} className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>

                    <button
                      onClick={async () => {
                        const ok = await postThread(text, setErrorMessage);
                        if (ok) {
                          setText('');
                          setErrorMessage(null);
                        }
                      }}
                      className="px-4 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Post
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}