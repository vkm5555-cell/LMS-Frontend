import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function AddCourse() {
  return (
    <>
      <PageMeta
        title="BBDU LMS | Courses List"
        description="BBDU LMS - Courses List"
      />
      <PageBreadcrumb pageTitle="Courses List" />
      <div className="space-y-6">
        <ComponentCard title="Courses List">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
