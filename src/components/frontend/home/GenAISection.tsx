//import React from "react";

const genAIPrograms = [
  {
    title: "Claude Code: Software Engineering with Generative AI Agents",
    provider: "Vanderbilt University",
    type: "Course",
    img: "/forntend/certificates_course/free-artificial-intelligence.jpg",
    badge: "Free Trial",
  },
  {
    title: "Vibe Coding Essentials - Build Apps with AI",
    provider: "Scrimba",
    type: "Specialization",
    img: "/forntend/certificates_course/free-artificial-intelligence.jpg",
    badge: "Free Trial",
  },
  {
    title: "AWS Generative AI for Developers",
    provider: "Amazon Web Services",
    type: "Professional Certificate",
    img: "/forntend/certificates_course/free-artificial-intelligence.jpg",
    badge: "Free Trial",
  },
];

const GenAISection = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Heading and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Get started with GenAI</h2>
            <p className="text-gray-600 mb-6">
              Identify, develop, and execute impactful GenAI business strategies.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              View all GenAI
            </button>
          </div>

          {/* Right Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genAIPrograms.map((program, index) => (
              <div
                key={index}
                className="bg-white border rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-105"
              >
                <img
                  src={program.img}
                  alt={program.title}
                  className="rounded-t-2xl h-36 w-full object-cover"
                />
                <div className="p-4">
                  <span className="text-xs text-gray-500 font-medium">
                    {program.provider}
                  </span>
                  <h3 className="text-lg font-semibold mt-1">{program.title}</h3>
                  <p className="text-sm text-gray-500">{program.type}</p>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenAISection;
