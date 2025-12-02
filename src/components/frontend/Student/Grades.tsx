import React from "react";

const Grades: React.FC = () => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-transform duration-150 hover:scale-105 hover:shadow-xl">
    <h2 className="font-bold text-gray-900 text-xl mb-4">Grades</h2>
    <ul className="text-sm space-y-2">
      <li className="flex justify-between"><span>Computer Science</span><span>A−</span></li>
      <li className="flex justify-between"><span>English Literature</span><span>B+</span></li>
      <li className="flex justify-between"><span>Marketing</span><span>B</span></li>
      <li className="flex justify-between"><span>Calculus</span><span>B+</span></li>
    </ul>
  </div>
);

export default Grades;
