//import React from 'react';

export default function StudentOverview() {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="font-semibold mb-2">Overview</h3>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>Enrolled courses: <strong>3</strong></li>
        <li>Completed: <strong>1</strong></li>
        <li>Progress: <strong>34%</strong></li>
      </ul>
    </div>
  );
}
