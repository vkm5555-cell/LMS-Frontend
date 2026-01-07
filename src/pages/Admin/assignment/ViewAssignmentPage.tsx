import React from 'react';
import { useParams } from 'react-router-dom';
import ViewAssignment from '../../../components/assignment/ViewAssignment';

const ViewAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">View Assignment</h1>
      {/* Pass id if the component accepts it; otherwise the component can fetch internally */}
      <ViewAssignment assignmentId={id} />
    </div>
  );
};

export default ViewAssignmentPage;