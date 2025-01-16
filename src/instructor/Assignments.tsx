import { useState, useEffect, useCallback } from "react";
import { db } from "../config/firebase"; // Import your Firebase configuration
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"; // Import Firestore functions
import { useAuth } from "../contexts/AuthContext"; // Import Auth context
import { DashboardLayout } from "../components/DashboardLayout"; // Import DashboardLayout
import { Loader } from "../components/Loader"; // Import your Loader component
import { Trash2, Edit2 } from "lucide-react"; // Import icons
import { Course } from "../types"; // Import your Course type
import AddAssignmentModal from "./AddAssignmentModal"; // Import the new modal component
import EditAssignmentModal from "./EditAssignmentModal"; // Import the new edit modal component
import ConfirmationModal from "./ConfirmationModal"; // Import the confirmation modal

interface Assignment {
  id: string;
  title: string;
  questions: {
    questionText: string;
    options: { text: string; isCorrect: boolean }[];
  }[];
  hints: string[];
  dueDate: string;
}

export function Assignments() {
  const { currentUser: authUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [newAssignment, setNewAssignment] = useState<{
    title: string;
    questions: {
      questionText: string;
      options: { text: string; isCorrect: boolean }[];
      hint: string;
    }[];
    hints: string[];
    dueDate: string;
  }>({
    title: "",
    questions: [{ questionText: "", options: [], hint: "" }],
    hints: [""],
    dueDate: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null); // State to hold the assignment being edited
  const [showEditModal, setShowEditModal] = useState<boolean>(false); // State to control the edit modal visibility
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null
  ); // Store the ID of the assignment to delete

  // Fetch courses assigned to the instructor
  const fetchCourses = useCallback(async () => {
    if (!authUser?.uid) return; // Ensure authUser is defined
    setLoading(true);
    try {
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("instructor", "==", authUser.name));
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      })) as Course[];

      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Fetch assignments for the selected course
  const fetchAssignments = useCallback(async () => {
    if (!selectedCourseId) return; // Ensure a course is selected
    setLoading(true);
    try {
      const courseRef = doc(db, "courses", selectedCourseId);
      const courseDoc = await getDoc(courseRef);
      const courseData = courseDoc.data();
      setAssignments(courseData?.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    fetchCourses(); // Fetch courses on component mount
  }, [fetchCourses]);

  useEffect(() => {
    fetchAssignments(); // Fetch assignments when selected course changes
  }, [selectedCourseId, fetchAssignments]);

  // Function to handle adding a new assignment
  const handleAddAssignment = async () => {
    if (!selectedCourseId) return;

    try {
      const courseRef = doc(db, "courses", selectedCourseId);
      const updatedAssignments = [
        ...assignments,
        { id: Date.now().toString(), ...newAssignment },
      ];
      await updateDoc(courseRef, { assignments: updatedAssignments });

      setAssignments(updatedAssignments);
      setSuccessMessage("Assignment added successfully!");
      setNewAssignment({ title: "", questions: [], hints: [""], dueDate: "" }); // Reset form
      setShowModal(false); // Close modal
      setTimeout(() => setSuccessMessage(null), 5000); // Clear success message after 5 seconds
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  };

  // Function to handle deleting an assignment
  const handleDeleteAssignment = async () => {
    if (!selectedCourseId || !assignmentToDelete) return;

    try {
      const courseRef = doc(db, "courses", selectedCourseId);
      const updatedAssignments = assignments.filter(
        (assignment) => assignment.id !== assignmentToDelete
      );
      await updateDoc(courseRef, { assignments: updatedAssignments });

      setAssignments(updatedAssignments);
      setSuccessMessage("Assignment deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 5000); // Clear success message after 5 seconds
    } catch (error) {
      console.error("Error deleting assignment:", error);
    } finally {
      setShowConfirmationModal(false); // Close the confirmation modal
      setAssignmentToDelete(null);
      setIsDeleting(false); // Reset the assignment to delete
    }
  };

  const openConfirmationModal = (assignmentId: string) => {
    setAssignmentToDelete(assignmentId); // Set the assignment ID to delete
    setShowConfirmationModal(true); // Show the confirmation modal
  };

  // Function to handle opening the edit modal
  const handleEditAssignment = (assignment: Assignment) => {
    setEditAssignment(assignment); // Ensure assignment has dueDate
    setShowEditModal(true); // Show the edit modal
  };

  // Function to handle closing the edit modal
  const handleCloseEditModal = () => {
    setEditAssignment(null); // Clear the assignment being edited
    setShowEditModal(false); // Hide the edit modal
  };

  return (
    <DashboardLayout
      user={{
        id: authUser?.uid || "",
        name: authUser?.displayName || "Instructor",
        email: authUser?.email || "",
        role: "instructor",
        avatar:
          authUser?.photoURL || `https://ui-avatars.com/api/?name=Instructor`,
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Assignments</h1>

        <label className="block mb-2">
          Please Select a Course to view the assignments:
          <select
            value={selectedCourseId || ""}
            onChange={(e) => {
              setSelectedCourseId(e.target.value); // Set selected course
              setAssignments([]); // Clear assignments when course changes
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">-- Select a Course --</option>
            {courses.length > 0 ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No courses available
              </option>
            )}
          </select>
        </label>

        {loading ? (
          <Loader />
        ) : assignments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment, index) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="Delete assignment"
                        onClick={() => openConfirmationModal(assignment.id)} // Open confirmation modal
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                        title="Edit assignment"
                        onClick={() => handleEditAssignment(assignment)} // Call edit function
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">No assignments available.</div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Add Assignment
        </button>

        {/* Success Alert */}
        {successMessage && (
          <div className="fixed top-4 right-4 mb-4 p-3 bg-green-100 text-green-700 rounded-lg shadow-md flex items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              &times;
            </button>
          </div>
        )}

        {/* Assignment Modal */}
        {showModal && (
          <AddAssignmentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onAddAssignment={handleAddAssignment}
            newAssignment={newAssignment}
            setNewAssignment={setNewAssignment}
            selectedCourse={""}
          />
        )}

        {/* Edit Assignment Modal */}
        {showEditModal && editAssignment && (
          <EditAssignmentModal
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            assignment={editAssignment} // Pass the assignment to edit
            onUpdateAssignment={(updatedAssignment) => {
              // Update the assignment in the state
              const updatedAssignments = assignments.map((assignment) =>
                assignment.id === updatedAssignment.id
                  ? updatedAssignment
                  : assignment
              );
              setAssignments(updatedAssignments);
              handleCloseEditModal(); // Close the modal after updating
            }}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleDeleteAssignment}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
