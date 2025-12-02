import React from "react";

interface UserTableProps {
  users: Array<{
    id: number;
    name: string;
    email: string;
    role?: string;
    [key: string]: any;
  }>;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                {onEdit && (
                  <button className="btn btn-sm btn-primary" onClick={() => onEdit(user.id)}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(user.id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
