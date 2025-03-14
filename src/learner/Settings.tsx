import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { Loader } from "../components/Loader";
import {
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

export function Settings() {
  const { currentUser: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    currentPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUserData = useCallback(async () => {
    if (!authUser?.uid) return;
    try {
      const userRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: authUser.uid,
          name: userData.name || authUser.displayName || "User",
          email: userData.email || authUser.email || "",
          role: "learner",
          avatar:
            userData.avatar ||
            authUser.photoURL ||
            `https://ui-avatars.com/api/?name=${userData.name || "User"}`,
        };
        setUser(user);
        setFormData((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleReauthenticate = async (currentPassword: string) => {
    if (!authUser?.email) return false;
    try {
      const credential = EmailAuthProvider.credential(
        authUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(authUser, credential);
      return true;
    } catch (error) {
      console.error("Reauthentication failed:", error);
      setError("Current password is incorrect");
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authUser?.uid) return;
    setError("");
    setSuccess("");

    try {
      setSaving(true);
      const userRef = doc(db, "users", authUser.uid);

      // Update email if changed
      if (formData.email !== user?.email && formData.currentPassword) {
        const isAuthenticated = await handleReauthenticate(
          formData.currentPassword
        );
        if (isAuthenticated) {
          await updateEmail(authUser, formData.email);
          await updateDoc(userRef, { email: formData.email });
        }
      }

      // Refresh user data
      await fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
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
      <div className="p-6 flex justify-start">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          {loading ? (
            <Loader />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
