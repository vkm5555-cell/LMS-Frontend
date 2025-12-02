import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/modal';

interface ChapterCardProps {
  chapter: any;
  index: number;
  courseId?: string | undefined;
  onDeleted?: (idOrIndex: any) => void;
}

const ChapterCard: FC<ChapterCardProps> = ({ chapter: ch, index, courseId, onDeleted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setIsMenuOpen(false);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isMenuOpen]);

  const handleAddContent = () => {
    setIsMenuOpen(false);
    navigate(`/courses/${courseId}/chapters/${ch.id || index}/content/add`);
  };

  const handleEdit = () => {
    // open inline edit modal
    setIsMenuOpen(false);
    setEditName(ch.chapter_name || '');
    setEditDescription(ch.description || '');
    setIsEditOpen(true);
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const submitEdit = async () => {
    if (!ch?.id) {
      alert('Chapter id missing');
      return;
    }
    const ok = window.confirm('Save changes to this chapter?');
    if (!ok) return;
    try {
      setEditLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('chapter_name', editName);
      formData.append('description', editDescription);
      const res = await fetch(`${apiBaseUrl}/chapters/${ch.id}/update`, {
        method: 'PUT',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.message || 'Failed to save chapter');
        return;
      }
      alert('Chapter updated');
      setIsEditOpen(false);
      // refresh page or notify parent — simple approach: reload
      window.location.reload();
    } catch (err) {
      alert('Failed to update chapter');
    } finally {
      setEditLoading(false);
    }
  };

  const handleView = () => {
    setIsMenuOpen(false);
    navigate(`/courses/${courseId}/chapters/${ch.id || index}`);
  };

  const handleDelete = async () => {
    setIsMenuOpen(false);
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      const chapterId = ch.id;
      if (!chapterId) {
        alert('Cannot delete: chapter id missing');
        return;
      }
      const res = await fetch(`${apiBaseUrl}/courses/${courseId}/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Delete failed');
      // notify parent to remove locally
      onDeleted && onDeleted(chapterId || ch.order || index);
    } catch (err) {
      alert('Failed to delete chapter');
    }
  };

  return (
    <div className="rounded-lg border p-3 relative">
      <div className="flex items-start justify-between">
        <div>          
          <div className="text-md font-semibold">Chapter:{index +1} {ch.chapter_name}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">{ch.user?.name || '-'}</div>
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsMenuOpen(v => !v)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Open chapter menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
              </svg>
            </button>
            {isMenuOpen && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-56 bg-white border rounded shadow z-50 overflow-hidden">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={handleView}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  View chapter
                </button>
                <div className="border-t" />
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={handleAddContent}
                >
                  <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Chapter content
                </button> 
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={handleEdit}
                >
                  <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6 6L21 11l-6-6-6 6z"></path></svg>
                  Edit chapter
                </button>
                <div className="border-t" />
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  onClick={handleDelete}
                >
                  <svg className="w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"></path></svg>
                  Delete chapter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {ch.description && <p className="mt-2 text-gray-700">{ch.description}</p>}
      {/* Edit modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} className="max-w-2xl mx-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Edit Chapter</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Title</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full mt-1 border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Description</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full mt-1 border rounded px-3 py-2" rows={6} />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setIsEditOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={submitEdit} className="px-3 py-1 bg-indigo-600 text-white rounded">{editLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChapterCard;
