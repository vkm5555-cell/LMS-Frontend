// React import not required with newer JSX runtime
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import QuickQuizCreateForm from '../../../components/courses/chapter/QuickQuizCreateForm';

export default function QuickQuizCreate() {
  return (
    <>
      <PageMeta title="Create Quick Quiz" description="Create a short, inline quick quiz" />
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <PageBreadcrumb pageTitle="Create Quick Quiz" />
        <div className="grid grid-cols-1 gap-6">
          <ComponentCard title="New Quick Quiz">
            <QuickQuizCreateForm onCreated={(res) => { console.debug('QuickQuiz created', res); }} />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
