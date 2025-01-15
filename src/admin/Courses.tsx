import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User, Course } from "../types";
import { Loader } from "../components/Loader";
import debounce from "lodash/debounce";
import { CourseDefinition } from "./CourseDefinition";
import { AddCourse } from "./AddCourse";
import { CourseDetails } from "./CourseDetails";
import { ConfirmationModal } from "./ConfirmationModal";

type SortField = "title" | "price";
type SortDirection = "asc" | "desc";
const COURSES_PER_PAGE = 9;

export function Courses() {
  const { currentUser: authUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error" | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Debounced search handler
  const debouncedSearch = debounce(handleSearchChange, 300);

  useEffect(() => {
    // Cleanup function to cancel the debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Memoize filtered and sorted courses
  const filteredAndSortedCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const matchesSearch =
          searchQuery.trim() === "" ||
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel =
          selectedLevel === "all" || course.level === selectedLevel;
        const matchesCategory =
          selectedCategory === "all" || course.category === selectedCategory;
        return matchesSearch && matchesLevel && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === "price") {
          return sortDirection === "asc"
            ? a.price - b.price
            : b.price - a.price;
        } else {
          // Sorting by title
          return sortDirection === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
      });
  }, [
    courses,
    searchQuery,
    selectedLevel,
    selectedCategory,
    sortField,
    sortDirection,
  ]);

  // Memoize paginated courses
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredAndSortedCourses.slice(
      startIndex,
      startIndex + COURSES_PER_PAGE
    );
  }, [filteredAndSortedCourses, currentPage]);

  // Memoize total pages
  const totalPages = useMemo(
    () => Math.ceil(filteredAndSortedCourses.length / COURSES_PER_PAGE),
    [filteredAndSortedCourses]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedCategory, sortField, sortDirection]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const coursesRef = collection(db, "courses");
      const coursesQuery = query(coursesRef, limit(100)); // Fetch a limited number of courses
      const querySnapshot = await getDocs(coursesQuery);

      const coursesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      console.log("Fetched courses:", coursesData); // Debugging log
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const fetchUserData = useCallback(async () => {
    if (!authUser?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, "users", authUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: authUser.uid,
          name: userData.name || authUser.displayName || "User",
          email: userData.email || authUser.email || "",
          role: userData.role || "user",
          avatar:
            userData.avatar ||
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${userData.name || "User"}`,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      fetchUserData();
    }
  }, [authUser, fetchUserData]);

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsEditModalOpen(true);
  };

  const handleCardClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleDeleteCourse = async () => {
    if (courseToDelete) {
      try {
        await deleteDoc(doc(db, "courses", courseToDelete));
        setAlertMessage("Course deleted successfully");
        setAlertType("success");
        fetchCourses(); // Refresh the course list after deletion
      } catch (error) {
        console.error("Error deleting course:", error);
        setAlertMessage("Failed to delete course");
        setAlertType("error");
      } finally {
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
      }
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 5000); // Clear alert after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [alertMessage]);

  const coursesList = (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Courses</h1>
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="web-dev">Web Development</option>
            <option value="mobile-dev">Mobile Development</option>
            <option value="data-science">Data Science</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="marketing">Marketing</option>
            <option value="ai">AI & Machine Learning</option>
            <option value="devops">DevOps</option>
          </select>

          {/* Updated Sort Dropdown */}
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-");
              setSortField(field as SortField);
              setSortDirection(direction as SortDirection);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="title-asc">Sort by Title (A-Z)</option>
            <option value="title-desc">Sort by Title (Z-A)</option>
            <option value="price-asc">Sort by Price (Low to High)</option>
            <option value="price-desc">Sort by Price (High to Low)</option>
          </select>
        </div>
        {/* Sorting Options */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddModal(true)} // Open the AddCourse modal
            className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCardClick(course)}
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
                    <span className="text-yellow-500">
                      Rating:{" "}
                      {course.averageRating
                        ? course.averageRating.toFixed(1)
                        : "Unrated"}{" "}
                      ⭐
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete(course.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-4 py-2  text-red-600 rounded-lg hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Course Modal */}
      <AddCourse
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          fetchCourses();
        }}
      />

      {/* Add CourseDetails modal */}
      {selectedCourse && (
        <CourseDetails
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* Alert Message */}
      {alertMessage && (
        <div
          className={`fixed top-4 right-4 p-4 mb-4 rounded-lg ${
            alertType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } transition-opacity duration-300`}
        >
          {alertMessage}
        </div>
      )}

      {/* Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          onConfirm={handleDeleteCourse}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );

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
          role: "admin",
          avatar:
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${
              authUser.displayName || "User"
            }`,
        }
      }
    >
      {coursesList}

      {selectedCourseId && (
        <CourseDefinition
          courseId={selectedCourseId}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCourseId(null);
            fetchCourses();
          }}
        />
      )}
    </DashboardLayout>
  );
}
