//import React from 'react';

export default function StudentCourses() {
  const dummy = [{ id: 1, title: 'Intro to React' }, { id: 2, title: 'Advanced JS' }];
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="font-semibold mb-2">Your Courses</h3>
      <div className="space-y-2">
        {dummy.map((c) => (
          <div key={c.id} className="p-3 border rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">Progress: 20%</div>
              </div>
              <div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Open</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
