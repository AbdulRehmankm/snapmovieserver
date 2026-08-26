import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary Accounts
const cloudinaryAccounts = {
  1: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  2: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_2,
    api_key: process.env.CLOUDINARY_API_KEY_2,
    api_secret: process.env.CLOUDINARY_API_SECRET_2,
  },
};

// Upload a single image
export const uploadToCloudinary = (filePath, account = 1) => {
  // Use selected account (defaults to Account 1)
  cloudinary.config(cloudinaryAccounts[account] || cloudinaryAccounts[1]);

  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return reject(new Error("File does not exist at path: " + filePath));
    }

    cloudinary.uploader.upload(filePath, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return reject(new Error("Cloudinary upload error: " + error.message));
      }

      // Delete local file after successful upload
      fs.unlinkSync(filePath);

      // Return the full Cloudinary response if you need more details
      resolve(result.secure_url);
    });
  });
};

// Upload multiple images
export const uploadMultipleToCloudinary = (filePaths, account = 1) => {
  return Promise.all(
    filePaths.map((filePath) => uploadToCloudinary(filePath, account))
  )
    .then((results) => results)
    .catch((error) => {
      throw new Error(
        "Cloudinary multiple upload error: " + error.message
      );
    });
};
