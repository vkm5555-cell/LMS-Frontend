import React from "react";
import { Modal } from '../../../components/ui/modal';

interface EditChapterContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any; // use ChapterContentItem if imported
  onUpdated: () => void;
}

const EditChapterContentModal: React.FC<EditChapterContentModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdated,
}) => {
  const [title, setTitle] = React.useState(item?.title ?? "");
  const [slug, setSlug] = React.useState(item?.slug ?? "");
  const [description, setDescription] = React.useState(item?.description ?? "");
  const [contentType, setContentType] = React.useState(item?.content_type ?? "html");
  const [contentUrl, setContentUrl] = React.useState(item?.content_url ?? "");
  const [content, setContent] = React.useState(item?.content ?? "");
  const [fileUpload, setFileUpload] = React.useState<File | null>(null);
  const [videoDuration, setVideoDuration] = React.useState<number | undefined>(item?.video_duration);
  const [position, setPosition] = React.useState<number | undefined>(item?.position);
  const [isPublished, setIsPublished] = React.useState(item?.is_published ?? false);
  const [isFree, setIsFree] = React.useState(item?.is_free ?? false);
  const [metaData, setMetaData] = React.useState(item?.meta_data ?? "");
  //const [contentDraft, setContentDraft] = React.useState(item?.content_url ?? "");
  const [errors, setErrors] = React.useState<any>({});
  const [saving, setSaving] = React.useState(false);

  const validateField = (field: string) => {
    const newErrors: any = { ...errors };
    switch (field) {
      case "title":
        if (!title.trim()) newErrors.title = "Title is required";
        else delete newErrors.title;
        break;
      case "slug":
        if (!slug.trim()) newErrors.slug = "Slug is required";
        else delete newErrors.slug;
        break;
      case "description":
        if (!description.trim()) newErrors.description = "Description is required";
        else delete newErrors.description;
        break;
      case "position":
        if (!position) newErrors.position = "Position is required";
        else delete newErrors.position;
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("content_type", contentType);
      if (contentType === "file" && fileUpload) {
        formData.append("content_file", fileUpload);
      } else {
        formData.append("content_url", contentUrl);
      }
      if (contentType === "video"){
        formData.append("video_duration", String(videoDuration ?? ""));
      }else {
        formData.append("video_duration", "0");
      }
      const UserId = localStorage.getItem('user_id');
      formData.append("user_id", UserId ? UserId : "");
      formData.append("position", String(position ?? ""));
      formData.append("is_published", String(isPublished));
      formData.append("is_free", String(isFree));
      formData.append("meta_data", metaData);
      formData.append("content", content);

      const res = await fetch(`${apiBaseUrl}/chapters/chapter-contents/${item.id}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update content");

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ server: "Update failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-4">
      <div className="p-2 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Edit Chapter Content</h3>
        <form onSubmit={handleUpdate} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => validateField("title")}
                className="w-full rounded border px-3 py-2"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={() => validateField("slug")}
                className="w-full rounded border px-3 py-2"
              />
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="html">HTML</option>
                <option value="video">Video</option>
                <option value="file">File</option>
                <option value="external">External URL</option>
              </select>
            </div>

            {/* File or URL */}
            {contentType === "file" ? (
              <div>
                <label className="block text-sm font-medium mb-1">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => setFileUpload(e.target.files?.[0] ?? null)}
                  className="w-full"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Content URL</label>
                <input
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            )}

            {/* Video Duration */}
            {contentType === "video" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Video Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={videoDuration ?? ""}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            )}

            {/* Position */}
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <input
                type="number"
                value={position ?? ""}
                onChange={(e) => setPosition(Number(e.target.value))}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                />
                Free
              </label>
            </div>

            {/* Meta Data */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Meta Data</label>
              <textarea
                value={metaData}
                onChange={(e) => setMetaData(e.target.value)}
                rows={3}
                className="w-full rounded border px-3 py-2 font-mono text-sm"
              />
            </div>

            {/* Content (HTML) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {errors.server && <div className="mt-2 text-sm text-red-600">{errors.server}</div>}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditChapterContentModal;
