const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendNotification, notifyAdmins } = require("../utils/notificationHelper");
const Physiotherapist = require("../models/Physiotherapist");

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

// Helper to send token response with cookie
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  };

  res
    .status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || user.profilePhoto || "",
        address: user.address || "",
        registrationStatus: user.registrationStatus || "INCOMPLETE",
        approvalStatus: user.approvalStatus || "PENDING",
        isApproved: user.isApproved || false,
        rejectionReason: user.rejectionReason || null
      }
    });
};

// @desc    Register a new user account (patient, physio, or doctor)
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = "patient" } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone, and password"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const validRole = ["doctor", "admin", "patient", "physio"].includes(role) ? role : "patient";

    const userPayload = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      role: validRole
    };

    if (validRole === "physio") {
      userPayload.registrationStatus = "INCOMPLETE";
      userPayload.approvalStatus = "PENDING";
      userPayload.isApproved = false;
    }

    const user = await User.create(userPayload);

    if (validRole === "doctor") {
      await Physiotherapist.create({
        user: user._id,
        name: user.name.startsWith("Dr.") ? user.name : `Dr. ${user.name}`,
        email: user.email,
        phone: user.phone,
        qualification: "MPT (Orthopedic Rehabilitation)",
        experienceYears: 8,
        specialization: "Spine & Joint Rehabilitation",
        servicesOffered: ["Orthopedic Rehabilitation", "Sports Injury Care", "Post-Operative Rehab", "Spine Therapy", "Home Physiotherapy"],
        consultationFee: "₹800",
        bio: "Dedicated physical therapy specialist focused on evidence-based non-surgical recovery."
      });
    }

    sendTokenResponse(user, 201, res, "Account registered successfully!");
  } catch (error) {
    next(error);
  }
};

// @desc    Login patient / user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    sendTokenResponse(user, 200, res, "Login successful!");
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  res.cookie("jwt", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

// @desc    Get current logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (phone) fieldsToUpdate.phone = phone;
    if (address !== undefined) fieldsToUpdate.address = address;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    await sendNotification({
      userId: req.user.id,
      title: "Profile Updated",
      message: "Your profile details have been updated successfully.",
      type: "system"
    }).catch(err => console.error("Notification error:", err));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password"
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password"
      });
    }

    user.password = newPassword;
    await user.save();

    await sendNotification({
      userId: req.user.id,
      title: "Password Changed",
      message: "Your account password was changed successfully.",
      type: "system"
    }).catch(err => console.error("Notification error:", err));

    sendTokenResponse(user, 200, res, "Password changed successfully!");
  } catch (error) {
    next(error);
  }
};

// @desc    Complete Professional Physio Registration
// @route   POST /api/v1/auth/physio-registration
// @access  Private (Physio)
const completePhysioRegistration = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "physio" && user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only physio accounts can complete professional registration" });
    }

    const {
      qualification,
      specialization,
      experience,
      registrationNumber,
      registrationAuthority,
      clinicName,
      city,
      address,
      consultationType,
      languages,
      bio,
      areasOfExpertise
    } = req.body;

    if (!qualification || !specialization || !experience || !registrationNumber || !registrationAuthority || !city || !consultationType) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required professional and practice details."
      });
    }

    // Helper to upload file buffer safely
    const handleFileUpload = async (file, folderName) => {
      if (!file) return "";
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const { uploadToCloudinary } = require("../config/cloudinary");
          const result = await uploadToCloudinary(file.buffer, folderName, file.originalname);
          return result.secure_url;
        }
      } catch (err) {
        console.error("Cloudinary upload failed, using local disk fallback:", err.message);
      }
      // Local fallback
      const fs = require("fs");
      const path = require("path");
      const uploadDir = path.join(__dirname, "../uploads/physio-docs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const destPath = path.join(uploadDir, filename);
      fs.writeFileSync(destPath, file.buffer);
      return `/uploads/physio-docs/${filename}`;
    };

    let regCertUrl = user.registrationCertificate || "";
    let profilePhotoUrl = user.profilePhoto || user.avatar || "";
    let certUrls = user.certifications || [];

    if (req.files) {
      if (req.files.registrationCertificate && req.files.registrationCertificate[0]) {
        regCertUrl = await handleFileUpload(req.files.registrationCertificate[0], "clinic/physio-certificates");
      }
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        profilePhotoUrl = await handleFileUpload(req.files.profilePhoto[0], "clinic/physio-avatars");
      }
      if (req.files.certifications && req.files.certifications.length > 0) {
        const uploadedCerts = await Promise.all(
          req.files.certifications.map(f => handleFileUpload(f, "clinic/physio-certifications"))
        );
        certUrls = [...certUrls, ...uploadedCerts.filter(Boolean)];
      }
    }

    const parseArrayField = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          return val.split(",").map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    user.qualification = qualification;
    user.specialization = specialization;
    user.experience = Number(experience) || 0;
    user.registrationNumber = registrationNumber;
    user.registrationAuthority = registrationAuthority;
    user.clinicName = clinicName || "";
    user.city = city;
    user.address = address || "";
    user.consultationType = consultationType;
    user.languages = parseArrayField(languages);
    user.bio = bio || "";
    user.areasOfExpertise = parseArrayField(areasOfExpertise);

    if (regCertUrl) user.registrationCertificate = regCertUrl;
    if (profilePhotoUrl) {
      user.profilePhoto = profilePhotoUrl;
      user.avatar = profilePhotoUrl;
    }
    if (certUrls.length > 0) user.certifications = certUrls;

    user.registrationStatus = "COMPLETED";
    user.approvalStatus = "PENDING";
    user.isApproved = false;
    user.rejectionReason = null;

    await user.save();

    // Send notifications
    await sendNotification({
      userId: user._id,
      title: "Registration Submitted Successfully",
      message: "Your professional details and certificates have been submitted for verification. Your application is currently under Admin review.",
      type: "system"
    }).catch(err => console.error("Notification error:", err));

    await notifyAdmins({
      title: "New Physiotherapist Registration",
      message: `${user.name} (${user.email}) has submitted their professional registration and is waiting for Admin approval.`,
      type: "system"
    }).catch(err => console.error("Admin notification error:", err));

    res.status(200).json({
      success: true,
      message: "Professional details submitted successfully and are currently under Admin review.",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  completePhysioRegistration
};
