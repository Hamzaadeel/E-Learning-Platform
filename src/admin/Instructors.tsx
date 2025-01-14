import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Instructor {
  id: string;
  email: string;
  createdAt: string;
  name: string;
  role: string;
  password?: string;
}

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor?: Instructor;
  onSubmit: (data: Omit<Instructor, "id" | "createdAt">) => Promise<void>;
  title: string;
  submitLabel: string;
}

function InstructorModal({
  isOpen,
  onClose,
  instructor,
  onSubmit,
  title,
  submitLabel,
}: InstructorModalProps) {
  const [formData, setFormData] = useState({
    name: instructor?.name || "",
    email: instructor?.email || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (instructor) {
      setFormData({
        name: instructor.name,
        email: instructor.email,
        password: "",
      });
    }
  }, [instructor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      (!instructor && !formData.password)
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      await onSubmit({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "instructor",
      });
      onClose();
    } catch (error) {
      console.error("Error saving instructor:", error);
      setError("Failed to save instructor");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {!instructor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

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
              {saving ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Instructors() {
  const { currentUser: authUser } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [sortField, setSortField] = useState<"name" | "createdAt">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchInstructors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const instructorsData = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Instructor)
        )
        .filter((user) => user.role === "instructor");
      setInstructors(instructorsData);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = useCallback(async () => {
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
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      Promise.all([fetchUserData(), fetchInstructors()]);
    }
  }, [authUser, fetchUserData]);

  const handleAddInstructor = async (
    data: Omit<Instructor, "id" | "createdAt">
  ) => {
    try {
      // Generate a unique ID for the new instructor
      const instructorId = crypto.randomUUID();

      // Add user directly to Firestore
      const userRef = doc(db, "users", instructorId);
      await setDoc(userRef, {
        name: data.name,
        email: data.email,
        role: "instructor",
        createdAt: new Date().toISOString(),
      });

      // Fetch the updated list of instructors
      await fetchInstructors();

      // Set success message
      setSuccessMessage("Saved changes");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error adding instructor:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to add instructor");
    }
  };

  const handleEditInstructor = async (
    data: Omit<Instructor, "id" | "createdAt">
  ) => {
    if (!editingInstructor) return;

    try {
      const userRef = doc(db, "users", editingInstructor.id);
      await updateDoc(userRef, {
        name: data.name,
        email: data.email,
      });

      await fetchInstructors();
      setSuccessMessage("Saved changes");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error updating instructor:", error);
      throw new Error("Failed to update instructor");
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      await fetchInstructors();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting instructor:", error);
    }
  };

  const formatDate = (createdAt: string | { seconds: number }) => {
    if (!createdAt) return "N/A";

    let date;
    if (typeof createdAt === "object" && "seconds" in createdAt) {
      date = new Date(createdAt.seconds * 1000);
    } else if (typeof createdAt === "string") {
      date = new Date(createdAt);
    } else {
      return "N/A";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const closeMessage = () => {
    setSuccessMessage(null);
  };

  const filteredAndSortedInstructors = instructors
    .filter((instructor) => {
      const matchesName = instructor.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const matchesEmail = instructor.email
        .toLowerCase()
        .includes(filterEmail.toLowerCase());
      return matchesName && matchesEmail;
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortField === "name") {
        return a.name.localeCompare(b.name) * direction;
      } else {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          direction
        );
      }
    });

  const paginatedInstructors = filteredAndSortedInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Instructors</h1>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Instructor
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col md:flex-row md:justify-between">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Filter by Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              placeholder="Filter by Email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={sortField}
              onChange={(e) =>
                setSortField(e.target.value as "name" | "createdAt")
              }
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Joining Date</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) =>
                setSortDirection(e.target.value as "asc" | "desc")
              }
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInstructors.map((instructor, index) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {instructor.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {instructor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(instructor.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingInstructor(instructor)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(instructor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alert Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 mb-4 p-3 bg-green-100 text-green-700 rounded-lg shadow-md flex items-center">
          <span>{successMessage}</span>
          <button
            onClick={closeMessage}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            &times;
          </button>
        </div>
      )}

      {/* Add Instructor Modal */}
      <InstructorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddInstructor}
        title="Add Instructor"
        submitLabel="Add Instructor"
      />

      {/* Edit Instructor Modal */}
      {editingInstructor && (
        <InstructorModal
          isOpen={!!editingInstructor}
          onClose={() => setEditingInstructor(null)}
          instructor={editingInstructor}
          onSubmit={handleEditInstructor}
          title="Edit Instructor"
          submitLabel="Save Changes"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Instructor
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this instructor? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInstructor(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="mx-4">
          Page {currentPage} of{" "}
          {Math.ceil(filteredAndSortedInstructors.length / itemsPerPage)}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(filteredAndSortedInstructors.length / itemsPerPage)
              )
            )
          }
          disabled={
            currentPage ===
            Math.ceil(filteredAndSortedInstructors.length / itemsPerPage)
          }
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </DashboardLayout>
  );
}
