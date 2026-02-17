import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Takes local file path
// Uploads file to Cloudinary

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_API_KEY) {
      console.error("❌ CLOUDINARY_API_KEY is not set");
      throw new Error("Cloudinary API key not configured");
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("❌ CLOUDINARY_CLOUD_NAME is not set");
      throw new Error("Cloudinary cloud name not configured");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "forge/avatars",
    });
    console.log("File uploaded on cloudinary. File src: " + response.url);
    // once the file is uploaded we would like to delete it from our server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("🔥 Cloudinary upload error:", error.message);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary. Public id", publicId);
    return result;
  } catch (error) {
    console.log("❌ Error deleting from cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
