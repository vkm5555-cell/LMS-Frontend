import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import AssignmentTable from "../../../components/admin/assignments/AssignmentTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { useNavigate } from "react-router-dom";

export default function ListAssignmentsPage() {
  const navigate = useNavigate();
  return (
    <>
      <PageMeta title="Admin | Assignments" description="List of assignments" />
      <PageBreadcrumb pageTitle="Assignments" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <span>Assignments</span>
              <button
                className="ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => navigate('/Assignment/add')}
              >
                Add Assignment
              </button>
            </div>
          }
        >
          <AssignmentTable />
        </ComponentCard>
      </div>
    </>
  );
}
