import React from "react";
import { useNavigate } from "react-router-dom";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function EditModulePermissions({ onClose, permissionId }: { onClose: () => void; permissionId?: number | null }) {
  // Function to handle saving permissions
  const handleSavePermissions = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  // setLoading(true); // Removed unused setter
  // setMessage(""); // Removed unused setter
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/users/${permissionId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permission_ids: [
            canCreate ? 1 : 0,
            canRead ? 1 : 0,
            canUpdate ? 1 : 0,
            canDelete ? 1 : 0
          ],
        }),
      });
      const data = await response.json();
      if (data.success) {
  // setMessage("Permissions updated successfully."); // Removed unused setter
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
  // setMessage(data.message || "Failed to update permissions."); // Removed unused setter
      }
    } catch (error) {
  // setMessage("Error updating permissions."); // Removed unused setter
    } finally {
  // setLoading(false); // Removed unused setter
    }
  };
  const [modules, setModules] = React.useState<any>(null);
  const [canCreate, setCanCreate] = React.useState(false);
  const [canUpdate, setCanUpdate] = React.useState(false);
  const [canRead, setCanRead] = React.useState(false);
  const [canDelete, setCanDelete] = React.useState(false);
  // const [message, setMessage] = React.useState<string>(""); // Removed unused variable
  // const [loading, setLoading] = React.useState<boolean>(true); // Removed unused variable
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('permissionId', permissionId);
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/users/permissions/${permissionId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success === false) {
          if (data.error_code === 300) {
            // setMessage(data.message); // Removed unused setter
            navigate("/admin");
          }
          if (data.error_code === 401) {
            navigate("/permission-denied");
          }
        } else {
          setModules(data.data || null);
          setCanCreate(!!data.data?.can_create);
          setCanUpdate(!!data.data?.can_update);
          setCanRead(!!data.data?.can_read);
          setCanDelete(!!data.data?.can_delete);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
  // setMessage("Failed to load modules."); // Removed unused setter
      } finally {
  // setLoading(false); // Removed unused setter
      }
    };
    fetchModules();
  }, [navigate]);
 
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        onClick={onClose}
        aria-label="Close"
      >×</button>
      <h2 className="text-lg font-bold mb-4">Edit Current Module & Permissions</h2>
      {permissionId && (
        <div className="mb-2 text-sm text-gray-500">Editing Permission ID: {permissionId}</div>
      )}
      <form className="space-y-5" onSubmit={handleSavePermissions}>
        {modules ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Module Name</label>
              <input className="w-full rounded-lg border p-2" value={modules.module?.name || ''} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <div className="flex gap-4">
                <label><input type="checkbox" checked={canCreate} onChange={e => setCanCreate(e.target.checked)} /> Create</label>
                <label><input type="checkbox" checked={canUpdate} onChange={e => setCanUpdate(e.target.checked)} /> Edit</label>
                <label><input type="checkbox" checked={canRead} onChange={e => setCanRead(e.target.checked)} /> Read</label>
                <label><input type="checkbox" checked={canDelete} onChange={e => setCanDelete(e.target.checked)} /> Delete</label>
              </div>
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full">
            Save Changes
          </button>
          <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full" onClick={() => {/* TODO: Add delete logic */}}>
            Delete Permission
          </button>
        </div>
      </form>
    </div>
  );
}
