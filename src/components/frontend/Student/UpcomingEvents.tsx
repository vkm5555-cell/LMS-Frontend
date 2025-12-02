import React from "react";
import { CalendarDays } from "lucide-react";

const UpcomingEvents: React.FC = () => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-transform duration-150 hover:scale-105 hover:shadow-xl">
    <h2 className="font-bold text-gray-900 text-xl mb-4">Upcoming Events</h2>
    <ul className="space-y-3 text-sm">
      <li className="flex items-start gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium">Live Session: English Literature</p>
          <p className="text-gray-500">April 25, 2024</p>
        </div>
      </li>
      <li className="flex items-start gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium">Assignment 2 Due: Principles of Marketing</p>
          <p className="text-gray-500">April 27, 2024</p>
        </div>
      </li>
    </ul>
  </div>
);

export default UpcomingEvents;
