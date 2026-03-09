import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Camera, User, Mail, Calendar, ShieldCheck } from "lucide-react";

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullname || authUser.user?.fullname || "");
      setEmail(authUser.email || authUser.user?.email || "");
      setFilePreview(authUser.profilePicture || authUser.user?.profilePicture || null);
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
      setFilePreview(reader.result);
      setFileData(reader.result);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName && !fileData) {
      return toast.error("Nothing to update");
    }
    const payload = {};
    if (fullName) payload.fullname = fullName;
    if (fileData) payload.profilePicture = fileData;

    await updateProfile(payload);
    setFileData(null); // Reset after save
  };

  const triggerFile = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-100 rounded-3xl p-8 shadow-2xl border border-base-200">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary text-transparent bg-clip-text mb-2">
            Your Profile
          </h1>
          <p className="text-base-content/60">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-base-200 flex items-center justify-center overflow-hidden border-4 border-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 group-hover:border-primary/50">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Avatar"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <User className="w-16 h-16 text-base-content/20" />
              )}
            </div>
            
            <button
              type="button"
              onClick={triggerFile}
              className="absolute bottom-0 right-0 bg-primary text-primary-content rounded-full p-2.5 shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
              title="Change avatar"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              onChange={handleFile}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-sm text-base-content/50 mt-4">
            Upload a new avatar. Max size 5MB.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-content/80 ml-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input input-bordered w-full pl-12 bg-base-200/50 focus:bg-base-100 transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-content/80 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type="email"
                value={email}
                readOnly
                className="input input-bordered w-full pl-12 bg-base-200/50 text-base-content/60 cursor-not-allowed"
                placeholder="Your email address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="btn btn-primary w-full mt-2 shadow-lg shadow-primary/20"
          >
            {isUpdatingProfile ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>

        {/* Account Info Section */}
        <div className="mt-8 pt-8 border-t border-base-200">
          <h3 className="text-sm font-semibold text-base-content/80 mb-4 px-1">
            Account Details
          </h3>
          <div className="bg-base-200/50 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base-content/70">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <span className="text-sm font-medium">
                {authUser?.createdAt
                  ? new Date(authUser.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base-content/70">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm">Account Status</span>
              </div>
              <div className="badge badge-success badge-sm py-2.5 gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Active
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
