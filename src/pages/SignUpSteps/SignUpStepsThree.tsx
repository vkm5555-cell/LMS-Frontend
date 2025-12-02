import React from "react";
import { useNavigate } from "react-router";
import SkillSelection from "../../components/frontend/Signup/SkillSelection";  

const SignUpStepsThree: React.FC = () => {
  const navigate = useNavigate();

  const handleSkillNext = (skills: string[]) => {
    console.log("Selected skills:", skills);

    // Example: Navigate after selecting skills
    if (skills.includes("Leadership")) {
      alert("You selected Leadership! Redirecting...");
      navigate("/SignUpStepsTwo");
    } else {
      alert("Redirecting to setup...");
      navigate("/SignUpStepsTwo");
    }
  };

  return <SkillSelection onNext={handleSkillNext} />;
};

export default SignUpStepsThree;
