import React from "react";
//import { useNavigate } from "react-router-dom";
import EditChapterContentModal from "./EditChapterContentModal";

export interface ChapterContentItem {
  id: number;
  chapter_id: number;
  user_id: number;
  title: string;
  slug: string;
  description: string;
  content_type: string;
  content_url: string;
  content: string;
  video_duration: number;
  position: number;
  is_published: boolean;
  is_free: boolean;
  thumbnail_url: string;
  meta_data: string;
  created_at: string;
  updated_at: string;
}

interface ChapterContentTableProps {
  courseId: string | number;
  chapterId: string | number;
}

const ChapterContentTable: React.FC<ChapterContentTableProps> = ({ courseId, chapterId }) => {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  //const navigate = useNavigate();
  const [showHtmlModal, setShowHtmlModal] = React.useState(false);
  const [htmlContentUrl, setHtmlContentUrl] = React.useState<string | null>(null);

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ChapterContentItem | null>(null);
  // Close dropdown on outside click
  var ci = courseId
  React.useEffect(() => {
    if (openIdx === null) return;
    function handleClick(e: MouseEvent) {
      const dropdowns = document.querySelectorAll('.chapter-content-dropdown');
      let inside = false;
      dropdowns.forEach((el) => {
        if (el.contains(e.target as Node)) inside = true;
      });
      if (!inside) setOpenIdx(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openIdx]);
  //const navigate = useNavigate();
  const [contents, setContents] = React.useState<ChapterContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    fetch(`${apiBaseUrl}/chapters/${chapterId}/contents`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
    })
      .then(res => res.json())
      .then(data => {
        setContents(Array.isArray(data.data) ? data.data : []);
        setError(null);
      })
      .catch(() => setError('Failed to fetch contents'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  const handleDeleteClick = async(id: number) => {
  const confirmed = window.confirm("Are you sure you want to delete this content?");
  if (confirmed) {
          try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiBaseUrl}/chapters/chapter-delete-contents/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to delete content");

      // Update table after delete
      setContents((prev) => prev.filter((c) => c.id !== editItem?.id));
      alert("Content deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting content");
    }
  } else {
    console.log("User clicked Cancel. Do nothing.");
  }
};

const formattedContent = htmlContentUrl
  ? htmlContentUrl.replace(/\n/g, "<br/>")
  : "";

  if (loading) return <div className="p-4">Loading contents...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!contents.length) return <div className="p-4 text-gray-500">No contents found.</div>;
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Chapter Contents {ci}</h3>
      <div>
        <table className="min-w-full bg-white border rounded z-1">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Content</th>
              <th className="px-4 py-2 text-left">Duration</th>
              {/* <th className="px-4 py-2 text-left">Position</th> */}
              <th className="px-4 py-2 text-left">Published</th>
              <th className="px-4 py-2 text-left">Free</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((item, idx) => (
              <tr key={item.id || idx} className="border-b">
                <td className="px-4 py-2">{item.title}</td>
                <td className="px-4 py-2">{item.slug}</td>
                <td className="px-4 py-2">{item.content_type}</td>
                <td className="px-4 py-2 break-all">
                    {item.content_type === 'file' && item.content_url ? (
                        // FILE CONTENT
                        <div className="flex flex-col gap-2">
                        <div className="flex gap-2 mt-1">
                            <a
                            href={item.content_url}
                            download={item.content_url.split('/').pop() || 'file'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-gray-100 rounded hover:bg-blue-100 text-blue-700"
                            >
                            Download
                            </a>
                            <button
                            className="inline-flex items-center px-2 py-1 bg-gray-100 rounded hover:bg-green-100 text-green-700"
                            onClick={async () => {
                                try {
                                if (item.content_url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) || item.content_url.match(/\.pdf$/i)) {
                                    window.open(item.content_url, '_blank');
                                    return;
                                }
                                const res = await fetch(item.content_url);
                                if (!res.ok) throw new Error('Failed to fetch file');
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                window.open(url, '_blank');
                                setTimeout(() => window.URL.revokeObjectURL(url), 10000);
                                } catch (err) {
                                alert('Failed to open file.');
                                }
                            }}
                            >
                            Open
                            </button>
                        </div>
                        </div>
                    ) : item.content_type === 'video' && item.content_url ? (
                        // VIDEO CONTENT
                        <div className="flex flex-col gap-2">
                        
                        <button
                            className="inline-flex items-center px-2 py-1 bg-gray-100 rounded hover:bg-blue-100 text-blue-700 w-fit"
                            onClick={() => window.open(item.content_url, '_blank')}
                        >
                            Open Video
                        </button>
                        </div>
                    ) : item.content_type === 'html' && item.content_url ? (
                        // HTML CONTENT (Popup)
                        <div className="flex flex-col gap-2">
                        <button
                            className="inline-flex items-center px-2 py-1 bg-gray-100 rounded hover:bg-purple-100 text-purple-700 w-fit"
                            onClick={() => {
                            setHtmlContentUrl(item.content);
                            setShowHtmlModal(true);
                            }}
                        >
                            Open HTML
                        </button>
                        </div>
                    ) : (
                        item.content_url || "-"
                    )}
                </td>
                <td className="px-4 py-2">
                    {item.content_type === 'video'
                    ? item.video_duration
                    ? `${item.video_duration} Minutes`
                    : 'N/A'
                    : '-'}
                </td>
                {/* <td className="px-4 py-2">{item.position}</td> */}
                <td className="px-4 py-2">{item.is_published ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">{item.is_free ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">
                  <div className="relative inline-block chapter-content-dropdown z-1">
                    <button
                      className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                      tabIndex={0}
                      aria-label="Actions"
                      onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="12" r="2" fill="#555" />
                        <circle cx="12" cy="12" r="2" fill="#555" />
                        <circle cx="19" cy="12" r="2" fill="#555" />
                      </svg>
                    </button>
                    {openIdx === idx && (
                      <div
                        className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-1000"
                        onMouseEnter={() => setOpenIdx(idx)}
                        onMouseLeave={() => setOpenIdx(null)}
                      >

                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-blue-50"
                          onClick={() => {
                            setOpenIdx(null);
                            // Include courseId and chapterId as query params so the topic page
                            // can know the context it was opened from.
                            const params = new URLSearchParams();
                            if (courseId != null) params.set('courseId', String(courseId));
                            if (chapterId != null) params.set('chapterId', String(chapterId));
                            const url = `/courses/chapters/topics/${item.id}${params.toString() ? `?${params.toString()}` : ''}`;
                            // open in new tab
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          View
                        </button>
                        
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-blue-50"
                          onClick={() => {
                            setOpenIdx(null);
                            setEditItem(item);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-red-50"
                          onClick={() => {
                            setOpenIdx(null); 
                            handleDeleteClick(item.id);
                          }}
                        >
                          Delete
                        </button>
                        {item.is_published ? (
                          <span className="block w-full text-left px-4 py-2 text-green-700">Published</span>
                        ) : (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-yellow-50"
                            onClick={() => { setOpenIdx(null); /* TODO: implement publish logic */ }}
                          >Publish</button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        {showHtmlModal && htmlContentUrl && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[99999]">
                <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-200">

                {/* Header */}
                <div className="flex items-center justify-between text-black px-6 py-3 bg-gray-100 border-b border-gray-300">
                    <h2 className="text-lg font-semibold">HTML Content Preview</h2>
                    <button
                    onClick={() => setShowHtmlModal(false)}
                    className="text-black hover:bg-gray-200 rounded-full p-2 transition"
                    title="Close"
                    >
                    ✕
                    </button>
                </div>

                {/* HTML Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div
                    className="prose max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:underline prose-img:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                    />
                </div>

                {/* Footer */}
                <div className="bg-gray-100 px-6 py-3 flex justify-end">
                    <button
                    onClick={() => setShowHtmlModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                    Close
                    </button>
                </div>
                </div>
            </div>
        )}

        {showEditModal && editItem && (
          <EditChapterContentModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            item={editItem}
            onUpdated={() => {
              // refresh list after save
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
              const token = localStorage.getItem("token");
              fetch(`${apiBaseUrl}/chapters/${chapterId}/contents`, {
                headers: {
                  Accept: "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              })
                .then((res) => res.json())
                .then((data) => setContents(Array.isArray(data.data) ? data.data : []));
            }}
          />
        )}




    </div>
  );
};

export default ChapterContentTable;
