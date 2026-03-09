import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      // Fix: Use correct property name (fullname instead of fullName) based on Navbar
      setFullName(authUser.fullname || authUser.user?.fullname || "");
      setEmail(authUser.email || authUser.user?.email || "");
      setFilePreview(authUser.profilePic || authUser.user?.profilePic || null);
    }
  }, [authUser]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast.error("File size must be less than 5MB");
    }

    const reader = new FileReader();
    reader.onload = () => {
      // reader.result contains the base64 encoded image
      setFilePreview(reader.result);
      setFileData(reader.result); // base64 string ready to send
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file); // Converts to base64
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName && !fileData) {
      return toast.error("Nothing to update");
    }
    const payload = {};
    if (fullName) payload.fullname = fullName; // Send as fullname to match backend expectation
    if (fileData) payload.profilePic = fileData;

    await updateProfile(payload);
  };

  const triggerFile = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6 pt-24 transition-colors duration-300">
      <div className="w-full max-w-md bg-base-200 p-8 rounded-2xl border border-base-300 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Profile</h1>
          <p className="text-base-content/60 text-sm">
            Your profile information
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-base-300 flex items-center justify-center overflow-hidden border-4 border-base-100 shadow-sm">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-5xl">👤</div>
              )}
            </div>
            <button
              type="button"
              onClick={triggerFile}
              className="absolute bottom-0 right-0 bg-primary text-primary-content rounded-full p-2.5 hover:bg-primary/80 transition-colors shadow-md border-2 border-base-100"
              title="Change photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              onChange={handleFile}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>

          <p className="text-sm text-base-content/60 mb-8">
            Click the camera icon to update your photo
          </p>

          <form onSubmit={handleSave} className="w-full space-y-5">
            <div>
              <label className="block text-base-content/80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-xl text-base-content placeholder-base-content/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-base-content/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                value={email}
                readOnly
                className="w-full px-4 py-3 bg-base-300/50 border border-base-300 rounded-xl text-base-content/60 cursor-not-allowed focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary mt-8"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div className="w-full mt-10 pt-8 border-t border-base-300">
            <h3 className="font-semibold text-base-content mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
                <span className="text-base-content/80">Member Since</span>
                <span className="text-base-content font-medium">
                  {authUser?.createdAt
                    ? new Date(authUser.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
                <span className="text-base-content/80">Account Status</span>
                <span className="text-success font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
