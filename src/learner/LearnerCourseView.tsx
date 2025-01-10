import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import ReactConfetti from "react-confetti";
import CourseContentSidebar from "./CourseContentSidebar";
import { CourseDetails } from "./CourseDetailsLearner";

interface CourseContent {
  title: string;
  videoUrl: string;
  description: string;
}

interface OutlineItem {
  title: string;
  topics: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  durationValue: number;
  durationType: string;
  level: string;
  price: string;
  imageUrl: string;
  outlineDescription: string;
  outlineItems: OutlineItem[];
  content: CourseContent[];
}

interface CompletedLectures {
  [key: string]: boolean;
}

export function LearnerCourseView() {
  const { courseId } = useParams();
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedLectures, setCompletedLectures] = useState<CompletedLectures>(
    {}
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);

  useEffect(() => {
    if (authUser) {
      fetchUserAndCourseData();
    }
  }, [authUser, courseId]);

  // Stop confetti after 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Add video completion tracking
  useEffect(() => {
    const videoElement = document.querySelector("iframe");
    if (videoElement) {
      // Mark lecture as complete when video ends
      videoElement.addEventListener("ended", () => {
        handleLectureCompletion(currentVideoIndex, true);
      });
    }
  }, [currentVideoIndex]);

  const fetchUserAndCourseData = async () => {
    if (!authUser?.uid || !courseId) return;
    try {
      // Fetch user data
      const userDoc = await getDoc(doc(db, "users", authUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: authUser.uid,
          name: userData.name || authUser.displayName || "User",
          email: userData.email || authUser.email || "",
          role: "learner",
          avatar:
            userData.avatar ||
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${userData.name || "User"}`,
        });

        // Set completed lectures
        if (
          userData.completedLectures &&
          userData.completedLectures[courseId]
        ) {
          setCompletedLectures(userData.completedLectures[courseId]);
        }
      }

      // Fetch course data
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        setCourse({
          id: courseDoc.id,
          ...courseDoc.data(),
        } as Course);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLectureCompletion = async (
    lectureIndex: number,
    isComplete: boolean
  ) => {
    if (!authUser?.uid || !courseId) return;
    try {
      const newCompletedLectures = {
        ...completedLectures,
        [lectureIndex]: isComplete,
      };
      setCompletedLectures(newCompletedLectures);

      // Calculate progress based on completed videos
      const totalVideos = course?.content?.length || 0;
      const completedVideos =
        Object.values(newCompletedLectures).filter(Boolean).length;
      const progress =
        totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, {
        [`completedLectures.${courseId}`]: newCompletedLectures,
        [`courseProgress.${courseId}`]: progress,
      });

      // Check if all lectures are completed
      if (completedVideos === totalVideos) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error updating lecture completion:", error);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (course && currentVideoIndex < course.content.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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
          role: "learner",
          avatar:
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${
              authUser.displayName || "User"
            }`,
        }
      }
    >
      {showConfetti && (
        <>
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-12 rounded-lg shadow-lg z-50">
            <h2 className="text-2xl font-bold text-center text-indigo-600">
              🎉 Congratulations! You have completed this course! 🎉
            </h2>
          </div>
        </>
      )}
      <div className="p-6 flex">
        {/* Sidebar Opening Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed right-6 top-24 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 space-y-6 transition-all duration-300 ${
            isSidebarOpen ? "mr-80" : "mr-0"
          }`}
        >
          {loading ? (
            <Loader />
          ) : course ? (
            <div className="space-y-6">
              {/* Course Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.title}
                </h1>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Category: {course.category}</span>
                  <span>
                    Duration: {course.durationValue} {course.durationType}
                  </span>
                  <span>Level: {course.level}</span>
                  <span>
                    Price: {course.price === "0" ? "Free" : `$${course.price}`}
                  </span>
                </div>
              </div>

              {/* Video Player Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-full aspect-video mb-4">
                  {course.content[currentVideoIndex]?.videoUrl && (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                        course.content[currentVideoIndex].videoUrl
                      )}`}
                      title="Course Video"
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Video Navigation */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handlePreviousVideo}
                    disabled={currentVideoIndex === 0}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous Lecture
                  </button>
                  <div className="text-sm text-gray-500">
                    Lecture {currentVideoIndex + 1} of {course.content.length}
                  </div>
                  <button
                    onClick={handleNextVideo}
                    disabled={currentVideoIndex === course.content.length - 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Next Lecture
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>

                {/* Current Lecture Info */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {course.content[currentVideoIndex]?.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {course.content[currentVideoIndex]?.description}
                  </p>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Course Details
                </h2>
                <div className="space-y-6">
                  {/* Description Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Description
                    </h3>
                    <p className="mt-2 text-gray-600">{course.description}</p>
                  </div>

                  {/* Course Outline Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Course Outline
                    </h3>
                    {course.outlineDescription && (
                      <div className="mb-6">
                        <p className="text-gray-600 whitespace-pre-line">
                          {course.outlineDescription}
                        </p>
                      </div>
                    )}

                    {course.outlineItems && course.outlineItems.length > 0 && (
                      <div className="space-y-6">
                        {course.outlineItems.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-6"
                          >
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                              {item.title}
                            </h4>
                            <ul className="list-disc list-inside space-y-2">
                              {item.topics.map((topic, topicIndex) => (
                                <li
                                  key={topicIndex}
                                  className="text-gray-600 pl-2"
                                >
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Course not found</div>
          )}
        </div>

        {/* Sidebar */}
        {isSidebarOpen && (
          <CourseContentSidebar
            content={course?.content || []}
            currentVideoIndex={currentVideoIndex}
            completedLectures={completedLectures}
            handleLectureCompletion={handleLectureCompletion}
            setCurrentVideoIndex={setCurrentVideoIndex}
            onClose={handleCloseSidebar}
            courseId={course?.id ?? ""}
          />
        )}
      </div>

      {course && (
        <CourseDetails
          course={course}
          isOpen={isOpen}
          onClose={handleClose}
          isEnrolled={isUserEnrolled}
        />
      )}
    </DashboardLayout>
  );
}
