import { useState } from "react";

interface Activity {
  id: number;
  user: string;
  action: string;
  avatar: string;
}

export default function ActivityFeed() {
  const [activities] = useState<Activity[]>([
    {
      id: 1,
      user: "Emily Willson",
      action: "commented on Prototype Design",
      avatar: "https://i.pravatar.cc/40?img=1",
    },
    {
      id: 2,
      user: "Sophia Johnson",
      action: "started a new discussion on Cure",
      avatar: "https://i.pravatar.cc/40?img=2",
    },
  ]);

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm dark:bg-gray-800">
      <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
        Activity Feed
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3">
            <img
              src={activity.avatar}
              alt={activity.user}
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{activity.user}</span>{" "}
              {activity.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
