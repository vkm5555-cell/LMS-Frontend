import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CourseTable from "../../components/tables/Course/CourseTable";
import { useNavigate } from "react-router-dom";

export default function List() {
  const navigate = useNavigate();
  return (
    <>
      <PageMeta
        title="BBD ED TECH LMS | Courses List"
        description="BBD ED TECH LMS - Courses List"
      />
     
      <PageBreadcrumb pageTitle="Courses List" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <span>Courses List</span>
              <button
                className="ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => navigate("/courses/add")}
              >
                Add Course
              </button>
            </div>
          }
        >
          {/* Table */}
          <CourseTable />
        </ComponentCard>
      </div>
    </>
  );
}
