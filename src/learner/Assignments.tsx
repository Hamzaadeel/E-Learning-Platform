import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  courseName: string;
  status: "pending" | "submitted" | "graded";
}

export function Assignments() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (authUser) {
      fetchUserDataAndAssignments();
    }
  }, [authUser]);

  const fetchUserDataAndAssignments = async () => {
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

        // Fetch enrolled courses
        if (
          userData.enrolledCourses &&
          Array.isArray(userData.enrolledCourses)
        ) {
          const assignmentsPromises = userData.enrolledCourses.map(
            async (courseId: string) => {
              const courseDoc = await getDoc(doc(db, "courses", courseId));
              if (courseDoc.exists()) {
                const courseData = courseDoc.data();
                // Fetch assignments for this course
                const assignmentsSnapshot = await getDocs(
                  collection(db, `courses/${courseId}/assignments`)
                );
                return assignmentsSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  courseId,
                  courseName: courseData.title,
                }));
              }
              return [];
            }
          );

          const allAssignments = await Promise.all(assignmentsPromises);
          setAssignments(allAssignments.flat() as Assignment[]);
        }
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Assignments</h1>

        {loading ? (
          <Loader />
        ) : assignments.length === 0 ? (
          <p className="text-gray-500">No assignments found.</p>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Course: {assignment.courseName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      assignment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : assignment.status === "submitted"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {assignment.status.charAt(0).toUpperCase() +
                      assignment.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{assignment.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  {assignment.status === "pending" && (
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={() => {
                        /* TODO: Implement submission handling */
                      }}
                    >
                      Submit Assignment
                    </button>
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
