import { useNavigate } from "react-router";
// import PageBreadcrumb from "../../components/common/PageBreadCrumb"; // Removed unused import
import PageMeta from "../../components/common/PageMeta";

export default function PermissionDenied() {
  const navigate = useNavigate();

  return (
  <div className="min-h-screen flex items-start justify-center bg-white dark:bg-gray-900 pt-12">
      <PageMeta
        title="403 Permission Denied | BBD ED LMS"
        description="You are not authorized to access this page in BBD ED LMS"
      />
      <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 px-6 py-8 flex flex-col items-center w-full max-w-sm">
        <h1 className="text-6xl font-bold text-red-600 mb-2">403</h1>
        <h3 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">Permission Denied</h3>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-6 text-center">
          You are not authorized to view this page.<br />Please contact the administrator if you believe this is a mistake.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
