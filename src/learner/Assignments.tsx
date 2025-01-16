import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import AssignmentView from "./AssignmentView";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  hint: string;
  options: Option[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  courseName: string;
  status: "pending" | "submitted" | "graded";
  questions: Question[]; // Include questions in the assignment
}

export function Assignments() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const fetchUserDataAndAssignments = useCallback(async () => {
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
                const courseAssignments = courseData.assignments || [];

                return assignmentsSnapshot.docs
                  .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    courseId,
                    courseName: courseData.title,
                  }))
                  .concat(
                    courseAssignments.map((assignment: Assignment) => ({
                      ...assignment,
                      courseId,
                      courseName: courseData.title,
                    }))
                  );
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
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      fetchUserDataAndAssignments();
    }
  }, [authUser, fetchUserDataAndAssignments]);

  const openModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleAssignmentSubmit = (assignmentId: string, score: number) => {
    // Update the assignment status to submitted and store the score
    setAssignments((prevAssignments) =>
      prevAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: "submitted", score } // Update status and add score
          : assignment
      )
    );
    // Do not close the modal here; let the user close it manually
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
                      assignment.status
                        ? assignment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                        : "bg-gray-100 text-yellow-800"
                    }`}
                  >
                    {assignment.status
                      ? assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)
                      : "Pending"}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{assignment.description}</p>
                <span className="text-sm text-gray-500">
                  Due: {assignment.dueDate ? assignment.dueDate : "No due date"}
                </span>
                <div className="flex justify-end">
                  <button
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => openModal(assignment)} // Open modal with the selected assignment
                  >
                    View Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedAssignment && (
        <AssignmentView
          isOpen={isModalOpen}
          assignment={selectedAssignment}
          onClose={() => setIsModalOpen(false)} // This will close the modal when the user clicks the close button
          onSubmit={handleAssignmentSubmit} // Pass the submit handler
        />
      )}
    </DashboardLayout>
  );
}
