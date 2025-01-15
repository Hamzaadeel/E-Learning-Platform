import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User, Course } from "../types";
import { Loader } from "../components/Loader";
import { db } from "../config/firebase"; // Import your Firebase configuration
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore functions
import { AddCourseInstructor } from "./AddCourseInstructor"; // Import the AddCourseInstructor component
import { EditCourse } from "./EditCourse"; // Import the EditCourse component
import { CourseDetailsInstructor } from "./CourseDetailsInstructor"; // Import the CourseDetailsInstructor component

export function MyCourses() {
  const { currentUser: authUser } = useAuth();
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]); // Change to hold assigned courses
  const [loading, setLoading] = useState(true); // Loading state for assigned courses
  const [user, setUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for Add Course modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Course modal
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null); // State to manage the course being edited
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State for Course Details modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // State to hold selected course

  const fetchUserData = useCallback(async () => {
    if (!authUser?.uid) return;
    try {
      const userData: User = {
        id: authUser.uid,
        name: authUser.name || authUser.displayName || "Instructor",
        email: authUser.email || "",
        role: "instructor",
        avatar:
          authUser.photoURL ||
          `https://ui-avatars.com/api/?name=${authUser.name || "Instructor"}`,
      };
      setUser(userData); // Set user data
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [authUser]);

  const fetchAssignedCourses = useCallback(async () => {
    setLoading(true);
    try {
      const hardcodedUserName = "Instructor1"; // Replace with a known instructor name
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("instructor", "==", hardcodedUserName));
      const querySnapshot = await getDocs(q);

      const instructorAssignedCourses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      setAssignedCourses(instructorAssignedCourses);
      console.log("Assigned courses fetched:", instructorAssignedCourses); // Log the fetched courses
    } catch (error) {
      console.error("Error fetching assigned courses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchAssignedCourses(); // Fetch assigned courses
  }, [fetchUserData, fetchAssignedCourses]);

  console.log("Auth User:", authUser); // Log authUser details
  console.log("User State:", user); // Log user state

  const handleAddCourse = () => {
    setIsEditModalOpen(false); // Close Edit modal if open
    setIsAddModalOpen(true); // Open Add modal
  };

  const handleEditCourse = (courseId: string) => {
    setIsAddModalOpen(false); // Close Add modal if open
    setEditingCourseId(courseId); // Set the course ID to edit
    setIsEditModalOpen(true); // Open Edit modal
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course); // Set the selected course
    setIsDetailsModalOpen(true); // Open the Course Details modal
  };

  if (!authUser) {
    return <Loader />;
  }

  return (
    <DashboardLayout
      user={{
        id: authUser.uid,
        name: user?.name || authUser.displayName || "Instructor",
        email: authUser.email || "",
        role: "instructor",
        avatar:
          authUser.photoURL ||
          `https://ui-avatars.com/api/?name=${user?.name || "Instructor"}`,
      }}
    >
      <div className="p-6 relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Assigned Courses
        </h1>

        {/* Add Course Button */}
        <button
          onClick={handleAddCourse}
          className="absolute top-6 right-6 bg-indigo-600 text-white px-4 py-2 mt-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Course
        </button>

        {loading ? (
          <Loader />
        ) : assignedCourses.length === 0 ? ( // Check if there are no assigned courses
          <p>No assigned courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[420px] cursor-pointer hover:shadow-md hover:scale-105 transition-all"
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {course.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {course.durationValue} {course.durationType}
                      </span>
                      <span className="text-yellow-500">
                        Rating:{" "}
                        {course.averageRating
                          ? course.averageRating.toFixed(1)
                          : "Unrated"}{" "}
                        ⭐
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCourse(course.id);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Edit Course
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Course Details */}
        {isDetailsModalOpen && selectedCourse && (
          <CourseDetailsInstructor
            course={selectedCourse} // Pass the selected course
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)} // Close modal
          />
        )}

        {/* Modal for Adding Course */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Add Course</h2>
              <AddCourseInstructor
                onClose={() => setIsAddModalOpen(false)} // Close Add modal
                isOpen={isAddModalOpen}
                authUser={authUser}
                onCourseAdded={() => {
                  fetchAssignedCourses(); // Refresh the assigned courses after adding a new course
                  setIsAddModalOpen(false); // Close the modal
                }}
              />
              <button
                onClick={() => setIsAddModalOpen(false)} // Close Add modal
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal for Editing Course */}
        {isEditModalOpen && editingCourseId && (
          <EditCourse
            courseId={editingCourseId}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false); // Close Edit modal
              setEditingCourseId(null); // Reset the editing course ID
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
