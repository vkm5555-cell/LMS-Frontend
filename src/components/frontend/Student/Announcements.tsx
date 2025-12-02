import React from "react";

const Announcements: React.FC = () => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-8 transition-transform duration-150 hover:scale-105 hover:shadow-xl">
    <h2 className="font-bold text-gray-900 text-xl mb-4">Announcements</h2>
    <p className="text-gray-800 font-medium">New Course Materials Available</p>
    <p className="text-sm text-gray-600 mb-1">April 20, 2024</p>
    <p className="text-sm text-gray-700">Additional readings have been added for the Calculus course.</p>
  </div>
);

export default Announcements;
