import React, { useState } from "react";
import { useNavigate  } from "react-router";
import { Link } from "react-router";

type FieldSelectionProps = {
  onNext: (field: string) => void;
  onBack?: () => void;
};

const FieldSelection: React.FC<FieldSelectionProps> = ({ onNext, onBack }) => {
  const [selectedField, setSelectedField] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(2); // since RoleSelection is step 1
  const totalSteps = 4;
  const navigate = useNavigate();
  const fields = [
    "Software Development",
    "Data & Analytics",
    "Information Technology",
    "Marketing",
    "Design",
    "Finance & Accounting",
    "Product & Project Management",
    "Business Operations",
    "Sales & Business Development",
    "Human Resources",
    "Education & Training",
    "Customer Support",
    "Health & Wellness",
    "Writing",
    "Legal",
    "Art",
    "None of the above",
  ];

  const handleNext = () => {
    if (!selectedField) {
      alert("Please select a field!");
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
    onNext(selectedField);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      navigate("/SignUpStepsOne");
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
        <div className="max-w-3xl w-full text-center p-6">
          <h1 className="text-2xl font-bold mb-2">
            What field are you learning for?
          </h1>
          <p className="text-gray-600 mb-8">
            Select the area that best matches your interests or career path.
          </p>

          {/* Field Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {fields.map((f) => (
              <div
                key={f}
                onClick={() => setSelectedField(f)}
                className={`flex items-center border rounded-lg px-4 py-3 cursor-pointer transition ${
                  selectedField === f
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name="field"
                  value={f}
                  checked={selectedField === f}
                  onChange={() => setSelectedField(f)}
                  className="mr-3"
                />
                {f}
              </div>
            ))}
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

export default FieldSelection;
