import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import { useNavigate } from 'react-router-dom';
import QuickQuizListComponent from '../../../components/courses/chapter/QuickQuizListComponent';

export default function QuickQuizList() {
  const navigate = useNavigate();
  return (
    <>
      <PageMeta title="Admin | Quick Quizzes" description="List of quick quizzes" />
      <PageBreadcrumb pageTitle="Quick Quizzes" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <span>Quick Quizzes</span>
              <button className="ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={() => navigate('/quick-quiz/add')}>Add Quick Quiz</button>
            </div>
          }
        >
          <QuickQuizListComponent />
        </ComponentCard>
      </div>
    </>
  );
}
