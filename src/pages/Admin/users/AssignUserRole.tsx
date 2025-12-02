import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function AssignUserRole() {
  const { id } = useParams<{ id: string }>();
  const [roles, setRoles] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  // const [permissions, setPermissions] = useState<string[]>([]);
  const [users, setUsers] = useState<{id:number, name:string}[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  // const [selectedPermission, setSelectedPermission] = useState("");
  const [crud, setCrud] = useState<{create:boolean, edit:boolean, read:boolean, delete:boolean}>({create:false, edit:false, read:false, delete:false});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/roles`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setRoles(data.data.map((r: any) => r.name));
        } else {
          setRoles(["student", "teacher", "Admin"]);
        }
      } catch {
        setRoles(["student", "teacher", "Admin"]);
      }
    };
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/modules`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setModules(data.data.map((m: any) => m.name));
        }
      } catch {}
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/users?page=1&page_size=100`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data.map((u: any) => ({ id: u.id, name: u.name || u.username })));
        }
      } catch {}
    };
    fetchRoles();
    fetchModules();
  // fetchPermissions();
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/users/${selectedUser || id}/assign-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: selectedRole,
          module: selectedModule,
          // permission: selectedPermission,
          crud,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Role, module, permission & CRUD assigned successfully!");
        setTimeout(() => navigate("/users"), 1000);
      } else {
        setMessage(data.message || "Failed to assign role/module/permission");
      }
    } catch {
      setMessage("Error assigning role/module/permission.");
    }
  };

  return (
    <>
      <PageMeta title="Assign User Role" description="Assign a role to user" />
      <PageBreadcrumb pageTitle="Assign User Role" />
      <div className="space-y-6">
        <ComponentCard title="Assign Role">
          {message && (
            <p className={`mt-3 text-sm ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Select User</label>
              <select
                name="user"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border p-2"
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Role</label>
              <select
                name="role"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full rounded-lg border p-2"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Module</label>
              <select
                name="module"
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value)}
                className="w-full rounded-lg border p-2"
                required
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module} value={module}>{module.charAt(0).toUpperCase() + module.slice(1)}</option>
                ))}
              </select>
            </div>
            {/* Select Permission removed as requested */}
            <div>
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <div className="flex gap-4">
                <label><input type="checkbox" checked={crud.create} onChange={e => setCrud(c => ({...c, create: e.target.checked}))}/> Create</label>
                <label><input type="checkbox" checked={crud.edit} onChange={e => setCrud(c => ({...c, edit: e.target.checked}))}/> Edit</label>
                <label><input type="checkbox" checked={crud.read} onChange={e => setCrud(c => ({...c, read: e.target.checked}))}/> Read</label>
                <label><input type="checkbox" checked={crud.delete} onChange={e => setCrud(c => ({...c, delete: e.target.checked}))}/> Delete</label>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Assign Module Permission
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
