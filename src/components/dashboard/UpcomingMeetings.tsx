export default function UpcomingMeetings() {
  const meetings = [
    {
      id: 1,
      title: "April 17",
      time: "2:00 – 3:00 PM",
      action: "Schedule meeting",
      img: "https://i.pravatar.cc/40?img=1",
    },
    {
      id: 2,
      title: "Project Presentation",
      time: "11:00 AM – 12:00 PM",
      ago: "4h ago",
      img: "https://i.pravatar.cc/40?img=2",
    },
  ];

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-800">
      <h3 className="font-semibold text-gray-800 mb-4 dark:text-white/90">
        Upcoming Meetings
      </h3>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="flex items-center justify-between">
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-3">
              <img
                src={meeting.img}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {meeting.title}
                </p>
                <p className="text-sm text-gray-500">{meeting.time}</p>
              </div>
            </div>

            {/* Right: Button or Ago */}
            {meeting.action ? (
              <button className="text-blue-500 text-sm hover:underline">
                {meeting.action}
              </button>
            ) : (
              <span className="text-sm text-gray-500">{meeting.ago}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
