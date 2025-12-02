import React from "react";

const courses = [
  { title: "Introduction to Computer Science", desc: "Distance Education", img: "/forntend/certificates_course/free-artificial-intelligence.jpg" },
  { title: "English Literature", desc: "Distance Education", img: "/forntend/certificates_course/free-artificial-intelligence.jpg" },
  { title: "Principles of Marketing", desc: "Distance Education", img: "/forntend/certificates_course/free-artificial-intelligence.jpg" },
];

const MyCourses: React.FC = () => (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg transition-transform duration-150 hover:scale-105 hover:shadow-xl border border-gray-100">
          <img
            src={course.img}
            alt={course.title}
            className="rounded-t-3xl h-40 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{course.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default MyCourses;
