import CourseOverviewCard from "../../components/dashboard/CourseOverviewCard";
import CalendarCard from "../../components/dashboard/CalendarCard";
import UpcomingMeetings from "../../components/dashboard/UpcomingMeetings";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import ScheduleMeetings from "../../components/dashboard/ScheduleMeetings";
import PageMeta from "../../components/common/PageMeta";  

export default function Home() {
  return (
    <>
      <PageMeta
        title="BBDU LMS | BBDU University in Lucknow"
        description="Best Private University in Lucknow – BBDU. Offering career-focused UG &amp; PG programs, world-class campus, and vibrant student life. Admissions Open – Apply Now!"
      />
  <div className="min-h-screen py-8 px-2 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-7">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-indigo-700 mb-2 drop-shadow">LMS Dashboard</h2>
              <p className="text-lg text-gray-700">Welcome to your learning management dashboard. Track courses, meetings, and activities in style!</p>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl shadow-lg bg-gradient-to-r from-indigo-200 via-purple-100 to-pink-100 p-4">
                <CourseOverviewCard/>
              </div>
              <div className="rounded-xl shadow-lg bg-gradient-to-r from-pink-200 via-yellow-100 to-indigo-100 p-4">
                <CalendarCard />
              </div>
            </div>
          </div>
          <div className="col-span-12 xl:col-span-5">
            <div className="rounded-xl shadow-lg bg-gradient-to-r from-green-200 via-blue-100 to-yellow-100 p-4 mb-6">
              <ScheduleMeetings />
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12 md:col-span-6">
              <div className="rounded-xl shadow-lg bg-gradient-to-r from-yellow-200 via-pink-100 to-indigo-100 p-4">
                <UpcomingMeetings />
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="rounded-xl shadow-lg bg-gradient-to-r from-indigo-200 via-green-100 to-pink-100 p-4">
                <ActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
