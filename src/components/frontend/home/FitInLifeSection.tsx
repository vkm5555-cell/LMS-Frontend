//import React from "react";

const degreePrograms = [
  {
    title: "Executive MBA",
    provider: "Babu Banarasi Das University",
    img: "/images/logo/bbdu-logo.gif",
    type: "Degree",
  },
  {
    title: "MBA in Business Analytics",
    provider: "Babu Banarasi Das University",
    img: "/images/logo/bbdu-logo.gif",
    type: "Degree",
  },
  {
    title: "Bachelor of Science in Computer Science",
    provider: "Babu Banarasi Das University",
    img: "/images/logo/bbdu-logo.gif",
    type: "Degree",
  },
  {
    title: "Bachelor of Science in Data Science & AI",
    provider: "Babu Banarasi Das University",
    img: "/images/logo/bbdu-logo.gif",
    type: "Degree",
  },
];

const FitInLifeSection = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-700">Degree Programs</h2>
        <h3 className="text-3xl font-bold mt-1 mb-2">
          Find a top degree that fits your life
        </h3>
        <p className="text-gray-600 mb-8">
          Breakthrough pricing on 100% online degrees from top universities.
        </p>

        {/* Degree Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {degreePrograms.map((degree, index) => (
            <div
              key={index}
              className="bg-white border rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <img
                src={degree.img}
                alt={degree.title}
                style={{ width: '145px' }}
                className="rounded-t-2xl h-36 object-cover mx-auto"
                />
              <div className="p-4">
                <span className="text-xs text-gray-500 font-medium">{degree.provider}</span>
                <h3 className="text-base font-semibold mt-1">{degree.title}</h3>
                <p className="text-sm text-blue-600 font-medium mt-1">🎓 Earn a degree</p>
                <p className="text-sm text-gray-500">{degree.type}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            Show 8 more
          </button>
          <button className="border border-gray-400 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-5 py-2 rounded-lg">
            View all →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FitInLifeSection;
