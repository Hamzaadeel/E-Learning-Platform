import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import { Course } from "../types";
import { Filter, SortAsc } from "lucide-react";

interface CourseContent {
  title: string;
  videoUrl: string;
  description: string;
}

interface CourseProgress extends Course {
  progress: number;
  completedLectures: { [key: string]: boolean };
  content: CourseContent[];
}

export function Progress() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "in-progress"
  >("all");

  useEffect(() => {
    if (authUser) {
      fetchUserDataAndProgress();
    }
  }, [authUser]);

  const fetchUserDataAndProgress = async () => {
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

        // Fetch enrolled courses progress
        if (
          userData.enrolledCourses &&
          Array.isArray(userData.enrolledCourses)
        ) {
          const progressPromises = userData.enrolledCourses.map(
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
                } as CourseProgress;
              }
              return null;
            }
          );

          const progress = (await Promise.all(progressPromises)).filter(
            Boolean
          ) as CourseProgress[];
          setCoursesProgress(progress);
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter courses
  const filteredAndSortedCourses = coursesProgress
    .filter((course) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "completed") return course.progress === 100;
      return course.progress < 100;
    })
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return (a.progress - b.progress) * order;
    });

  if (!authUser) {
    return <Loader />;
  }

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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Course Progress</h1>
          <div className="flex items-center gap-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as typeof filterStatus)
                }
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Courses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Button */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <SortAsc className="h-4 w-4" />
              Sort {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : filteredAndSortedCourses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          <div className="grid gap-8">
            {filteredAndSortedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                          Course Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {course.progress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${course.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.content?.map(
                    (lecture: CourseContent, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              course.completedLectures[index]
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-600">
                            Lecture {index + 1}: {lecture.title}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            course.completedLectures[index]
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {course.completedLectures[index]
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
