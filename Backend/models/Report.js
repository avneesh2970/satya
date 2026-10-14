const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"]
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, "File Cloudinary URL is required"]
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"]
    },
    fileType: {
      type: String,
      required: [true, "File type is required"]
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Report", reportSchema);
