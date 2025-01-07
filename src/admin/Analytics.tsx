import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
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
  BarChart,
  Bar,
} from "recharts";

// Mock data for charts
const enrollmentData = [
  { month: "Jan", students: 65 },
  { month: "Feb", students: 85 },
  { month: "Mar", students: 120 },
  { month: "Apr", students: 175 },
  { month: "May", students: 220 },
  { month: "Jun", students: 250 },
];

const courseDistributionData = [
  { name: "Web Development", value: 35 },
  { name: "Mobile Development", value: 25 },
  { name: "Data Science", value: 20 },
  { name: "Design", value: 15 },
  { name: "Business", value: 5 },
];

const revenueData = [
  { month: "Jan", revenue: 12500 },
  { month: "Feb", revenue: 18500 },
  { month: "Mar", revenue: 25000 },
  { month: "Apr", revenue: 32000 },
  { month: "May", revenue: 45000 },
  { month: "Jun", revenue: 52000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function Analytics() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

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
      fetchUserData();
    }
  }, [authUser]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">Total Students</h3>
            <p className="text-4xl font-bold mb-2">250</p>
            <div className="flex items-center text-indigo-200">
              <span className="text-green-400 mr-1">↑</span>
              <span>15% from last month</span>
            </div>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold mb-2">$52,000</p>
            <div className="flex items-center text-green-200">
              <span className="text-green-400 mr-1">↑</span>
              <span>12% from last month</span>
            </div>
          </div>
          <div className="bg-purple-600 text-white p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">Active Courses</h3>
            <p className="text-4xl font-bold mb-2">45</p>
            <div className="flex items-center text-purple-200">
              <span className="text-green-400 mr-1">↑</span>
              <span>8% from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Enrollment Trend */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Student Enrollment Trend
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="students"
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
                    {courseDistributionData.map((entry, index) => (
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

          {/* Revenue Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Revenue Analysis</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value as number)
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
