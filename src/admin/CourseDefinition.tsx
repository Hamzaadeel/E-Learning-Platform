import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Plus, Trash2, X } from "lucide-react";

interface CourseContent {
  title: string;
  videoUrl: string;
  description: string;
}

interface OutlineItem {
  title: string;
  topics: string[];
}

interface CourseDefinitionProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDefinition({
  courseId,
  isOpen,
  onClose,
}: CourseDefinitionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    duration: "",
    imageUrl: "",
    outlineDescription: "",
    outlineItems: [] as OutlineItem[],
    content: [] as CourseContent[],
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          category: courseData.category || "",
          level: courseData.level || "",
          price: courseData.price || "",
          duration: courseData.duration || "",
          imageUrl: courseData.imageUrl || "",
          outlineDescription: courseData.outlineDescription || "",
          outlineItems: courseData.outlineItems || [],
          content: courseData.content || [],
        });
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to fetch course data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOutlineItem = () => {
    setFormData({
      ...formData,
      outlineItems: [...formData.outlineItems, { title: "", topics: [""] }],
    });
  };

  const handleRemoveOutlineItem = (index: number) => {
    const newOutlineItems = [...formData.outlineItems];
    newOutlineItems.splice(index, 1);
    setFormData({ ...formData, outlineItems: newOutlineItems });
  };

  const handleOutlineItemChange = (
    index: number,
    field: keyof OutlineItem,
    value: string | string[]
  ) => {
    const newOutlineItems = [...formData.outlineItems];
    newOutlineItems[index] = {
      ...newOutlineItems[index],
      [field]: value,
    };
    setFormData({ ...formData, outlineItems: newOutlineItems });
  };

  const handleAddTopic = (outlineIndex: number) => {
    const newOutlineItems = [...formData.outlineItems];
    newOutlineItems[outlineIndex].topics.push("");
    setFormData({ ...formData, outlineItems: newOutlineItems });
  };

  const handleRemoveTopic = (outlineIndex: number, topicIndex: number) => {
    const newOutlineItems = [...formData.outlineItems];
    newOutlineItems[outlineIndex].topics.splice(topicIndex, 1);
    setFormData({ ...formData, outlineItems: newOutlineItems });
  };

  const handleTopicChange = (
    outlineIndex: number,
    topicIndex: number,
    value: string
  ) => {
    const newOutlineItems = [...formData.outlineItems];
    newOutlineItems[outlineIndex].topics[topicIndex] = value;
    setFormData({ ...formData, outlineItems: newOutlineItems });
  };

  const handleAddContent = () => {
    setFormData({
      ...formData,
      content: [
        ...formData.content,
        { title: "", videoUrl: "", description: "" },
      ],
    });
  };

  const handleRemoveContent = (index: number) => {
    const newContent = [...formData.content];
    newContent.splice(index, 1);
    setFormData({ ...formData, content: newContent });
  };

  const handleContentChange = (
    index: number,
    field: keyof CourseContent,
    value: string
  ) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData({ ...formData, content: newContent });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);
      await setDoc(doc(db, "courses", courseId), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error saving course:", error);
      setError("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Course Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter course image URL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 8 weeks"
                    required
                  />
                </div>
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>

              {/* Course Outline */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Course Outline
                </h3>

                {/* Outline Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outline Description
                  </label>
                  <textarea
                    value={formData.outlineDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outlineDescription: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Add a general description of the course outline..."
                  />
                </div>

                {/* Outline Items */}
                <div className="space-y-4">
                  {formData.outlineItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              handleOutlineItemChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Section title (e.g., Week 1: Introduction)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOutlineItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Topics */}
                      <div className="space-y-2 pl-4">
                        {item.topics.map((topic, topicIndex) => (
                          <div
                            key={topicIndex}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="text"
                              value={topic}
                              onChange={(e) =>
                                handleTopicChange(
                                  index,
                                  topicIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Topic"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveTopic(index, topicIndex)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddTopic(index)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Topic
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddOutlineItem}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Section
                  </button>
                </div>
              </div>

              {/* Course Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Course Content
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddContent}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.content.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-700">
                          Content #{index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveContent(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter content title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video URL
                          </label>
                          <input
                            type="url"
                            value={item.videoUrl}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "videoUrl",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter YouTube video URL"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleContentChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={2}
                            placeholder="Enter content description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
