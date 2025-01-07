import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import { Course } from "../types";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnrolledCourse extends Course {
  enrolledAt: string;
  progress: number;
}

export function MyCourses() {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCoursesLoading, setEnrolledCoursesLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  useEffect(() => {
    if (authUser) {
      fetchUserData();
      fetchCourses();
    }
  }, [authUser]);

  const fetchUserData = async () => {
    if (!authUser?.uid) return;
    try {
      setEnrolledCoursesLoading(true);
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

        // Initialize arrays if they don't exist
        if (!userData.enrolledCourses) {
          await updateDoc(userRef, {
            enrolledCourses: [],
            enrolledDates: {},
            courseProgress: {},
          });
          setEnrolledCourses([]);
          setEnrolledCoursesLoading(false);
          return;
        }

        console.log("Enrolled courses from DB:", userData.enrolledCourses);

        // Fetch enrolled courses details and clean up invalid entries
        if (
          userData.enrolledCourses &&
          Array.isArray(userData.enrolledCourses)
        ) {
          const validEnrolledCourses: string[] = [];
          const validEnrolledDates: Record<string, string> = {};
          const validCourseProgress: Record<string, number> = {};

          const enrolledCoursesData = await Promise.all(
            userData.enrolledCourses.map(async (courseId: string) => {
              try {
                const courseDoc = await getDoc(doc(db, "courses", courseId));
                if (courseDoc.exists()) {
                  const courseData = courseDoc.data();
                  console.log("Found enrolled course:", courseId, courseData);

                  // Add to valid arrays/objects
                  validEnrolledCourses.push(courseId);
                  validEnrolledDates[courseId] =
                    userData.enrolledDates?.[courseId] ||
                    new Date().toISOString();
                  validCourseProgress[courseId] =
                    userData.courseProgress?.[courseId] || 0;

                  return {
                    id: courseDoc.id,
                    ...courseData,
                    enrolledAt:
                      userData.enrolledDates?.[courseId] ||
                      new Date().toISOString(),
                    progress: userData.courseProgress?.[courseId] || 0,
                  } as EnrolledCourse;
                } else {
                  console.log("Course not found:", courseId);
                }
              } catch (error) {
                console.error("Error fetching course:", courseId, error);
              }
              return null;
            })
          );

          // Update user document with only valid courses
          await updateDoc(userRef, {
            enrolledCourses: validEnrolledCourses,
            enrolledDates: validEnrolledDates,
            courseProgress: validCourseProgress,
          });

          const validCourses = enrolledCoursesData.filter(
            Boolean
          ) as EnrolledCourse[];
          console.log("Final enrolled courses:", validCourses);
          setEnrolledCourses(validCourses);
        } else {
          setEnrolledCourses([]);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setEnrolledCoursesLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setAvailableCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!authUser?.uid) return;

    try {
      setEnrolling(courseId);
      const userRef = doc(db, "users", authUser.uid);

      // Update user's enrolled courses
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId),
        [`enrolledDates.${courseId}`]: new Date().toISOString(),
        [`courseProgress.${courseId}`]: 0,
      });

      // Refresh user data to show newly enrolled course
      await fetchUserData();
    } catch (error) {
      console.error("Error enrolling in course:", error);
    } finally {
      setEnrolling(null);
    }
  };

  // Filter courses based on search query and filters
  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const notEnrolledCourses = filteredCourses.filter(
    (course) => !enrolledCourses.some((enrolled) => enrolled.id === course.id)
  );

  if (!authUser) {
    return <Loader />;
  }

  // Get unique categories and levels from available courses
  const categories = [
    ...new Set(availableCourses.map((course) => course.category)),
  ];
  const levels = [...new Set(availableCourses.map((course) => course.level))];

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h1>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Enrolled Courses
          </h2>
          {loading ? (
            <Loader />
          ) : enrolledCoursesLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader />
            </div>
          ) : enrolledCourses.length === 0 ? (
            <p className="text-gray-500">
              You haven't enrolled in any courses yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {course.description}
                    </p>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {course.progress}% Complete
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Enrolled:{" "}
                        {new Date(course.enrolledAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => navigate(`/learner/course/${course.id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Available Courses
            </h2>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notEnrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
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
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      ${course.price}
                    </span>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {enrolling === course.id ? "Enrolling..." : "Enroll Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
