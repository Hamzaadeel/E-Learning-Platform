import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  options: Option[];
}

interface Assignment {
  id: string;
  title: string;
  questions: Question[];
  hints: string[];
  dueDate: string;
}

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  onUpdateAssignment: (updatedAssignment: Assignment) => void;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onUpdateAssignment,
}) => {
  const [updatedAssignment, setUpdatedAssignment] =
    useState<Assignment>(assignment);

  useEffect(() => {
    setUpdatedAssignment(assignment);
  }, [assignment]);

  const handleSave = () => {
    onUpdateAssignment(updatedAssignment);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...updatedAssignment.questions];
    updatedQuestions[index].questionText = value;
    setUpdatedAssignment({ ...updatedAssignment, questions: updatedQuestions });
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...updatedAssignment.questions];
    updatedQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });
    setUpdatedAssignment({ ...updatedAssignment, questions: updatedQuestions });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...updatedAssignment.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setUpdatedAssignment({ ...updatedAssignment, questions: updatedQuestions });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...updatedAssignment.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setUpdatedAssignment({ ...updatedAssignment, questions: updatedQuestions });
  };

  const handleCorrectOptionChange = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const updatedQuestions = [...updatedAssignment.questions];
    updatedQuestions[questionIndex].options.forEach((option, i) => {
      option.isCorrect = i === optionIndex;
    });
    setUpdatedAssignment({ ...updatedAssignment, questions: updatedQuestions });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Edit Assignment</h2>
        <input
          type="text"
          value={updatedAssignment.title}
          onChange={(e) =>
            setUpdatedAssignment({
              ...updatedAssignment,
              title: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Title"
          required
        />

        <div className="mt-4">
          <h3 className="text-lg font-medium">Questions</h3>
          {Array.isArray(updatedAssignment.questions) &&
            updatedAssignment.questions.map((question, questionIndex) => (
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
                {Array.isArray(question.options) &&
                  question.options.map((option, optionIndex) => (
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
              </div>
            ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={updatedAssignment.dueDate}
            onChange={(e) =>
              setUpdatedAssignment({
                ...updatedAssignment,
                dueDate: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentModal;
