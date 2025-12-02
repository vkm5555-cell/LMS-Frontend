import React from "react";

const Certificates: React.FC = () => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-transform duration-150 hover:scale-105 hover:shadow-xl">
    <h2 className="font-bold text-gray-900 text-xl mb-4">Certificates</h2>
    <ul className="text-sm space-y-3">
      <li className="flex items-center gap-3">
        <img src="/forntend/certificates_course/free-artificial-intelligence.jpg" alt="AI Certificate" className="w-12 h-12 rounded-lg border" />
        <div>
          <p className="font-semibold text-gray-900">Artificial Intelligence</p>
          <p className="text-xs text-gray-500">Issued: Sep 2025</p>
        </div>
      </li>
      <li className="flex items-center gap-3">
        <img src="/forntend/certificates_course/free-artificial-intelligence.jpg" alt="Marketing Certificate" className="w-12 h-12 rounded-lg border" />
        <div>
          <p className="font-semibold text-gray-900">Marketing Essentials</p>
          <p className="text-xs text-gray-500">Issued: Aug 2025</p>
        </div>
      </li>
    </ul>
  </div>
);

export default Certificates;
