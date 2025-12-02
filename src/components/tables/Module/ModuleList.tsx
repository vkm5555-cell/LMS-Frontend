//import React from "react";

// Example data for modules
const modules = [
  { id: 1, name: "Module 1", description: "Description for Module 1" },
  { id: 2, name: "Module 2", description: "Description for Module 2" },
  { id: 3, name: "Module 3", description: "Description for Module 3" },
];

export default function ModuleList() {
  return (
    <table className="min-w-full border border-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 border">ID</th>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Description</th>
        </tr>
      </thead>
      <tbody>
        {modules.map((module) => (
          <tr key={module.id}>
            <td className="px-4 py-2 border">{module.id}</td>
            <td className="px-4 py-2 border">{module.name}</td>
            <td className="px-4 py-2 border">{module.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
