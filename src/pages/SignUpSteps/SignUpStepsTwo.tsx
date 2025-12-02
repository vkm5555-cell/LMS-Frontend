import React from "react";
import { useNavigate  } from "react-router";
import FieldSelection from "../../components/frontend/Signup/FieldSelection";  

const SignUpStepsTwo: React.FC = () => {
  const navigate = useNavigate();
  const handleRoleNext = (skill: string) => {
    console.log("Selected role:", skill);

    if (skill.length === 0) {
      alert("Please select at least one skill!");
      return;
    }else{
       navigate("/SignUpStepsThree");
    }

  };

  return <FieldSelection onNext={handleRoleNext} />;
};

export default SignUpStepsTwo;