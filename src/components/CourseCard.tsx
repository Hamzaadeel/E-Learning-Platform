import { useState } from "react";
import { Course } from "../types";
import { CourseDetails } from "./CourseDetailsDefault";

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(course);
    } else {
      setShowDetails(true);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden h-[500px] flex flex-col cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
        onClick={handleClick}
      >
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {course.title}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
              {course.level}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-3">
            {course.description}
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Instructor: {course.instructor}
            </p>
            <p className="text-sm text-gray-600">
              Duration: {course.durationValue} {course.durationType}
            </p>
          </div>
          <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-100">
            <span className="text-lg font-bold text-gray-900">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Keep the original enroll functionality
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <CourseDetails
          course={course}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
