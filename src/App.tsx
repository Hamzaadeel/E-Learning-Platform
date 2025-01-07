import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import your dashboard components
import { AdminDashboard } from "./pages/AdminDashboard";
import { InstructorDashboard } from "./pages/InstructorDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import DefaultDashboard from "./pages/DefaultDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Courses } from "./admin/Courses";
import Users from "./admin/Users";
import { Instructors } from "./admin/Instructors";
import { Analytics } from "./admin/Analytics";
import { Settings } from "./admin/Settings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<DefaultDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/instructors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Instructors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner-dashboard"
            element={
              <ProtectedRoute allowedRoles={["learner"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
