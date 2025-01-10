import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Course } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";

interface CourseDetailsProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  isEnrolled: boolean;
  onEnroll: () => void;
}

export function CourseDetails({
  course,
  isOpen,
  onClose,
  isEnrolled,
  onEnroll,
}: CourseDetailsProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { currentUser } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"enroll" | null>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleEnroll = async () => {
    if (!currentUser?.uid) return;

    setEnrolling(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(course.id),
        [`enrolledDates.${course.id}`]: new Date().toISOString(),
        [`courseProgress.${course.id}`]: 0,
      });
      setSuccessMessage(`You have successfully enrolled in "${course.title}"!`);
      setMessageType("enroll");
      setShowSuccessModal(true);
      onEnroll();
      onClose();
    } catch (error) {
      console.error("Error enrolling in course:", error);
    } finally {
      setEnrolling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col"
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Course Image */}
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg"
          />

          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-900">{course.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium text-gray-900">{course.level}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-gray-900">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </p>
            </div>
          </div>

          {/* Duration and Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">
                {course.durationValue} {course.durationType}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="font-medium text-gray-900">{course.instructor}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-600">{course.description}</p>
          </div>

          {/* Course Outline */}
          {course.outlineDescription && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Course Outline
              </h3>
              <p className="text-gray-600 mb-4">{course.outlineDescription}</p>
              <div className="space-y-4">
                {course.outlineItems?.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {item.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="text-gray-600">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Content */}
          {course.content && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Course Content
              </h3>
              <div className="space-y-4">
                {course.content.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enroll Button in Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleEnroll}
            disabled={isEnrolled || enrolling}
            className={`bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition ${
              isEnrolled || enrolling ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {enrolling
              ? "Enrolling..."
              : isEnrolled
              ? "Enrolled"
              : "Enroll Now"}
          </button>
          {isEnrolled && (
            <button
              onClick={() => navigate(`/learner/course/${course.id}`)}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition float-right"
            >
              Continue
            </button>
          )}
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage(null);
        }}
      >
        <h2 className="text-lg font-semibold text-center">{successMessage}</h2>
      </SuccessModal>

      {successMessage && (
        <div
          className={`alert ${
            messageType === "enroll" ? "alert-success" : "alert-danger"
          }`}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
}
