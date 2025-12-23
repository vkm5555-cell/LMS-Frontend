import { useParams, useNavigate } from 'react-router-dom';
import QuickQuizForm from '../../../components/courses/chapter/QuickQuizForm';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';

export default function QuickQuizEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';

  return (
    <>
      <PageMeta title="Edit Quick Quiz" description="Edit an existing quick quiz" />
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <PageBreadcrumb pageTitle="Edit Quick Quiz" />
        <div className="grid grid-cols-1 gap-6">
          <ComponentCard title="Edit Quick Quiz">
            <QuickQuizForm
              editId={id}
              method="PUT"
              submitEndpoint={id ? `${apiBase}/quick-quiz/${id}` : undefined}
              onSaved={() => navigate('/quick-quiz')}
              onError={() => { /* page-level error handling can be added if needed */ }}
              submitLabel="Save Changes"
            />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
