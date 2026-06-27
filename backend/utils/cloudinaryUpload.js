import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Upload a local file to Cloudinary, then delete the temp file.
 * @param {string} localFilePath  - path written by Multer
 * @param {string} folder         - Cloudinary folder name
 * @returns {Promise<string>}     - secure URL
 */
export const uploadToCloudinary = async (localFilePath, folder = 'catnet') => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'image',
      transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
    });

    // Remove temp file regardless of success
    fs.unlinkSync(localFilePath);

    return result.secure_url;
  } catch (error) {
    // Clean up temp file even on failure
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary by its URL.
 * @param {string} imageUrl - full Cloudinary secure_url
 */


export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("cloudinary")) return;

    const uploadIndex = imageUrl.indexOf("/upload/");

    if (uploadIndex === -1) return;

    // Everything after /upload/
    let publicId = imageUrl.substring(uploadIndex + 8);

    // Remove version (e.g. v1712345678/)
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};