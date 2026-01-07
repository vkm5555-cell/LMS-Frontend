import React from 'react';
import { useParams } from 'react-router-dom';
import AssignAssignment from '../../../components/assignment/AssignAssignment';

const AssignAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Assign Assignment</h1>

      {/* Pass id if the component accepts it; otherwise it can fetch internally */}
      <AssignAssignment assignmentId={id} />
    </div>
  );
};

export default AssignAssignmentPage;
