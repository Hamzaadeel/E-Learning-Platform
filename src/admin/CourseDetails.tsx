import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Course } from "../types";

interface CourseDetailsProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetails({ course, isOpen, onClose }: CourseDetailsProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close the modal
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Course details content */}
        <div className="space-y-6">
          {/* Course Image */}
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg"
          />

          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-900">{course.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium text-gray-900">{course.level}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-gray-900">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </p>
            </div>
          </div>

          {/* Duration and Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">
                {course.durationValue} {course.durationType}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="font-medium text-gray-900">{course.instructor}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-600">{course.description}</p>
          </div>

          {/* Course Outline */}
          {course.outlineDescription && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Course Outline
              </h3>
              <p className="text-gray-600 mb-4">{course.outlineDescription}</p>
              <div className="space-y-4">
                {course.outlineItems?.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {item.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="text-gray-600">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Content */}
          {course.content && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Course Content
              </h3>
              <div className="space-y-4">
                {course.content.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
