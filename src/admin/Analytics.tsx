import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface CourseDistribution {
  name: string;
  value: number;
}

interface EnrollmentData {
  week: string; // Updated to week
  users: number; // Changed from students to users
}

// Function to get the week number of the year
function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1); // January 1st of the current year
  const days = Math.floor(
    (date.valueOf() - startDate.valueOf()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startDate.getDay() + 1) / 7); // Calculate week number
}

export function Analytics() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalInstructors, setTotalInstructors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [courseDistributionData, setCourseDistributionData] = useState<
    CourseDistribution[]
  >([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch total users
        const usersSnapshot = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnapshot.size);

        // Fetch total courses
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        setTotalCourses(coursesSnapshot.size);

        // Fetch total instructors
        const instructorsSnapshot = await getDocs(collection(db, "users"));
        const instructorsData = instructorsSnapshot.docs.filter(
          (doc) => doc.data().role === "instructor"
        );
        setTotalInstructors(instructorsData.length);

        // Fetch course distribution data
        const courseCategories: Record<string, number> = {};
        coursesSnapshot.docs.forEach((doc) => {
          const category = doc.data().category;
          if (category) {
            const capitalizedCategory =
              category.charAt(0).toUpperCase() + category.slice(1);
            courseCategories[capitalizedCategory] =
              (courseCategories[capitalizedCategory] || 0) + 1;
          }
        });
        setCourseDistributionData(
          Object.entries(courseCategories).map(([name, value]) => ({
            name,
            value,
          }))
        );

        // Prepare enrollment data based on createdAt timestamp for all users
        const enrollmentCounts: Record<string, number> = {}; // To hold counts by week
        usersSnapshot.docs.forEach((doc) => {
          const userData = doc.data();
          let createdAt: Date;

          // Check if createdAt is a Firestore timestamp
          if (userData.createdAt instanceof Timestamp) {
            createdAt = userData.createdAt.toDate(); // Convert Firestore timestamp to Date
          } else if (typeof userData.createdAt === "string") {
            createdAt = new Date(userData.createdAt); // Convert string to Date
          } else if (typeof userData.createdAt === "number") {
            createdAt = new Date(userData.createdAt); // Convert Unix timestamp to Date
          } else {
            console.warn(
              `Unexpected createdAt type for user ${doc.id}:`,
              userData.createdAt
            );
            return; // Skip this user if createdAt is not valid
          }

          const year = createdAt.getFullYear();
          const week = getWeekNumber(createdAt); // Now this function is defined
          const weekKey = `${year}-W${week}`; // Format: 'YYYY-WX'

          enrollmentCounts[weekKey] = (enrollmentCounts[weekKey] || 0) + 1; // Increment count for the week
        });

        // Convert the counts to an array for the chart
        const formattedEnrollmentData = Object.entries(enrollmentCounts).map(
          ([week, users]) => ({
            week,
            users,
          })
        );

        console.log("Formatted Enrollment Data:", formattedEnrollmentData); // Debugging line
        setEnrollmentData(formattedEnrollmentData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            {loading ? (
              <Loader />
            ) : (
              <p className="text-4xl font-bold mb-2">{totalUsers}</p>
            )}
            <div className="flex items-center text-indigo-200">
              <span>Users</span>
            </div>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
            {loading ? (
              <Loader />
            ) : (
              <p className="text-4xl font-bold mb-2">{totalCourses}</p>
            )}
            <div className="flex items-center text-green-200">
              <span>Courses</span>
            </div>
          </div>
          <div className="bg-purple-600 text-white p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">Total Instructors</h3>
            {loading ? (
              <Loader />
            ) : (
              <p className="text-4xl font-bold mb-2">{totalInstructors}</p>
            )}
            <div className="flex items-center text-purple-200">
              <span>Instructors</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Users Signing Up Trend */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Total Users Signing Up Trend
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Course Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseDistributionData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
