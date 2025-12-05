import CreateAssignment from "../../../components/assignment/CreateAssignment";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

export default function CreateAssignmentPage() {
  return (
    <>
      <PageMeta title="Admin | Create Assignment" description="Create a new assignment" />
      <PageBreadcrumb pageTitle="Create Assignment" />
      <div className="space-y-6">
        <CreateAssignment />
      </div>
    </>
  );
}
