import { Users, DollarSign, BookOpen, TrendingUp } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User, Course } from "../types";

// Keep the instructorCourses mock data for now
const instructorCourses: Course[] = [
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
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and patterns",
    instructor: "Sarah Johnson",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    price: 79.99,
    duration: "8 weeks",
    level: "Advanced",
    category: "web-dev",
  },
];

export function InstructorDashboard() {
  const { currentUser: authUser } = useAuth();

  if (!authUser) {
    return null; // or redirect to login
  }

  const user: User = {
    id: authUser.uid,
    name: authUser.displayName || "Instructor",
    email: authUser.email || "",
    role: "instructor",
    avatar: authUser.photoURL || "https://ui-avatars.com/api/?name=Instructor",
  };

  const dashboardContent = (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Instructor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-semibold">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-xl font-semibold">$12,345</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-xl font-semibold">
                {instructorCourses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Course Rating</p>
              <p className="text-xl font-semibold">4.8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Courses
          </h2>
          <div className="space-y-4">
            {instructorCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {course.level} • {course.duration}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-green-600">
                        ${course.price}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        156 students
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="ml-3 text-sm text-gray-600">
                  New enrollment in "Complete Web Development Bootcamp"
                </p>
                <span className="ml-auto text-xs text-gray-400">2h ago</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="ml-3 text-sm text-gray-600">
                  New review on "Advanced React Patterns"
                </p>
                <span className="ml-auto text-xs text-gray-400">5h ago</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="ml-3 text-sm text-gray-600">
                  Course completion certificate issued
                </p>
                <span className="ml-auto text-xs text-gray-400">1d ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <DashboardLayout user={user}>{dashboardContent}</DashboardLayout>;
}
