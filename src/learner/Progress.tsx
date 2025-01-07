import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";

interface CourseProgress {
  id: string;
  title: string;
  description: string;
  progress: number;
  modules: {
    id: string;
    title: string;
    progress: number;
    lessons: {
      id: string;
      title: string;
      completed: boolean;
    }[];
  }[];
}

export function Progress() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);

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

                // Fetch modules and their progress
                const modulesSnapshot = await getDocs(
                  collection(db, `courses/${courseId}/modules`)
                );
                const modules = await Promise.all(
                  modulesSnapshot.docs.map(async (moduleDoc) => {
                    const moduleData = moduleDoc.data();

                    // Fetch lessons and their completion status
                    const lessonsSnapshot = await getDocs(
                      collection(
                        db,
                        `courses/${courseId}/modules/${moduleDoc.id}/lessons`
                      )
                    );
                    const lessons = lessonsSnapshot.docs.map((lessonDoc) => ({
                      id: lessonDoc.id,
                      title: lessonDoc.data().title,
                      completed:
                        userData.completedLessons?.[
                          `${courseId}/${moduleDoc.id}/${lessonDoc.id}`
                        ] || false,
                    }));

                    const moduleProgress =
                      lessons.length > 0
                        ? (lessons.filter((lesson) => lesson.completed).length /
                            lessons.length) *
                          100
                        : 0;

                    return {
                      id: moduleDoc.id,
                      title: moduleData.title,
                      progress: moduleProgress,
                      lessons,
                    };
                  })
                );

                const overallProgress =
                  modules.length > 0
                    ? modules.reduce(
                        (acc, module) => acc + module.progress,
                        0
                      ) / modules.length
                    : 0;

                return {
                  id: courseId,
                  title: courseData.title,
                  description: courseData.description,
                  progress: overallProgress,
                  modules,
                };
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Course Progress
        </h1>

        {loading ? (
          <Loader />
        ) : coursesProgress.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          <div className="grid gap-8">
            {coursesProgress.map((course) => (
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
                          Overall Progress
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

                <div className="space-y-6">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {module.title}
                        </h3>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-indigo-600">
                                {module.progress.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                            <div
                              style={{ width: `${module.progress}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-sm text-gray-600">
                              {lesson.title}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                lesson.completed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {lesson.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
