// Make sure the path is correct and the file exists
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import AdminCourseTable from "../../../components/admin/courses/AdminCourseTable";

export default function AdminCourseList() {
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
              
            </div>
          }
        >
        <AdminCourseTable />
        </ComponentCard>
      </div>
    </>
  );
}
