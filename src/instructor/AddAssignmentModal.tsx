import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  options: Option[];
  hint: string;
}

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAssignment: (courseId: string) => void;
  newAssignment: {
    title: string;
    questions: Question[];
    hints: string[];
    dueDate: string;
  };
  setNewAssignment: React.Dispatch<
    React.SetStateAction<{
      title: string;
      questions: Question[];
      hints: string[];
      dueDate: string;
    }>
  >;
  selectedCourse: string;
}

const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAddAssignment,
  newAssignment,
  setNewAssignment,
  selectedCourse,
}) => {
  const [adding, setAdding] = useState(false);

  if (!isOpen) return null; // Don't render if not open

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from closing the modal
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      options: [{ text: "", isCorrect: false }],
      hint: "",
    };
    setNewAssignment({
      ...newAssignment,
      questions: [...newAssignment.questions, newQuestion],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = newAssignment.questions.filter(
      (_, i) => i !== index
    );
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...newAssignment.questions];
    updatedQuestions[index].questionText = value;
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...newAssignment.questions];
    updatedQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...newAssignment.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...newAssignment.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  const handleCorrectOptionChange = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const updatedQuestions = [...newAssignment.questions];
    updatedQuestions[questionIndex].options.forEach((option, i) => {
      option.isCorrect = i === optionIndex; // Set the selected option as correct
    });
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  const handleHintChange = (index: number, value: string) => {
    const updatedQuestions = [...newAssignment.questions];
    updatedQuestions[index].hint = value;
    setNewAssignment({ ...newAssignment, questions: updatedQuestions });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]"
        onClick={handleModalClick}
      >
        <h2 className="text-2xl font-bold mb-4">Add Assignment</h2>
        <input
          type="text"
          value={newAssignment.title}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, title: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Title"
          required
        />

        {/* Questions Section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium">Questions</h3>
          {newAssignment.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-4">
              <input
                type="text"
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                placeholder={`Question ${questionIndex + 1}`}
                required
              />
              <input
                type="text"
                value={question.hint}
                onChange={(e) =>
                  handleHintChange(questionIndex, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                placeholder={`Hint for Question ${questionIndex + 1}`}
              />
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-2 mb-2"
                >
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(
                        questionIndex,
                        optionIndex,
                        e.target.value
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />
                  <input
                    type="radio"
                    checked={option.isCorrect}
                    onChange={() =>
                      handleCorrectOptionChange(questionIndex, optionIndex)
                    }
                  />
                  <span className="text-sm">Correct</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveOption(questionIndex, optionIndex)
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddOption(questionIndex)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </button>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(questionIndex)}
                className="text-red-600 hover:text-red-700 mt-2"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </button>
        </div>

        {/* Due Date Section */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            onChange={(e) =>
              setNewAssignment({ ...newAssignment, dueDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
          <input
            type="time"
            onChange={(e) =>
              setNewAssignment({ ...newAssignment, dueDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2"
            required
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAddAssignment(selectedCourse);
              setAdding(true); // Set adding state to true when clicked
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            disabled={newAssignment.questions.length === 0} // Disable if no questions
          >
            {adding ? "Adding..." : "Add Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssignmentModal;
