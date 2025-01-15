import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext for user data
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  BarChart,
  Settings,
  Video,
  FileText,
  LogOut,
} from "lucide-react"; // Import icons

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const adminNavigation = [
    { icon: Home, label: "Dashboard", path: "/admin-dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: BookOpen, label: "Courses", path: "/admin/courses" },
    { icon: GraduationCap, label: "Instructors", path: "/admin/instructors" },
    { icon: BarChart, label: "Analytics", path: "/admin/analytics" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const studentNavigation = [
    { icon: Home, label: "Dashboard", path: "/learner-dashboard" },
    { icon: BookOpen, label: "My Courses", path: "/learner/courses" },
    { icon: FileText, label: "Assignments", path: "/learner/assignments" },
    { icon: BarChart, label: "Progress", path: "/learner/progress" },
    { icon: Settings, label: "Settings", path: "/learner/settings" },
  ];

  const instructorNavigation = [
    { icon: Home, label: "Dashboard", path: "/instructor-dashboard" },
    { icon: Video, label: "My Courses", path: "/instructor/courses" },
    { icon: Users, label: "Learners", path: "/instructor/learners" },
    { icon: FileText, label: "Assignments", path: "/instructor/assignments" },
    { icon: Settings, label: "Settings", path: "/instructor/settings" },
  ];

  const getNavigationItems = () => {
    switch (currentUser?.role) {
      case "admin":
        return adminNavigation;
      case "instructor":
        return instructorNavigation;
      case "learner":
      default:
        return studentNavigation;
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 absolute top-0 right-0 py-2 px-6 bg-sky-900 rounded-full text-white hover:bg-sky-800 focus:outline-none"
        style={{ borderRadius: "50%" }}
      >
        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="p-4">
            <p className="font-medium text-gray-800">
              {currentUser?.name || "User"}
            </p>
            <p className="text-sm text-gray-500">
              {currentUser?.email || "Email"}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {currentUser?.role || "Role"}
            </p>
          </div>
          <div className="border-t border-gray-200">
            {getNavigationItems().map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="mr-2" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
