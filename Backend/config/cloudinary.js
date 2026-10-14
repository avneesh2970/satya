const cloudinary = require("cloudinary").v2;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
}

/**
 * Upload a file buffer directly to Cloudinary using upload_stream.
 * Storage path format: clinic/patient-reports/{patientId}/{appointmentId}
 */
const uploadToCloudinary = (fileBuffer, folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    const sanitizeFileName = fileName
      ? fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: "auto",
        public_id: sanitizeFileName ? `${Date.now()}_${sanitizeFileName}` : undefined,
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload_stream error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Destroy/delete an asset from Cloudinary using public_id.
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
