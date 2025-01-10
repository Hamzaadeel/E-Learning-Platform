import React from "react";
import { Check, X } from "lucide-react";

interface CourseContentSidebarProps {
  content: { title: string }[];
  currentVideoIndex: number;
  completedLectures: { [key: number]: boolean };
  handleLectureCompletion: (index: number, isComplete: boolean) => void;
  setCurrentVideoIndex: (index: number) => void;
  onClose: () => void;
  courseId: string;
}

const CourseContentSidebar: React.FC<CourseContentSidebarProps> = ({
  content,
  currentVideoIndex,
  completedLectures,
  handleLectureCompletion,
  setCurrentVideoIndex,
  onClose,
}) => {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto pt-4">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Course Content
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {content.map((lecture, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-4 rounded-lg transition-colors ${
                currentVideoIndex === index
                  ? "bg-indigo-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 border rounded cursor-pointer flex items-center justify-center ${
                  completedLectures[index]
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLectureCompletion(index, !completedLectures[index]);
                }}
              >
                {completedLectures[index] && <Check className="h-3 w-3" />}
              </div>
              <button
                onClick={() => setCurrentVideoIndex(index)}
                className="flex-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`${
                      completedLectures[index] ? "text-gray-500" : ""
                    }`}
                  >
                    <span className="text-sm font-medium">
                      Lecture {index + 1}:
                    </span>{" "}
                    {lecture.title}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseContentSidebar;
