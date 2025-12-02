
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import ModuleListTable from "../../../components/tables/Module/ModuleListTable";

export default function ModuleList() {
 

  return (
    <>
      <PageMeta
        title="BBD ED LMS | Role List"
        description="BBD ED LMS - Role List"
      />
      <PageBreadcrumb pageTitle="Role List" />
      <div className="space-y-6">
        <ComponentCard title="Role List">
          <ModuleListTable />
        </ComponentCard>
      </div>
    </>
  );
}
