//import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardCards() {
  // Doughnut Chart Data
  const data = {
    datasets: [
      {
        data: [75, 25], // 75% completed, 25% remaining
        backgroundColor: ["#10B981", "#E5E7EB"], // emerald & gray
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ========== Card 1: Course Overview ========== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Course Overview</h3>
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
            View courses
          </a>
        </div>

        <div className="flex items-center gap-6">
          {/* Doughnut Chart */}
          <div className="relative w-24 h-24">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-800">75%</span>
            </div>
          </div>

          {/* Metrics List */}
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-semibold">2</span>
              <span>Active Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-semibold">2</span>
              <span>Due Assignments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">5</span>
              <span>New Discussions</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Card 2: Progress & Budget ========== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress & Budget</h3>

        {/* Course Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Course Progress</span>
            <span className="font-medium">64%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "64%" }}
            />
          </div>
        </div>

        {/* Budget Usage */}
        <div>
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Budget Usage</span>
            <span className="font-medium">37%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: "37%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
