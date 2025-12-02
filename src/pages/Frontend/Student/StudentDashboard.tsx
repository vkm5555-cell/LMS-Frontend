//import React from "react";
// import {
//   CalendarDays,
//   BookOpen,
//   ClipboardList,
//   GraduationCap,
// } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Navbar from "../../../components/common/frontend/Navbar";
import FrontFooter from "../../../components/common/frontend/FrontFooter";
import OverviewCards from "../../../components/frontend/Student/OverviewCards";
import MyCourses from "../../../components/frontend/Student/MyCourses";
import EnrolledCourses from "../../../components/frontend/Student/EnrolledCourses";
import Announcements from "../../../components/frontend/Student/Announcements";
import UpcomingEvents from "../../../components/frontend/Student/UpcomingEvents";
import Grades from "../../../components/frontend/Student/Grades";
import Certificates from "../../../components/frontend/Student/Certificates";

// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StudentDashboard() {
  // Sample data
  const courseworkData = [
    { subject: "Math", progress: 85 },
    { subject: "Science", progress: 75 },
    { subject: "English", progress: 60 },
    { subject: "History", progress: 70 },
  ];

  const courseProgressData = [
    { name: "Completed", value: 3 },
    { name: "Incomplete", value: 5 },
  ];

  const COLORS = ["#2563eb", "#eab308"];

  return (
    <>
      <PageMeta title="Student Dashboard" description="Overview for students" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 md:pt-5 mb-10">
        <PageBreadcrumb pageTitle="Student Dashboard" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Side: Overview Cards, My Courses, Announcements */}
          <div className="lg:col-span-2 space-y-6">
            <OverviewCards />
            <EnrolledCourses />
            <MyCourses />
            <Announcements />
          </div>

          {/* Right Side: Upcoming Events, Grades, Certificates */}
          <div className="space-y-6">
            <UpcomingEvents />
            <Grades />
            <Certificates />
          </div>
        </div>

        {/* --- Charts Section --- */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coursework Progress Chart */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Coursework Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseworkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Progress Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Course Progress
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={courseProgressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseProgressData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            {/* Progress Summary */}
            {/* <div className="mt-6 w-full flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">Completed: 40%</div>
              <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">You have completed 2 out of 5 courses.</div>
            </div> */}
          </div>
        </div>
      </div>

      <FrontFooter />
    </>
  );
}
