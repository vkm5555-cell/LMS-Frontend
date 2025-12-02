import React from "react";
import { useNavigate, useParams } from "react-router-dom";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function AssignModulePermissions({ onClose, type = "assign" }: { onClose: () => void; type?: "assign" | "edit" }) {
  const { id } = useParams();
  // If user_id is missing, show error and block form
  if (!id) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-lg font-bold mb-4 text-red-600">User ID not found in URL</h2>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={onClose}>Close</button>
      </div>
    );
  }
  const [modules, setModules] = React.useState<Array<{ id: string; name: string }>>([]);
  const [roles, setRoles] = React.useState<Array<{ id: number; name: string }>>([]);
  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [selectedModule, setSelectedModule] = React.useState<string>("");
  const [permissions, setPermissions] = React.useState<{ create: boolean; edit: boolean; read: boolean; delete: boolean }>({ create: false, edit: false, read: false, delete: false });
  const [message, setMessage] = React.useState<string>("");
  // const [loading, setLoading] = React.useState<boolean>(true); // Removed unused variable
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const navigate = useNavigate();

  React.useEffect(() => {
  const fetchModulesAndRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch modules
      const modulesRes = await fetch(`${apiBaseUrl}/modules`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const modulesData = await modulesRes.json();
      if (modulesData.success === false) {
        if (modulesData.error_code === 300) {
          setMessage(modulesData.message);
          navigate("/admin");
        }
        if (modulesData.error_code === 401) {
          navigate("/permission-denied");
        }
      } else {
        setModules(modulesData.data || []);
      }
      // Fetch user roles from /users/:id/roles
      if (id) {
        const userRolesRes = await fetch(`${apiBaseUrl}/users/${id}/roles`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const userRolesData = await userRolesRes.json();
        if (userRolesData.success && Array.isArray(userRolesData.roles)) {
          setRoles(userRolesData.roles.map((r: any) => ({
            id: Number(r.role_id),
            name: r.role_name
          })));
          // Preselect first role if available
          if (userRolesData.roles.length > 0) {
            setSelectedRole(String(userRolesData.roles[0].role_id));
          }
        } else {
          setRoles([]);
        }
      }
    } catch (error) {
      console.error("Error fetching modules/roles:", error);
      setMessage("Failed to load modules or roles.");
    } finally {
  // setLoading(false); // Removed unused setter
    }
  };
  fetchModulesAndRoles();
}, [navigate, id]);

  const [formErrors, setFormErrors] = React.useState<{ role?: string; module?: string; permissions?: string }>({});

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        onClick={onClose}
        aria-label="Close"
      >×</button>
      <h2 className="text-lg font-bold mb-4">
        {type === "edit" ? "Edit Current Module & Permissions" : "Assign Module & Permissions"}
      </h2>
      <form className="space-y-5" onSubmit={async (e) => {
        e.preventDefault();
        setFormErrors({});
        let errors: { role?: string; module?: string; permissions?: string } = {};
        if (!selectedRole) {
          errors.role = "User Role is required";
        }
        if (!selectedModule) {
          errors.module = "Select Module is required";
        }
        if (!permissions.create && !permissions.edit && !permissions.read && !permissions.delete) {
          errors.permissions = "At least one permission must be selected";
        }
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return;
        }
        setSubmitting(true);
        setMessage("");
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${apiBaseUrl}/users/assign-module-permissions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: id ? Number(id) : undefined,
              role_id: selectedRole ? Number(selectedRole) : undefined,
              module_id: selectedModule,
              permission_ids: [
                permissions.create ? 1 : 0,
                permissions.read ? 1 : 0,
                permissions.edit ? 1 : 0,
                permissions.delete ? 1 : 0
              ],
            }),
          });
          const data = await response.json();
          if (data.success) {
            setMessage("Module and permissions assigned successfully!");
            onClose();
          } else {
            setMessage(data.message || "Failed to assign module/permissions");
          }
        } catch (err: any) {
          setMessage(err.message || "Something went wrong");
        } finally {
          setSubmitting(false);
        }
      }}>
        <div>
          <label className="block text-sm font-medium mb-1">Select User Role</label>
          <select className="w-full rounded-lg border p-2" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {formErrors.role && <div className="text-red-600 text-xs mt-1">{formErrors.role}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Module</label>
          <select className="w-full rounded-lg border p-2" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
            <option value="">Select Module</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>{mod.name}</option>
            ))}
          </select>
          {formErrors.module && <div className="text-red-600 text-xs mt-1">{formErrors.module}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Permissions</label>
          <div className="flex gap-4">
            <label><input type="checkbox" checked={permissions.create} onChange={e => setPermissions(p => ({ ...p, create: e.target.checked }))} /> Create</label>
            <label><input type="checkbox" checked={permissions.edit} onChange={e => setPermissions(p => ({ ...p, edit: e.target.checked }))} /> Edit</label>
            <label><input type="checkbox" checked={permissions.read} onChange={e => setPermissions(p => ({ ...p, read: e.target.checked }))} /> Read</label>
            <label><input type="checkbox" checked={permissions.delete} onChange={e => setPermissions(p => ({ ...p, delete: e.target.checked }))} /> Delete</label>
          </div>
          {formErrors.permissions && <div className="text-red-600 text-xs mt-1">{formErrors.permissions}</div>}
        </div>
        <button type="submit" disabled={submitting} className={`px-4 py-2 rounded-lg w-full ${type === "edit" ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}>
          {submitting ? "Saving..." : type === "edit" ? "Save Changes" : "Assign"}
        </button>
        {message && <div className="mt-2 text-sm text-center text-red-600">{message}</div>}
      </form>
    </div>
  );
}
