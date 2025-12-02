
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import RoleList from "../../../components/tables/Role/RoleList";

export default function RolesList() {
 

  return (
    <>
      <PageMeta
        title="BBD ED LMS | Role List"
        description="BBD ED LMS - Role List"
      />
      <PageBreadcrumb pageTitle="Role List" />
      <div className="space-y-6">
        <ComponentCard title="Role List">
          <RoleList />
        </ComponentCard>
      </div>
    </>
  );
}
