import React from "react";
import { EnrolledCourse } from "../types";
import { Trash2 } from "lucide-react";

interface EnrolledCoursesProps {
  courses: EnrolledCourse[];
  onDropCourse: (courseId: string) => void;
  onEnrollNewCourse: (courseId: string) => void; // Function to handle enrolling in a new course
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({
  courses,
  onDropCourse,
  onEnrollNewCourse,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800">Enrolled Courses</h2>
      <button
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        title="Sort by progress"
      >
        Sort by progress
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses
          .sort((a, b) => {
            const order = sortOrder === "asc" ? 1 : -1;
            return (a.progress - b.progress) * order;
          })
          .map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[480px] cursor-pointer hover:shadow-md hover:scale-105 transition-all"
            >
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span>By {course.instructor}</span>
                  <span>•</span>
                  <span>
                    {course.durationValue} {course.durationType}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.progress}% Complete
                  </p>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <button
                    onClick={() => onEnrollNewCourse(course.id)} // Call the enroll function
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                  <button
                    onClick={() => onDropCourse(course.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Drop Course"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default EnrolledCourses;
