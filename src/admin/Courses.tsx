import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Course } from "../data/courses";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import debounce from "lodash/debounce";

type SortField = "title" | "level" | "price" | "category";
type SortDirection = "asc" | "desc";
const COURSES_PER_PAGE = 9;

// Image component with loading placeholder
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-48 bg-gray-100">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-48 object-cover transition-opacity duration-300 ${
          isLoading || error ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};

export function Courses() {
  const { currentUser: authUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    instructor: "",
    price: 0,
    duration: "",
    level: "Beginner",
    category: "web-dev",
    imageUrl: "",
  });

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

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
        const direction = sortDirection === "asc" ? 1 : -1;
        if (sortField === "price") {
          return (a[sortField] - b[sortField]) * direction;
        }
        return a[sortField].localeCompare(b[sortField]) * direction;
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

  // Update the search input handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Memoize CourseCard component
  const CourseCard = useCallback(
    ({ course }: { course: Course }) => (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <LazyImage src={course.imageUrl} alt={course.title} />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-indigo-600 font-medium">${course.price}</span>
            <span className="text-sm text-gray-500">
              by {course.instructor}
            </span>
          </div>
        </div>
      </div>
    ),
    []
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedCategory, sortField, sortDirection]);

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
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
  };

  useEffect(() => {
    if (authUser) {
      Promise.all([fetchUserData(), fetchCourses()]);
    }
  }, [authUser]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const coursesRef = collection(db, "courses");
      await addDoc(coursesRef, newCourse);
      setShowModal(false);
      setNewCourse({
        title: "",
        description: "",
        instructor: "",
        price: 0,
        duration: "",
        level: "Beginner",
        category: "web-dev",
        imageUrl: "",
      });
      await fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
    } finally {
      setLoading(false);
    }
  };

  const coursesList = (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="web-dev">Web Development</option>
            <option value="mobile-dev">Mobile Development</option>
            <option value="data-science">Data Science</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
          </select>
          {/* Sort Options */}
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-") as [
                SortField,
                SortDirection
              ];
              setSortField(field);
              setSortDirection(direction);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="level-asc">Level (Low to High)</option>
            <option value="level-desc">Level (High to Low)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="category-asc">Category (A-Z)</option>
            <option value="category-desc">Category (Z-A)</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Course</h2>
            <form onSubmit={handleAddCourse}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    required
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instructor
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse.instructor}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, instructor: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    required
                    value={newCourse.level}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        level: e.target.value as Course["level"],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newCourse.imageUrl}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, imageUrl: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </DashboardLayout>
  );
}
