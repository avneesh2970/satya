const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ""
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      default: "Orthopedic Rehabilitation"
    },
    specialist: {
      type: String,
      default: "Dr. Satya Prakash"
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"]
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      default: "10:00 AM"
    },
    appointmentType: {
      type: String,
      enum: ["clinic", "home", "online-request"],
      default: "clinic"
    },
    homeAddress: {
      type: String,
      default: ""
    },
    cityArea: {
      type: String,
      default: ""
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: [
        "PENDING_ADMIN_APPROVAL",
        "PENDING_PHYSIOTHERAPIST_APPROVAL",
        "REJECTED_BY_ADMIN",
        "CONFIRMED",
        "REJECTED_BY_PHYSIOTHERAPIST",
        "RESCHEDULED",
        "upcoming",
        "completed",
        "cancelled"
      ],
      default: "PENDING_ADMIN_APPROVAL"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    physiotherapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Physiotherapist",
      required: false
    },
    adminApprovedAt: {
      type: Date
    },
    adminRejectedAt: {
      type: Date
    },
    adminRejectionReason: {
      type: String,
      default: ""
    },
    physiotherapistApprovedAt: {
      type: Date
    },
    physiotherapistRejectedAt: {
      type: Date
    },
    physiotherapistRejectionReason: {
      type: String,
      default: ""
    },
    isReadAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
