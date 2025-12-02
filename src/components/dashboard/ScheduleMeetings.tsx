import { useState } from "react";

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
}

export default function ScheduleMeetings() {
  const [meetings] = useState<Meeting[]>([
    { id: 1, title: "Sprint Planning", date: "April 17", time: "2:00 PM" },
    { id: 2, title: "Project Presentation", date: "April 20", time: "11:00 AM" },
    { id: 3, title: "Final Review", date: "April 25", time: "3:00 PM" },
  ]);

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white/90">
          Schedule meeting
        </h3>
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
            <p className="font-medium text-gray-800 dark:text-white">
              {meeting.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {meeting.date} • {meeting.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
