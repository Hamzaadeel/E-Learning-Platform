import { Course } from "../types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[500px] flex flex-col">
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
          <p className="text-sm text-gray-600">Duration: {course.duration}</p>
        </div>
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            ${course.price}
          </span>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
}
