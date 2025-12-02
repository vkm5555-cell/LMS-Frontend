//import React from "react";

const trendingCourses = [
  {
    title: "Machine Learning",
    provider: "DeepLearning.AI",
    type: "Specialization",
    img: "/forntend/newonbbdu/google-ai.png",
    badge: "Free Trial",
  },
  {
    title: "Google AI Essentials",
    provider: "Google",
    type: "Specialization",
    img: "/forntend/newonbbdu/google-ai.png",
    badge: "Free Trial",
  },
  {
    title: "Microsoft Power BI Data Analyst",
    provider: "Microsoft",
    type: "Professional Certificate",
    img: "/forntend/newonbbdu/google-ai.png",
    badge: "Free Trial",
    extraBadge: "AI Skills",
    extra: "Build toward a degree",
  },
  {
    title: "Deep Learning",
    provider: "DeepLearning.AI",
    type: "Specialization",
    img: "/forntend/newonbbdu/google-ai.png",
    badge: "Free Trial",
    extra: "Build toward a degree",
  },
];

const TrendingNow = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Headings */}
        <h2 className="text-lg font-semibold text-gray-700">Trending Now</h2>
        <h3 className="text-3xl font-bold mt-1 mb-2">Explore what's growing in popularity</h3>
        <p className="text-gray-600 mb-8">
          Discover the courses and programs that learners are enrolling in the most right now.
        </p>

        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white border rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-105 relative"
            >
              <img
                src={course.img}
                alt={course.title}
                className="rounded-t-2xl h-36 w-full object-cover"
              />
              {course.badge && (
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                  {course.badge}
                </span>
              )}
              {course.extraBadge && (
                <span className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-md">
                  {course.extraBadge}
                </span>
              )}
              <div className="p-4">
                <span className="text-xs text-gray-500 font-medium">{course.provider}</span>
                <h3 className="text-base font-semibold mt-1">{course.title}</h3>
                {course.extra && (
                  <p className="text-sm text-blue-600 font-medium mt-1 mb-1">
                    📘 {course.extra}
                  </p>
                )}
                <p className="text-sm text-gray-500">{course.type}</p>
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

export default TrendingNow;
