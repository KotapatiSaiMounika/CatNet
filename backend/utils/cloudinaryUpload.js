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
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;

    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/<public_id>.ext
    const parts = imageUrl.split('/');
    const fileWithExt = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileWithExt.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};