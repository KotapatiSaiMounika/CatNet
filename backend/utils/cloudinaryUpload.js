import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Network-level failures are usually transient (a brief Wi-Fi/routing blip)
// and worth retrying automatically. Errors like "invalid file format" are
// not — retrying those would just waste time on a request that will never
// succeed, so we only retry on the specific transient error codes below.
const isTransientNetworkError = (error) =>
  ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN'].includes(error?.code) ||
  (error?.errors ?? []).some((e) =>
    ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN'].includes(e?.code)
  );

/**
 * Upload a local file to Cloudinary, then delete the temp file.
 * Retries automatically on transient network errors before giving up.
 * @param {string} localFilePath  - path written by Multer
 * @param {string} folder         - Cloudinary folder name
 * @returns {Promise<string>}     - secure URL
 */
export const uploadToCloudinary = async (localFilePath, folder = 'catnet') => {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
      });

      // Remove temp file only once the upload has actually succeeded
      if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

      return result.secure_url;
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxAttempts;
      if (!isTransientNetworkError(error) || isLastAttempt) {
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        throw error;
      }

      console.warn(
        `Cloudinary upload attempt ${attempt} failed with a transient network error, retrying...`
      );
      await sleep(attempt * 1000); // 1s, then 2s before the next attempt
    }
  }

  throw lastError;
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