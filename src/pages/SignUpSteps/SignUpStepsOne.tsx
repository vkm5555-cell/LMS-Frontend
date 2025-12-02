import React from "react";
import { useNavigate  } from "react-router";
import RoleSelection from "../../components/frontend/Signup/RoleSelection";  

const SignUpStepsOne: React.FC = () => {
  const navigate = useNavigate();
  const handleRoleNext = (role: string) => {
    console.log("Selected role:", role);

    // Example: Navigate based on role
    if (role === "Student") {
      alert("Redirecting to Student setup...");
      navigate("/SignUpStepsTwo");
    } else if (role === "Instructor") {
      alert("Redirecting to Instructor setup...");
      navigate("/SignUpStepsTwo");
    }
  };

  return <RoleSelection onNext={handleRoleNext} />;
};

export default SignUpStepsOne;