import React, { useState } from "react";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  hint: string;
  options: Option[];
}

interface Assignment {
  id: string;
  title: string;
  questions: Question[];
}

interface AssignmentViewProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  onSubmit: (assignmentId: string, score: number) => void;
}

const AssignmentView: React.FC<AssignmentViewProps> = ({
  isOpen,
  onClose,
  assignment,
  onSubmit,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>(
    Array(assignment.questions.length).fill(null)
  ); // State to track selected options for each question
  const [submitted, setSubmitted] = useState(false); // State to track submission status
  const [result, setResult] = useState<number | null>(null); // State to track the result

  if (!isOpen) return null; // Don't render if not open

  const handleOptionChange = (questionIndex: number, optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex; // Update the selected option for the specific question
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = () => {
    if (selectedOptions.every(option => option !== null)) {
        // Calculate the result
        const correctAnswers = selectedOptions.reduce((count, selectedIndex, index) => {
            return count + (assignment.questions[index].options[selectedIndex].isCorrect ? 1 : 0);
        }, 0);
        const totalQuestions = assignment.questions.length;
        const score = (correctAnswers / totalQuestions) * 100; // Calculate percentage

        setResult(score); // Set the result
        setSubmitted(true); // Update submission status

        // Call the onSubmit function passed from Assignments.tsx
        onSubmit(assignment.id, score); // Pass the assignment ID and score
    } else {
        alert("Please select an option for each question before submitting.");
    }
  };

  // Determine the result color based on the score
  const resultColor = result !== null ? (result >= 75 ? "text-green-600" : result >= 50 ? "text-yellow-600" : "text-red-600") : "";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal
      >
        <h2 className="text-2xl font-bold mb-4">{assignment.title}</h2>
        {assignment.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-4">
            <div className="flex items-center">
              <span className="flex-1">{question.questionText}</span>
            </div>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${questionIndex}`} // Unique name for each question
                  value={optionIndex}
                  checked={selectedOptions[questionIndex] === optionIndex} // Check if this option is selected
                  onChange={() =>
                    handleOptionChange(questionIndex, optionIndex)
                  } // Update selected option for this question
                />
                <label className="ml-2">{option.text}</label>
              </div>
            ))}
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Submit Assignment
        </button>
        <button
          onClick={onClose}
          className="mt-2 bg-gray-300 px-4 py-2 rounded"
        >
          Close
        </button>
        {submitted && result !== null && (
          <div className={`mt-4 ${resultColor}`}>
            <h3 className="font-bold">Submitted</h3>
            <p>Result: {result.toFixed(2)}%</p> {/* Display the result */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentView;
