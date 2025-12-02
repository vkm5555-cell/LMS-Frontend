import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";

type SkillSelectionProps = {
  onNext: (skills: string[]) => void; // multiple skills
  onBack?: () => void;
};

const SkillSelection: React.FC<SkillSelectionProps> = ({ onNext, onBack }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(3);
  const totalSteps = 4;
  const navigate = useNavigate();

  const skills = [
    "Account Management",
    "Business Development",
    "Sales Skills",
    "Leadership",
    "Manager Training",
    "Project Management",
    "Business Fundamentals",
    "Business Strategy",
    "Human Resources",
  ];

  const handleSelect = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill) // unselect if already selected
        : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (selectedSkills.length === 0) {
      alert("Please select at least one skill!");
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
    onNext(selectedSkills);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      navigate("/SignUpStepsOne");
    }
    if (onBack) onBack();
  };

  const filteredSkills = skills.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex flex-col shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <span className="text-xl font-bold text-blue-700">BBDU</span>
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
          <h1 className="text-2xl font-bold mb-2">
            What skills are you interested in?
          </h1>
          <p className="text-gray-600 mb-6">
            Choose a few to start with. You can change or add more later.
          </p>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search for a skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-md px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Skill Options */}
          <div className="flex flex-wrap gap-3 justify-center">
            {filteredSkills.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                  selectedSkills.includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {selectedSkills.includes(s) ? s : `+ ${s}`}
              </button>
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

export default SkillSelection;
