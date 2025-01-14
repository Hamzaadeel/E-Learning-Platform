import { useEffect, useState } from "react";
import { Users, BookOpen } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase"; // Ensure you have the correct import for your Firestore config
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { User } from "../types";
import { Loader } from "../components/Loader";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"; // Import necessary components

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]; // Define colors for the pie chart

// Define the CourseDistribution type
interface CourseDistribution {
  name: string;
  value: number;
}

export function AdminDashboard() {
  const { currentUser: authUser } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [courseDistributionData, setCourseDistributionData] = useState<
    CourseDistribution[]
  >([]); // Add state for course distribution data

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total users
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        setTotalUsers(usersSnapshot.size);

        // Fetch total courses
        const coursesRef = collection(db, "courses");
        const coursesSnapshot = await getDocs(coursesRef);
        setTotalCourses(coursesSnapshot.size);

        // Fetch last 3 registered users
        const recentUsersQuery = query(
          usersRef,
          orderBy("createdAt", "desc"), // Assuming you have a createdAt field
          limit(3)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const usersData = recentUsersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setRecentUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch course distribution data
  const fetchCourseDistributionData = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const courseCategories: Record<string, number> = {};
      coursesSnapshot.docs.forEach((doc) => {
        const category = doc.data().category;
        if (category) {
          courseCategories[category] = (courseCategories[category] || 0) + 1;
        }
      });
      setCourseDistributionData(
        Object.entries(courseCategories).map(([name, value]) => ({
          name,
          value,
        }))
      );
    } catch (error) {
      console.error("Error fetching course distribution data:", error);
    }
  };

  useEffect(() => {
    fetchCourseDistributionData(); // Call the function to fetch data
  }, []);

  if (!authUser) {
    return null; // or redirect to login
  }

  const user: User = {
    id: authUser.uid,
    name: authUser.displayName || "Admin User",
    email: authUser.email || "",
    role: "admin",
    avatar:
      authUser.photoURL ||
      `https://ui-avatars.com/api/?name=${authUser.displayName || "User"}`,
  };

  const dashboardContent = (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-semibold">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-xl font-semibold">{totalCourses}</p>
            </div>
          </div>
        </div>

        {/* Remove the other stat cards */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Users
          </h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? ( // Assuming 'loading' is a state that indicates if the data is being fetched
              <Loader />
            ) : (
              <table className="min-w-full divide-y divide-gray-200 h-80">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Course Distribution
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-72">
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
    </div>
  );

  return <DashboardLayout user={user}>{dashboardContent}</DashboardLayout>;
}
