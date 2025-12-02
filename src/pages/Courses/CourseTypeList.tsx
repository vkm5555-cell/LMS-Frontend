
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CourseList from "../../components/tables/Course/CourseList";

export default function CourseTypeList() {
 

  return (
    <>
      <PageMeta
        title="BBDU LMS | Courses List"
        description="BBDU LMS - Courses List"
      />
      <PageBreadcrumb pageTitle="Courses List" />
      <div className="space-y-6">
        <ComponentCard title="Courses List">
          <CourseList />
        </ComponentCard>
      </div>
    </>
  );
}
