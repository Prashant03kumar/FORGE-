import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const MyAccount = () => {
  const { user, setUser } = useAuth();

  // Form data state for editable account details
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    email: "",
  });

  // State for loading animations and UI feedback
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State for profile image preview and display
  const [profileImage, setProfileImage] = useState("/dummy.jpg");

  // Handle text input changes - updates form data when user types in fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts editing
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Handle profile image file selection and upload to backend
  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Show image preview immediately to user
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result);
      };
      reader.readAsDataURL(file);

      // Upload image to backend
      setUploadLoading(true);
      setErrorMessage("");
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", file);

      // Call backend API to update avatar
      // Don't set Content-Type manually - axios will handle it with correct boundary
      const res = await api.patch("/users/update-avatar", formDataToSend);

      // Update user context with new avatar URL from response
      const updatedUser = res.data.data;
      setUser(updatedUser);
      setProfileImage(updatedUser.avatar);
      setSuccessMessage("Profile image updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Image upload failed:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to upload image. Please try again.";
      setErrorMessage(errorMsg);
      // Reset image on error
      setProfileImage(user?.avatar || "/dummy.jpg");
    } finally {
      setUploadLoading(false);
    }
  };

  // Update account details (fullName, email, and bio) on backend
  const handleUpdateDetails = async () => {
    try {
      // Validation: ensure required fields are not empty
      if (!formData.fullName.trim() || !formData.email.trim()) {
        setErrorMessage("Full Name and Email are required!");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Send updated account details to backend
      const res = await api.patch("/users/update-account", {
        fullName: formData.fullName.trim(),
        bio: formData.bio.trim(),
        email: formData.email.trim(),
      });

      // Update user context with new details - response.data.data contains the updated user
      const updatedUser = res.data.data;
      setUser(updatedUser);

      // Update form data with confirmed server values
      setFormData({
        fullName: updatedUser.fullName || "",
        bio: updatedUser.bio || "",
        email: updatedUser.email || "",
      });

      setSuccessMessage("Account details updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to update account details";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Populate form with user data when component mounts or user updates
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.bio || "",
        email: user.email || "",
      });
      // Set profile image from user data or fallback to dummy
      setProfileImage(user.avatar || "/dummy.jpg");
    }
  }, [user]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 transition-all">
      {/* Header Section: Title and Profile Image */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-orange-400 uppercase">
            Warrior Identity
          </h2>
          <p className="text-center text-orange-600 font-semibold text-sm">
            Update your public presence.
          </p>
        </div>

        {/* Profile Image Display */}
        <div className="relative">
          <img
            src={profileImage}
            alt="user_profile"
            className="w-24 h-24 object-cover rounded-xl border border-orange-400/30"
          />
          {uploadLoading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <span className="text-xs text-orange-400 font-semibold">
                Uploading...
              </span>
            </div>
          )}
        </div>

        {/* File input for image upload - triggered by upload button */}
        <input
          type="file"
          id="avatarUpload"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => document.getElementById("avatarUpload")?.click()}
          disabled={uploadLoading}
          className={`px-6 py-2 rounded-xl font-medium transition-all ${
            uploadLoading
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "text-blue-500 hover:text-blue-400 underline cursor-pointer hover:scale-105 duration-200"
          }`}
        >
          {uploadLoading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-600 rounded-xl text-green-400 text-sm">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-xl text-red-400 text-sm">
          ✗ {errorMessage}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Username Display (Read-Only) - user cannot change this */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Warrior Username (Cannot be changed)
          </label>
          <div className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-4 py-3 text-gray-400 opacity-75">
            {user?.username || ""}
          </div>
        </div>

        {/* Full Name Input - user can edit */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full bg-gray-900/80 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all`}
          />
        </div>

        {/* Bio Textarea - user can edit */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Warrior Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself (max 150 characters)"
            rows="4"
            maxLength="150"
            className={`w-full bg-gray-900/80 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all resize-none`}
          />
          <p className="text-xs text-gray-500">
            {formData.bio.length}/150 characters
          </p>
        </div>

        {/* Email Input - user can edit */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`w-full bg-gray-900/80 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all`}
          />
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-center items-center p-2">
          <button
            onClick={handleUpdateDetails}
            disabled={loading}
            className={`p-2 md:px-10 md:py-2.5 cursor-pointer transition transform hover:scale-105 duration-300 rounded-xl font-semibold ${
              loading
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
