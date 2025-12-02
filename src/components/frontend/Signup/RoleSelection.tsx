import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate, faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";

type RoleSelectionProps = {
  onNext: (role: string) => void;
  onBack?: () => void;
};

const RoleSelection: React.FC<RoleSelectionProps> = ({ onNext, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);

  const totalSteps = 4;

  const handleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleNext = () => {
    if (!selectedRole) {
      alert("Please select a role!");
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
    onNext(selectedRole);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex flex-col shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-700">BBDU</span>
          </div>
          <Link to="/exit" className="text-red-500 font-medium hover:underline">
            EXIT
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 text-center py-2">
          Step {currentStep} of {totalSteps}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="max-w-2xl w-full text-center p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-2xl" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Hello!</h1>
          <p className="text-gray-600 mb-8">
            Tell me a little about yourself so we can make the best recommendations.
            First, choose your role:
          </p>

          {/* Role Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Student */}
            <div
              onClick={() => handleSelect("Student")}
              className={`cursor-pointer border rounded-lg p-6 flex flex-col items-center transition ${
                selectedRole === "Student"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-3xl mb-4" />
              <p className="font-medium">I’m a Student</p>
            </div>

            {/* Instructor */}
            <div
              onClick={() => handleSelect("Instructor")}
              className={`cursor-pointer border rounded-lg p-6 flex flex-col items-center transition ${
                selectedRole === "Instructor"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 text-3xl mb-4" />
              <p className="font-medium">I’m an Instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="flex justify-between items-center px-6 py-4 bg-white shadow-md border-t">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg font-semibold ${
            currentStep === 1
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Next →
        </button>
      </footer>
    </div>
  );
};

export default RoleSelection;
