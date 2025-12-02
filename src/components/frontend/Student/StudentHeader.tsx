//import React from 'react';

interface Props {
  name?: string;
}

export default function StudentHeader({ name = 'Student' }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {name}</h1>
          <p className="text-sm text-gray-600">Here's your learning dashboard</p>
        </div>
      </div>
    </div>
  );
}
