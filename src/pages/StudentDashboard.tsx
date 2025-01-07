import { BarChart, BookOpen, Clock } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User, EnrolledCourse } from "../types";

// Keep the enrolledCourses mock data for now
const enrolledCourses: EnrolledCourse[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description: "Learn full-stack web development from scratch",
    instructor: "Sarah Johnson",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    price: 99.99,
    duration: "12 weeks",
    level: "Beginner",
    category: "web-dev",
    progress: 45,
    lastAccessed: "2024-01-15",
  },
  {
    id: "2",
    title: "Data Science Fundamentals",
    description: "Introduction to data analysis and visualization",
    instructor: "Emily Rodriguez",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    price: 89.99,
    duration: "10 weeks",
    level: "Intermediate",
    category: "data-science",
    progress: 20,
    lastAccessed: "2024-01-14",
  },
];

export function StudentDashboard() {
  const { currentUser: authUser } = useAuth();

  if (!authUser) {
    return null; // or redirect to login
  }

  const user: User = {
    id: authUser.uid,
    name: authUser.displayName || "Student",
    email: authUser.email || "",
    role: "student",
    avatar: authUser.photoURL || "https://ui-avatars.com/api/?name=Student",
  };

  const dashboardContent = (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, {user.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Enrolled Courses</p>
              <p className="text-xl font-semibold">{enrolledCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Average Progress</p>
              <p className="text-xl font-semibold">32%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Hours Learned</p>
              <p className="text-xl font-semibold">24.5</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Continue Learning
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="flex">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-48 h-32 object-cover"
              />
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-gray-800">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  by {course.instructor}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {course.progress}% complete
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return <DashboardLayout user={user}>{dashboardContent}</DashboardLayout>;
}
