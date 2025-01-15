import { useState, useEffect, useCallback } from "react";
import { db } from "../config/firebase"; // Import your Firebase configuration
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore functions
import { useAuth } from "../contexts/AuthContext"; // Import Auth context
import { DashboardLayout } from "../components/DashboardLayout"; // Import DashboardLayout
import { Loader } from "../components/Loader"; // Import your Loader component

// Define the Course type
interface Course {
  id: string; // This will be the document ID
  title: string;
  instructorId: string; // Adjust based on your data structure
}

// Define the Learner type
interface Learner {
  id: string; // This will be the document ID
  name: string;
  email: string;
  progress: number; // Percentage of progress
  joiningDate: string; // Joining date as a string
}

export function Learners() {
  const { currentUser: authUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]); // State to hold courses
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null); // State for selected course
  const [learners, setLearners] = useState<Learner[]>([]); // State to hold learners
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading

  // Fetch courses assigned to the instructor
  const fetchCourses = useCallback(async () => {
    if (!authUser?.uid) return; // Ensure authUser is defined
    setLoading(true); // Set loading to true
    try {
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("instructor", "==", authUser.name)); // Use the correct field for instructor ID
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use document ID as course ID
        title: doc.data().title, // Ensure to include title
        instructorId: doc.data().instructorId, // Ensure to include instructorId
      })) as Course[];

      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false); // Set loading to false
    }
  }, [authUser]);

  // Fetch learners when a course is selected
  const fetchLearners = useCallback(async () => {
    if (!selectedCourseId) return; // Ensure a course is selected
    setLoading(true); // Set loading to true
    try {
      const usersRef = collection(db, "users"); // Reference to the users collection
      const q = query(usersRef, where("enrolledCourses", "array-contains", selectedCourseId)); // Query for users enrolled in the selected course
      const querySnapshot = await getDocs(q);
      const fetchedLearners = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const progress = data.courseProgress[selectedCourseId] || 0; // Access progress for the selected course
        const joiningDate = data.enrolledDates[selectedCourseId] || "N/A"; // Access joining date for the selected course

        return {
          id: doc.id, // Use document ID as learner ID
          name: data.name,
          email: data.email,
          progress, // Get course progress
          joiningDate, // Get joining date
        } as Learner;
      });

      setLearners(fetchedLearners); // Set the learners state
    } catch (error) {
      console.error("Error fetching learners:", error);
    } finally {
      setLoading(false); // Set loading to false
    }
  }, [selectedCourseId]);

  useEffect(() => {
    fetchCourses(); // Fetch courses on component mount
  }, [fetchCourses]);

  useEffect(() => {
    fetchLearners(); // Fetch learners when selected course changes
  }, [selectedCourseId, fetchLearners]);

  // Check if authUser is null
  if (!authUser) {
    return <div>Loading...</div>; // Or handle the loading state as needed
  }

  // Function to format date from string to MM/DD/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    } as const;
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <DashboardLayout
      user={{
        id: authUser.uid,
        name: authUser.displayName || "Instructor",
        email: authUser.email || "",
        role: "instructor",
        avatar: authUser.photoURL || `https://ui-avatars.com/api/?name=Instructor`,
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Learners Enrolled in Courses</h1>

        <label className="block mb-2">
          Select Course:
          <select
            value={selectedCourseId || ""}
            onChange={(e) => {
              setSelectedCourseId(e.target.value); // Set selected course
              setLearners([]); // Clear learners when course changes
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
              <option value="" disabled>No courses available</option>
            )}
          </select>
        </label>

        {loading ? ( // Show loader while loading
          <Loader />
        ) : learners.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th> {/* Incremental index */}
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progress (%)</th> {/* Progress column */}
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joining Date</th> {/* Joining date column */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {learners.map((learner, index) => (
                    <tr key={learner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td> {/* Incremental index */}
                      <td className="px-6 py-4 whitespace-nowrap">{learner.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{learner.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{learner.progress}%</td> {/* Progress */}
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(learner.joiningDate)}</td> {/* Joining date formatted */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-4">No learners enrolled in this course.</div> // Message for no learners
        )}
      </div>
    </DashboardLayout>
  );
}
