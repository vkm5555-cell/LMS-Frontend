import EditCourse from "../../../components/courses/EditCourse";
import PageMeta from "../../../components/common/PageMeta";

export default function EditCoursePage() {
  return (
    <>
      <PageMeta title="Admin | Edit Course" description="Edit an existing course in the admin panel." />
      <EditCourse />
    </>
  );
}