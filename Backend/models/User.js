const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },
    avatar: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "physio"],
      default: "patient"
    },
    // Physio Professional Registration & Approval Fields
    qualification: { type: String, default: "" },
    specialization: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    registrationNumber: { type: String, default: "" },
    registrationAuthority: { type: String, default: "" },
    clinicName: { type: String, default: "" },
    city: { type: String, default: "" },
    consultationType: { type: String, default: "" },
    registrationCertificate: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    certifications: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    bio: { type: String, default: "" },
    areasOfExpertise: { type: [String], default: [] },
    registrationStatus: {
      type: String,
      enum: ["INCOMPLETE", "COMPLETED"],
      default: "INCOMPLETE"
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String,
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
