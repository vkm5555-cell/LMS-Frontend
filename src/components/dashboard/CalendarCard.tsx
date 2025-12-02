import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarCard() {
  const [value, setValue] = useState<Value>(new Date());

  // Example booked events (replace with API data)
  const bookedEvents = [
    { date: new Date(2025, 7, 29), type: "Assignment" },
    { date: new Date(2025, 7, 30), type: "Group Presentation" },
  ];

  const handleChange = (newValue: Value) => {
    setValue(newValue);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getEventForDate = (date: Date) =>
    bookedEvents.find((event) => isSameDay(event.date, date));

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white/90">
          Calendar
        </h3>
        <a
          href="#"
          className="text-sm font-medium text-blue-500 hover:underline"
        >
          View calendar
        </a>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE: Calendar + Events */}
        <div>
          <Calendar
            onChange={handleChange}
            value={value}
            tileContent={({ date }) => {
              const event = getEventForDate(date);
              return event ? (
                <div className="flex items-center justify-center w-7 h-7 mx-auto text-sm font-bold text-white bg-blue-600 rounded-full">
                  B
                </div>
              ) : null;
            }}
            tileClassName={({ date }) =>
              getEventForDate(date) ? "hide-default-date" : ""
            }
          />

          {/* Legend Section Below Calendar */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Assignment
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Group Presentation
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Appu + Recent Courses */}
        <div className="space-y-6">
          {/* Appu Section */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appu
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Assignment
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Group Presentation
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                Assignment
              </div>
            </div>
          </div>

          {/* Recent Courses Section */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recent Courses
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-3 bg-blue-500 rounded"></span>
                    UI Design Basics
                  </span>
                  <span className="text-gray-500">92%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-1">
                  <div className="w-[92%] h-2 bg-blue-500 rounded"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-3 bg-yellow-400 rounded"></span>
                    Data Management
                  </span>
                  <span className="text-gray-500">58%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-1">
                  <div className="w-[58%] h-2 bg-yellow-400 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
