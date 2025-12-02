
import React from "react";
import { useParams } from "react-router-dom";
import AssignModulePermissions from "../../../components/users/AssignModulePermissions";
import EditModulePermissions from "../../../components/users/EditModulePermissions";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function UserAssignedRole() {
  // DESIGN ONLY: No logic, no API calls
  const [showModal, setShowModal] = React.useState<'assign' | 'edit' | false>(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  return (
    <>
      <PageMeta title="User Assigned Role" description="View assigned role, module, and permissions for user" />
      <PageBreadcrumb pageTitle="User Assigned Role" />
      <div className="space-y-6 relative">
        {/* Top right buttons */}
        <div className="absolute right-0 top-0 flex gap-3" style={{margin: '1rem'}}>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => setShowModal('assign')}
          >
            Assign Module
          </button>
          {/* Removed Edit Current button */}
        </div>
        <ComponentCard title="Assigned Role & Permissions">
          <AssignedRoleCards setShowModal={setShowModal} setSelectedId={setSelectedId} />
        </ComponentCard>
        {/* Modal Popup for Assigning or Editing Modules & Permissions */}
        {showModal === 'assign' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(51, 51, 51, 0.85)'}}>
            <AssignModulePermissions onClose={() => setShowModal(false)} type="assign" />
          </div>
        )}
        {showModal === 'edit' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(51, 51, 51, 0.85)'}}>
            <EditModulePermissions onClose={() => setShowModal(false)} permissionId={selectedId} />
          </div>
        )}
      </div>
    </>
  );
}

// Helper component to fetch and render assigned roles/permissions
type ShowModalType = React.Dispatch<React.SetStateAction<'assign' | 'edit' | false>>;
type AssignedRoleCardsProps = {
  setShowModal: ShowModalType;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
};
function AssignedRoleCards({ setShowModal, setSelectedId }: AssignedRoleCardsProps) {
  const [assigned, setAssigned] = React.useState<Array<any>>([]);
  const [openIdx, setOpenIdx] = React.useState<number>(-1);
  const { id } = useParams();
  React.useEffect(() => {
    const fetchAssignedModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/users/${id}/permissions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success === false) {
          // Optionally handle error, e.g. set message or redirect
        } else {
          setAssigned(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Error fetching user modules:", error);
      }
    };
    fetchAssignedModules();
  }, [id]);
  React.useEffect(() => {
    const close = () => setOpenIdx(-1);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);
  return (
    <div className="space-y-4">
      {assigned.map((item: any, idx: number) => (
        <div key={item.id || idx} className={`border-l-4 rounded-lg shadow p-4 bg-gradient-to-r relative ${idx % 2 === 0 ? 'border-indigo-500 from-indigo-100 via-purple-100 to-pink-100' : 'border-green-500 from-green-100 via-yellow-100 to-pink-100'}`}>
          <div className="absolute top-2 right-2">
            <div className="relative">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 focus:outline-none"
                onClick={e => {e.stopPropagation(); setOpenIdx(idx === openIdx ? -1 : idx);}}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5" cy="12" r="2" fill="#555" />
                  <circle cx="12" cy="12" r="2" fill="#555" />
                  <circle cx="19" cy="12" r="2" fill="#555" />
                </svg>
              </button>
              {openIdx === idx && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={e => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                    setShowModal('edit');
                    setOpenIdx(-1);
                  }}>Edit</a>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={e => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this permission?')) {
                      // You can use item.id here for delete logic
                      // Example: console.log('Delete permission id:', item.id);
                      /* TODO: Delete logic */
                    }
                    setOpenIdx(-1);
                  }}>Delete</a>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div><strong>Module:</strong> {item.module?.name}</div>
            <div><strong>Description:</strong> {item.module?.description}</div>
            <div><strong>Permissions:</strong> {
              [
                item.can_create ? 'Create' : null,
                item.can_read ? 'Read' : null,
                item.can_update ? 'Update' : null,
                item.can_delete ? 'Delete' : null
              ].filter(Boolean).join(', ')
            }</div>
          </div>
        </div>
      ))}
    </div>
  );
}
