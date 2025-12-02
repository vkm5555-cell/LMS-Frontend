//import React from "react";

const degrees = [
  {
    university: "University of BBDU",
    title: "Master of Science in Electrical and Computer Engineering",
    img: "/forntend/newonbbdu/google-ai.png",
  },
  {
    university: "University of BBDU",
    title: "Master of Business Administration (iMBA)",
    img: "/forntend/newonbbdu/google-ai.png",
  },
  {
    university: "University of BBDU",
    title: "Master of Engineering in Engineering Management",
    img: "/forntend/newonbbdu/google-ai.png",
  },
  {
    university: "University of BBDU",
    title: "Master of Science in Computer Science",
    img: "/forntend/newonbbdu/google-ai.png",
  }, 
];

const DegreePrograms = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-700">Degree Programs</h2>
        <h3 className="text-3xl font-bold mt-1 mb-2">Get a head start on a degree today</h3>
        <p className="text-gray-600 mb-8">
          With these programs, you can build valuable skills, earn career credentials, and make progress toward a degree before you even enroll.
        </p>

        {/* Degree Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {degrees.map((degree, index) => (
            <div
              key={index}
              className="bg-white border rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <img
                src={degree.img}
                alt={degree.title}
                className="rounded-t-2xl h-36 w-full object-cover"
              />
              <div className="p-4">
                <span className="text-xs text-gray-500 font-medium">
                  {degree.university}
                </span>
                <h3 className="text-base font-semibold mt-1">{degree.title}</h3>
                <p className="text-sm text-blue-600 mt-2 font-medium">🎓 Earn a degree</p>
                <p className="text-sm text-gray-500">Degree</p>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
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

export default DegreePrograms;
