import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DefaultDashboard from "./pages/DefaultDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { InstructorDashboard } from "./pages/InstructorDashboard";
import Users from "./admin/Users";
import { Courses } from "./admin/Courses";
import { Instructors } from "./admin/Instructors";
import { Analytics } from "./admin/Analytics";
import { Settings } from "./admin/Settings";
import { MyCourses } from "./learner/MyCourses";
import { Assignments } from "./learner/Assignments";
import { Progress } from "./learner/Progress";
import { Settings as LearnerSettings } from "./learner/Settings";
import { LearnerCourseView } from "./learner/LearnerCourseView";
import { InstructorSettings } from "./instructor/Settings";
import { MyCourses as InstructorMyCourses } from "./instructor/MyCourses";
import { Learners } from "./instructor/Learners";
import { Assignments as InstructorAssignments } from "./instructor/Assignments";

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

          {/* Admin routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
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
          {/* Instructor routes */}
          <Route
            path="/instructor/settings"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorMyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/learners"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <Learners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/assignments"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorAssignments />
              </ProtectedRoute>
            }
          />
          {/* Learner routes */}
          <Route
            path="/learner/courses"
            element={
              <ProtectedRoute allowedRoles={["learner"]}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/assignments"
            element={
              <ProtectedRoute allowedRoles={["learner"]}>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/progress"
            element={
              <ProtectedRoute allowedRoles={["learner"]}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/settings"
            element={
              <ProtectedRoute allowedRoles={["learner"]}>
                <LearnerSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learner/course/:courseId"
            element={
              <ProtectedRoute allowedRoles={["learner"]}>
                <LearnerCourseView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
