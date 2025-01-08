import { useState, useEffect } from "react";
import { BarChart, BookOpen, Clock } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { Loader } from "../components/Loader";

interface CourseContent {
  title: string;
  videoUrl: string;
  description: string;
  duration: number; // video duration in minutes
}

interface EnrolledCourseWithContent {
  id: string;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  price: number;
  durationValue: number;
  durationType: string;
  level: string;
  category: string;
  progress: number;
  lastAccessed: string;
  content: CourseContent[];
  completedLectures: { [key: string]: boolean };
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrolledCourseWithContent[]
  >([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) {
      fetchUserAndCourses();
    }
  }, [authUser]);

  const fetchUserAndCourses = async () => {
    if (!authUser?.uid) return;
    try {
      // Fetch user data
      const userRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: authUser.uid,
          name: userData.name || authUser.displayName || "User",
          email: userData.email || authUser.email || "",
          role: "learner",
          avatar:
            userData.avatar ||
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${userData.name || "User"}`,
        });

        // Fetch enrolled courses with content
        if (
          userData.enrolledCourses &&
          Array.isArray(userData.enrolledCourses)
        ) {
          const coursesPromises = userData.enrolledCourses.map(
            async (courseId: string) => {
              const courseDoc = await getDoc(doc(db, "courses", courseId));
              if (courseDoc.exists()) {
                const courseData = courseDoc.data();
                const completedLectures =
                  userData.completedLectures?.[courseId] || {};
                const totalLectures = courseData.content?.length || 0;
                const completedCount =
                  Object.values(completedLectures).filter(Boolean).length;
                const progress =
                  totalLectures > 0
                    ? Math.round((completedCount / totalLectures) * 100)
                    : 0;

                return {
                  id: courseId,
                  ...courseData,
                  progress,
                  completedLectures,
                  lastAccessed:
                    userData.lastAccessed?.[courseId] ||
                    new Date().toISOString(),
                } as EnrolledCourseWithContent;
              }
              return null;
            }
          );

          const courses = (await Promise.all(coursesPromises)).filter(
            Boolean
          ) as EnrolledCourseWithContent[];
          setEnrolledCourses(courses);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authUser || loading) {
    return <Loader />;
  }

  // Calculate statistics
  const totalCourses = enrolledCourses.length;
  const averageProgress =
    totalCourses > 0
      ? Math.round(
          enrolledCourses.reduce((acc, course) => acc + course.progress, 0) /
            totalCourses
        )
      : 0;
  const completedLectures = enrolledCourses.reduce((acc, course) => {
    return acc + Object.values(course.completedLectures).filter(Boolean).length;
  }, 0);

  const dashboardContent = (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, {user?.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Enrolled Courses</p>
              <p className="text-xl font-semibold">{totalCourses}</p>
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
              <p className="text-xl font-semibold">{averageProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Lectures Completed</p>
              <p className="text-xl font-semibold">{completedLectures}</p>
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
                  <button
                    onClick={() => navigate(`/learner/course/${course.id}`)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
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

  return (
    <DashboardLayout
      user={
        user || {
          id: authUser.uid,
          name: authUser.displayName || "User",
          email: authUser.email || "",
          role: "learner",
          avatar:
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${
              authUser.displayName || "User"
            }`,
        }
      }
    >
      {dashboardContent}
    </DashboardLayout>
  );
}
