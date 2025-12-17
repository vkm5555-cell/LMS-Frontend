import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/ui/modal';
import { useModal } from '../../../hooks/useModal';
import * as Yup from 'yup';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import ChapterContentTable from './ChapterContentTable';

export default function ViewChapter() {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = (params as any).courseId ?? (params as any).id;
  const chapterId = (params as any).chapterId ?? (params as any).chapterId;

  const [chapter, setChapter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [contentDraft, setContentDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [contentType, setContentType] = useState<string>("html");
  const [contentUrl, setContentUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number | undefined>(undefined);
  const [position, setPosition] = useState<number | undefined>(undefined);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [metaData, setMetaData] = useState<string>("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // fetch chapter
  useEffect(() => {
    if (!courseId || !chapterId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const fetchChapter = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBaseUrl}/chapters/chaptergetbyid/${chapterId}`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!mounted) return;
        if (!res.ok) {
          setError('Failed to fetch chapter');
          setChapter(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        // accept multiple shapes
        const ch = data.data || data.chapter || data || null;
        setChapter(ch);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to fetch chapter');
        setChapter(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchChapter();
    return () => { mounted = false; };
  }, [courseId, chapterId]);

  // sync form with fetched chapter
  useEffect(() => {
    setContentDraft(chapter?.content || "");
    setTitle(chapter?.title || chapter?.chapter_name || "");
    setSlug(chapter?.slug || "");
    setDescription(chapter?.description || "");
    setContentType(chapter?.content_type || chapter?.type || "html");
    setContentUrl(chapter?.content_url || "");
    setVideoDuration(chapter?.video_duration ?? chapter?.duration ?? undefined);
    setPosition(chapter?.position ?? chapter?.order ?? undefined);
    setIsPublished(!!chapter?.is_published);
    setIsFree(chapter?.is_free === undefined ? true : !!chapter?.is_free);
    setUserId(chapter?.user_id ?? chapter?.user?.id ?? undefined);

    const rawMeta = chapter?.meta_data ?? chapter?.meta ?? '';
    if (typeof rawMeta === 'string') {
      setMetaData(rawMeta);
    } else if (rawMeta !== null && rawMeta !== undefined) {
      try { setMetaData(JSON.stringify(rawMeta, null, 2)); } catch { setMetaData(String(rawMeta)); }
    } else {
      setMetaData('');
    }
  }, [chapter]);

  useEffect(() => {
  if (!isOpen) return;
  // Reset form fields to defaults/empty when modal opens
    setContentDraft('');
    setTitle('');
    setSlug('');
    setDescription('');
    setContentType('html');
    setContentUrl('');
    setVideoDuration(undefined);
    setPosition(undefined);
    setIsPublished(false);
    setIsFree(true);
    // Get user_id from localStorage and set it
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId ? Number(storedUserId) : undefined);
    setMetaData('');
    setFileUpload(null);
    setErrors({});
    }, [isOpen]);

  // Yup validation schema for chapter modal
  const chapterSchema = Yup.object().shape({
    title: Yup.string().trim().max(255, 'Title is too long').required('Title is required'),
    slug: Yup.string().trim().matches(/^[a-z0-9-]*$/i, 'Slug can only contain letters, numbers and hyphens').required('Slug is required'),
    description: Yup.string().max(2000, 'Description is too long').required('Description is required'),
    content_type: Yup.string().oneOf(['html', 'video', 'file', 'external']).required('Content type is required'),
    content_url: (Yup.string() as any).when('content_type', (content_type: any, schema: any) => {
      if (content_type && (content_type === 'external' || content_type === 'video')) {
        return schema.required('Content URL is required').url('Content URL must be a valid URL');
      }
      return schema.nullable();
    }),
    video_duration: (Yup.number() as any).when('content_type', (content_type: any, schema: any) => {
      if (content_type === 'video') {
        return schema.integer('Video duration must be an integer').min(0, 'Video duration must be >= 0').required('Video duration is required');
      }
      return schema.nullable();
    }),
    position: Yup.number().integer('Position must be an integer').min(0, 'Position must be >= 0').required('Position is required'),
    is_published: Yup.boolean().required('Published flag is required'),
    is_free: Yup.boolean().required('Free flag is required'),
    user_id: Yup.number().integer('User ID must be an integer').required('User ID is required'),
    meta_data: Yup.string().required('Meta data is required'),
    content: Yup.string().required('Content is required'),
  });

  const getFormValues = () => ({
    title: title || null,
    slug: slug || null,
    description: description || null,
    content_type: contentType,
    content_url: contentUrl || null,
    video_duration: videoDuration ?? null,
    position: position ?? null,
    is_published: isPublished,
    is_free: isFree,
    user_id: userId ?? null,
    meta_data: metaData || null,
    content: contentDraft || null,
  });

  const validateForm = async () => {
    const payloadForValidation = getFormValues();

    try {
      await chapterSchema.validate(payloadForValidation, { abortEarly: false });

      // extra check: when content_type is 'file', require a selected file
      if (contentType === 'file') {
        if (!fileUpload) {
          setErrors({ ...{}, content_file: 'File is required' });
          return false;
        }
      }

      setErrors({});
      return true;
    } catch (validationError: any) {
      const newErrors: Record<string, string> = {};
      if (validationError && validationError.inner && Array.isArray(validationError.inner)) {
        validationError.inner.forEach((err: any) => {
          if (err.path) newErrors[err.path] = err.message;
        });
      } else if (validationError.path) {
        newErrors[validationError.path] = validationError.message;
      }
      console.warn('Chapter validation failed', validationError);
      setErrors(newErrors);
      return false;
    }
  };

  const validateField = async (field: string) => {
    try {
      await (chapterSchema as any).validateAt(field, getFormValues());
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Invalid';
      setErrors((prev) => ({ ...prev, [field]: msg }));
      return false;
    }
  };

  // submission handler with FormEvent typing
  const handleSaveContent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      // client-side validation
      const ok = await validateForm();
      if (!ok) {
        setSaving(false);
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("title", title ?? "");
      formData.append("slug", slug ?? "");
      formData.append("description", description ?? "");
      formData.append("content_type", contentType);
      // content_url may be empty string when not required
      if (contentUrl) formData.append("content_url", contentUrl);
      formData.append("position", (position ?? 0).toString());
      // booleans and numbers should be sent as strings in multipart
      formData.append("is_published", String(isPublished));
      formData.append("is_free", String(isFree));
      formData.append("user_id", String(userId ?? ""));
      formData.append("meta_data", metaData ?? "");
      formData.append("content", contentDraft ?? "");

      if (contentType === "video" && (videoDuration !== undefined && videoDuration !== null)) {
        formData.append("video_duration", String(videoDuration));
      }else{
        formData.append("video_duration", String(0));
      }

      if ((contentType === "file" || contentType === "video") && fileUpload) {
        formData.append("content_file", fileUpload);        
      }

      // send request
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiBaseUrl}/chapters/${chapterId}/contents`, {
        method: "POST",
        body: formData,
        headers: {         
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        // try to parse json error message
        let errorPayload: any = null;
        try {
          errorPayload = await response.json();
        } catch (_) {
          // not JSON
        }

        // server may return validation errors in different shapes; normalize here
        if (errorPayload && typeof errorPayload === 'object') {
          // common shapes: { errors: { field: ["msg"] } } or { detail: "msg" } or { field: ["msg"] }
          const serverErrors: Record<string, string> = {};
          if (errorPayload.errors && typeof errorPayload.errors === 'object') {
            Object.entries(errorPayload.errors).forEach(([k, v]) => {
              serverErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
            });
          } else if (errorPayload.detail) {
            serverErrors['server'] = String(errorPayload.detail);
          } else {
            // map top-level string fields
            Object.entries(errorPayload).forEach(([k, v]) => {
              serverErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
            });
          }
          setErrors((prev) => ({ ...prev, ...serverErrors }));
        } else {
          setErrors((prev) => ({ ...prev, server: `Failed to save: ${response.statusText || response.status}` }));
        }

        setSaving(false);
        return;
      }

      const data = await response.json().catch(() => null);
      console.log("Content saved:", data);
      // reset/close
      setErrors({});
      closeModal();

      // optionally refresh chapter or navigate / show toast
      // fetch updated chapter or append the new content to state if your API returns it
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrors((prev) => ({ ...prev, server: 'Unexpected error occurred' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <PageMeta title="View Chapter" description="View chapter details" />
      <PageBreadcrumb pageTitle="View Chapter" />
      <div className="p-6">Loading chapter...</div>
    </>
  );

  return (
    <>
      <PageMeta title={`View Chapter`} description="View chapter details" />
      <PageBreadcrumb pageTitle="View Chapter" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <span>Chapter Details</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => { setErrors({}); openModal(); }}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Content
                </button>
                <button
                  onClick={() => navigate(`/courses/${courseId}/chapters/${chapterId}/edit`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          }
        >
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : !chapter ? (
            <div className="text-sm text-gray-500">Chapter not found</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{chapter.title || chapter.chapter_name || '-'}</h2>
                  {chapter.description && <p className="mb-3 text-gray-700">{chapter.description}</p>}
                  <p className="mb-2 text-gray-700"><strong>Order:</strong> {chapter.order ?? '-'}</p>
                  <p className="mb-2 text-gray-700"><strong>User:</strong> {chapter.user?.name ?? chapter.user_name ?? '-'}</p>
                  <p className="mb-2 text-gray-700"><strong>Created At:</strong> {chapter.created_at ? new Date(chapter.created_at).toLocaleString() : '-'}</p>
                  <p className="mb-2 text-gray-700"><strong>Updated At:</strong> {chapter.updated_at ? new Date(chapter.updated_at).toLocaleString() : '-'}</p>
                </div>
                <div>
                  {/* placeholder for chapter content preview or media */}
                  {chapter.content && (
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold mb-2">Content Preview</h3>
                      <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    </div>
                  )}
                </div>
              </div>
              {/* Chapter Content Listing Section */}
              <ChapterContentTable chapterId={chapterId} courseId={courseId} />
            </>
          )}
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl p-4">
        <div className="p-2 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2">Add Chapter Content</h3>
          <form onSubmit={handleSaveContent} encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => validateField('title')} className="w-full rounded border px-3 py-2" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug <span className="text-red-500">*</span></label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={() => validateField('slug')} className="w-full rounded border px-3 py-2" />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => validateField('description')} rows={3} className="w-full rounded border px-3 py-2" />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content Type <span className="text-red-500">*</span></label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} onBlur={() => validateField('content_type')} className="w-full rounded border px-3 py-2">
                  <option value="html">HTML</option>
                  <option value="video">Video</option>
                  <option value="file">File</option>
                  <option value="external">External URL</option>
                </select>
                {errors.content_type && <p className="text-xs text-red-500 mt-1">{errors.content_type}</p>}
              </div>

              {contentType === 'file' || contentType === 'video' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Upload File <span className="text-red-500">*</span></label>
                  <input name="file" type="file" onChange={(e) => { setFileUpload(e.target.files?.[0] ?? null); setErrors((p) => { const c = { ...p }; delete c.content_file; return c; }); }} className="w-full" />
                  {errors.content_file && <p className="text-xs text-red-500 mt-1">{errors.content_file}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Content URL <span className="text-red-500">*</span></label>
                  <input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} onBlur={() => validateField('content_url')} className="w-full rounded border px-3 py-2" />
                  {errors.content_url && <p className="text-xs text-red-500 mt-1">{errors.content_url}</p>}
                </div>
              )}

              {/* {contentType === 'video' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Upload File <span className="text-red-500">*</span></label>
                  <input name="file" type="file" onChange={(e) => { setFileUpload(e.target.files?.[0] ?? null); setErrors((p) => { const c = { ...p }; delete c.content_file; return c; }); }} className="w-full" />
                  {errors.content_file && <p className="text-xs text-red-500 mt-1">{errors.content_file}</p>}
                </div>
              )} */}

              <div>
                <label className="block text-sm font-medium mb-1">Position <span className="text-red-500">*</span></label>
                <input type="number" value={position ?? ''} onChange={(e) => setPosition(e.target.value ? Number(e.target.value) : undefined)} onBlur={() => validateField('position')} className="w-full rounded border px-3 py-2" />
                {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input id="is_published" type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input id="is_free" type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                  <span>Free</span>
                </label>
              </div>

              {/* user_id is hidden - kept for payload */}
              <input type="hidden" name="user_id" value={userId ?? ''} />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Meta Data <span className="text-red-500">*</span></label>
                <textarea value={metaData} onChange={(e) => setMetaData(e.target.value)} onBlur={() => validateField('meta_data')} rows={4} className="w-full rounded border px-3 py-2 font-mono text-sm" />
                {errors.meta_data && <p className="text-xs text-red-500 mt-1">{errors.meta_data}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Content (HTML) <span className="text-red-500">*</span></label>
                <textarea
                  value={contentDraft}
                  onChange={(e) => setContentDraft(e.target.value)}
                  onBlur={() => validateField('content')}
                  rows={10}
                  className="w-full rounded border px-3 py-2 text-sm text-gray-800 bg-white dark:bg-gray-900 dark:text-white/90"
                  placeholder="Enter chapter content (HTML allowed)"
                />
                {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
              </div>

            </div>

            {errors.server && <div className="mt-2 text-sm text-red-600">{errors.server}</div>}

            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
