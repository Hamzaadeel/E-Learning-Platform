import React from "react";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignUp = () => {
    navigate("/register");
    onClose();
  };

  const handleLogin = () => {
    navigate("/login");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm md:max-w-md lg:max-w-lg p-6 mx-4">
        <h2 className="text-xl font-bold mb-4">Enroll in Course</h2>
        <p className="mb-4">
          You need to sign up or log in to enroll in courses.
        </p>
        <div className="flex flex-col md:flex-row justify-between">
          <button
            onClick={handleSignUp}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors mb-2 md:mb-0 md:mr-2"
          >
            Sign Up
          </button>
          <button
            onClick={handleLogin}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
          >
            Log In
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
