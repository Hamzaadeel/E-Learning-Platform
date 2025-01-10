import React, { useState } from "react";
import { User } from "../types";
import {
  Home,
  BookOpen,
  Users,
  Settings,
  BarChart,
  Video,
  GraduationCap,
  FileText,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  user: User;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, className }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const adminNavigation = [
    { icon: Home, label: "Dashboard", path: "/admin-dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: BookOpen, label: "Courses", path: "/admin/courses" },
    { icon: GraduationCap, label: "Instructors", path: "/admin/instructors" },
    { icon: BarChart, label: "Analytics", path: "/admin/analytics" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const menuItems = {
    learner: [
      { icon: Home, label: "Dashboard", path: "/learner-dashboard" },
      { icon: BookOpen, label: "My Courses", path: "/learner/courses" },
      { icon: FileText, label: "Assignments", path: "/learner/assignments" },
      { icon: BarChart, label: "Progress", path: "/learner/progress" },
      { icon: Settings, label: "Settings", path: "/learner/settings" },
    ],
    instructor: [
      { icon: Home, label: "Dashboard", path: "/instructor-dashboard" },
      { icon: Video, label: "My Courses", path: "/instructor/courses" },
      { icon: Users, label: "Students", path: "/instructor/students" },
      { icon: FileText, label: "Assignments", path: "/instructor/assignments" },
      { icon: DollarSign, label: "Earnings", path: "/instructor/earnings" },
      { icon: Settings, label: "Settings", path: "/instructor/settings" },
    ],
    admin: adminNavigation,
  };

  const items = menuItems[user.role] || menuItems.learner;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-600 hover:text-gray-800"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      <div
        className={`fixed inset-y-0 left-0 bg-white h-screen shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:w-64 ${className}`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <GraduationCap className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-800">
            E-Learning Platform
          </span>
        </div>

        <div className="p-4">
          <button
            onClick={() =>
              navigate(
                user.role === "admin"
                  ? "/admin-dashboard"
                  : `/${user.role}-dashboard`
              )
            }
            className="flex items-center space-x-3 mb-6 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src={
                user.avatar ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&facepad=2&w=256&h=256&q=80"
              }
              alt={user.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="text-left">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
          </button>

          <nav className="space-y-1">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
