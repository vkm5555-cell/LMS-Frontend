//import React from "react";

const certificates = [
  {
    title: "Machine Learning",
    provider: "DeepLearning.AI",
    type: "Specialization",
    img: "/forntend/certificates_course/1048877.png",
    badge: "Free Trial",
  },
  {
    title: "Google Data Analytics",
    provider: "Google",
    type: "Professional Certificate",
    img: "/forntend/certificates_course/free-artificial-intelligence.jpg",
    badge: "Free Trial · AI skills",
  },
  {
    title: "IBM Generative AI Engineering",
    provider: "IBM",
    type: "Professional Certificate",
    img: "/forntend/certificates_course/1048877.png",
    badge: "Free Trial",
  },
  {
    title: "Deep Learning",
    provider: "DeepLearning.AI",
    type: "Specialization",
    img: "/forntend/certificates_course/free-artificial-intelligence.jpg",
    badge: "Free Trial",
  },
];

const PopularCertificates = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Heading */}
        <h2 className="text-2xl font-bold mb-2">Most Popular Certificates</h2>
        <p className="text-gray-600 mb-6">
          Explore our most popular programs, get job-ready for an in-demand career.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <img
                src={cert.img}
                alt={cert.title}
                className="rounded-t-2xl h-36 w-full object-cover"
              />
              <div className="p-4">
                <span className="text-xs text-blue-600 font-semibold">
                  {cert.provider}
                </span>
                <h3 className="text-lg font-semibold mt-1">{cert.title}</h3>
                <p className="text-sm text-gray-500">{cert.type}</p>
                {cert.badge && (
                  <span className="mt-2 inline-block bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-600">
                    {cert.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Show 8 more
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">
            View all
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularCertificates;
