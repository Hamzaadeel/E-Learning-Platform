import { X } from "lucide-react";
import { Course } from "../types";

interface CourseDetailsProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetails({ course, isOpen, onClose }: CourseDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

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

          <p className="text-gray-600 text-center">
            ... <br />
            To view course content, please sign up.
          </p>
        </div>
      </div>
    </div>
  );
}
