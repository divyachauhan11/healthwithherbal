const cloudinary = require("cloudinary").v2;
const config = require("../config");
const placeholderValues = new Set([
  "your_cloudinary_cloud_name",
  "your_cloudinary_api_key",
  "your_cloudinary_api_secret",
  "replace_with_cloud_name",
  "your_cloud_name",
  "your_api_key",
  "your_api_secret",
]);

function getCloudinaryCredentials() {
  return {
    cloud_name: config.cloudinaryCloudName.trim(),
    api_key: config.cloudinaryApiKey.trim(),
    api_secret: config.cloudinaryApiSecret.trim(),
  };
}

function hasCredentials(credentials) {
  return Object.values(credentials).every(Boolean);
}

function credentialsAreConfigured(credentials) {
  return (
    hasCredentials(credentials) &&
    Object.values(credentials).every((value) => !placeholderValues.has(value))
  );
}

/**
 * Configure Cloudinary with environment variables
 */
function configureCloudinary() {
  const credentials = getCloudinaryCredentials();

  if (hasCredentials(credentials)) {
    cloudinary.config({
      ...credentials,
      secure: true,
    });
    return true;
  }
  return false;
}

/**
 * Check if Cloudinary credentials are validly provided
 */
function isCloudinaryConfigured() {
  return credentialsAreConfigured(getCloudinaryCredentials());
}

/**
 * Upload an in-memory file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - Additional upload options (folder, tags, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          "Cloudinary credentials are missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your backend .env file."
        )
      );
    }

    configureCloudinary();

    const uploadOptions = {
      folder: config.cloudinaryFolder,
      resource_type: "image",
      fetch_format: "auto",
      quality: "auto",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload a local file by path to Cloudinary (useful for migrations/seeds)
 * @param {string} filePath - Absolute path to local image file
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
async function uploadFilePathToCloudinary(filePath, options = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials are missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your backend .env file."
    );
  }

  configureCloudinary();

  const uploadOptions = {
    folder: config.cloudinaryFolder,
    resource_type: "image",
    fetch_format: "auto",
    quality: "auto",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    ...options,
  };

  return cloudinary.uploader.upload(filePath, uploadOptions);
}

/**
 * Delete an image from Cloudinary by its public ID
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
async function deleteFromCloudinary(publicId) {
  if (!isCloudinaryConfigured() || !publicId) return null;
  configureCloudinary();
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Extract the public_id from a Cloudinary URL
 * @param {string} cloudinaryUrl
 * @returns {string|null}
 */
function extractPublicId(cloudinaryUrl) {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") return null;
  // Match path after /upload/ (skipping transformation or version tags like v123456789/)
  const match = cloudinaryUrl.match(/\/upload\/(?:[^\/]+\/)?(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
}

/**
 * Test ping connection to Cloudinary
 * @returns {Promise<Object>}
 */
async function testConnection() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials are not set in the environment (.env)."
    );
  }
  configureCloudinary();
  return cloudinary.api.ping();
}

module.exports = {
  cloudinary,
  configureCloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadFilePathToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  testConnection,
};
