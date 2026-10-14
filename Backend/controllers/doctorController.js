const Physiotherapist = require("../models/Physiotherapist");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotification, notifyAdmins, resolvePatientUserId } = require("../utils/notificationHelper");

// @desc    Get logged-in doctor's clinical profile
// @route   GET /api/v1/doctor/profile
// @access  Private (Doctor/Admin)
const getDoctorProfile = async (req, res, next) => {
  try {
    let doctor = await Physiotherapist.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }]
    });

    // If profile doesn't exist yet, create default linked profile
    if (!doctor) {
      doctor = await Physiotherapist.create({
        user: req.user._id,
        name: req.user.name.startsWith("Dr.") ? req.user.name : `Dr. ${req.user.name}`,
        email: req.user.email,
        phone: req.user.phone,
        qualification: req.user.qualification || "MPT (Orthopedic Rehabilitation)",
        experienceYears: req.user.experience || 8,
        specialization: req.user.specialization || "Spine & Joint Rehabilitation",
        avatar: req.user.profilePhoto || req.user.avatar || "",
        servicesOffered: [
          "Orthopedic Rehabilitation",
          "Sports Injury Care",
          "Post-Operative Rehab",
          "Spine Therapy",
          "Home Physiotherapy"
        ],
        consultationFee: "₹800",
        availableSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"],
        bio: req.user.bio || "Dedicated physical therapy specialist focused on evidence-based non-surgical recovery."
      });
    } else {
      // Sync photo if user profile has photo but physiotherapist avatar is empty
      if ((req.user.profilePhoto || req.user.avatar) && !doctor.avatar) {
        doctor.avatar = req.user.profilePhoto || req.user.avatar;
        await doctor.save();
      }
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor clinical profile & availability
// @route   PUT /api/v1/doctor/profile
// @access  Private (Doctor/Admin)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      qualification,
      experienceYears,
      specialization,
      servicesOffered,
      consultationFee,
      availableSlots,
      bio,
      name,
      avatar,
      profilePhoto,
      removeAvatar
    } = req.body;

    let photoUrl = avatar || profilePhoto;
    const isRemoving = removeAvatar === true || removeAvatar === "true" || avatar === "";

    // Handle uploaded file if attached (multipart/form-data)
    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/physio-avatars", req.file.originalname);
        photoUrl = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary doctor avatar upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/physio-avatars");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `avatar-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        photoUrl = `/uploads/physio-avatars/${filename}`;
      }
    }

    const fieldsToUpdate = {};
    if (qualification !== undefined) fieldsToUpdate.qualification = qualification;
    if (experienceYears !== undefined) fieldsToUpdate.experienceYears = Number(experienceYears);
    if (specialization !== undefined) fieldsToUpdate.specialization = specialization;
    if (servicesOffered !== undefined) fieldsToUpdate.servicesOffered = Array.isArray(servicesOffered) ? servicesOffered : servicesOffered.split(',').map(s => s.trim());
    if (consultationFee !== undefined) fieldsToUpdate.consultationFee = consultationFee;
    if (availableSlots !== undefined) fieldsToUpdate.availableSlots = Array.isArray(availableSlots) ? availableSlots : availableSlots.split(',').map(s => s.trim());
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (name !== undefined) fieldsToUpdate.name = name;

    if (isRemoving && !req.file) {
      fieldsToUpdate.avatar = "";
    } else if (photoUrl) {
      fieldsToUpdate.avatar = photoUrl;
    }

    let doctor = await Physiotherapist.findOneAndUpdate(
      { $or: [{ user: req.user._id }, { email: req.user.email }] },
      fieldsToUpdate,
      { new: true, upsert: true, runValidators: true }
    );

    const userFields = {};
    if (name !== undefined) userFields.name = name;
    if (qualification !== undefined) userFields.qualification = qualification;
    if (specialization !== undefined) userFields.specialization = specialization;
    if (experienceYears !== undefined) userFields.experience = Number(experienceYears);
    if (bio !== undefined) userFields.bio = bio;

    if (isRemoving && !req.file) {
      userFields.avatar = "";
      userFields.profilePhoto = "";
    } else if (photoUrl) {
      userFields.avatar = photoUrl;
      userFields.profilePhoto = photoUrl;
    }

    if (Object.keys(userFields).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userFields, { new: true }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Doctor profile & photo updated successfully!",
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments assigned to doctor or overall clinic list
// @route   GET /api/v1/doctor/appointments
// @access  Private (Doctor/Admin)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Physiotherapist.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }]
    });
    const doctorName = doctor ? doctor.name : req.user.name;

    // Physiotherapist MUST NEVER see PENDING_ADMIN_APPROVAL, REJECTED_BY_ADMIN, or another doctor's appointments
    let query = {
      status: { $nin: ["PENDING_ADMIN_APPROVAL", "REJECTED_BY_ADMIN"] }
    };

    if (req.user.role === "doctor" || req.user.role === "physio") {
      const cleanName = req.user.name.replace(/^Dr\.\s*/i, "").trim();
      const orConditions = [
        { specialist: doctorName },
        { specialist: { $regex: cleanName, $options: "i" } }
      ];
      if (doctor) {
        orConditions.push({ physiotherapistId: doctor._id });
        if (doctor.name) {
          orConditions.push({ specialist: doctor.name });
          orConditions.push({ specialist: { $regex: doctor.name.replace(/^Dr\.\s*/i, "").trim(), $options: "i" } });
        }
      }
      query.$or = orConditions;
    }

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient history connected to logged-in physiotherapist
// @route   GET /api/v1/doctor/patient-history
// @access  Private (Doctor/Physio/Admin)
const getDoctorPatientHistory = async (req, res, next) => {
  try {
    const doctor = await Physiotherapist.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }]
    });

    const cleanName = req.user.name.replace(/^Dr\.\s*/i, "").trim();
    const orConditions = [
      { specialist: { $regex: cleanName, $options: "i" } }
    ];
    if (doctor) {
      orConditions.push({ physiotherapistId: doctor._id });
      if (doctor.name) {
        orConditions.push({ specialist: { $regex: doctor.name.replace(/^Dr\.\s*/i, "").trim(), $options: "i" } });
      }
    }

    const appointments = await Appointment.find({
      $or: orConditions,
      status: { $nin: ["PENDING_ADMIN_APPROVAL", "REJECTED_BY_ADMIN", "REJECTED_BY_PHYSIOTHERAPIST"] }
    }).sort({ createdAt: -1 });

    const patientMap = {};
    appointments.forEach((apt) => {
      const key = (apt.phone || apt.email || apt.patientName).toLowerCase().trim();
      if (!patientMap[key]) {
        patientMap[key] = {
          _id: apt._id,
          patientName: apt.patientName,
          phone: apt.phone,
          email: apt.email || "",
          user: apt.user || null,
          appointments: [],
          totalSessions: 0,
          lastAppointment: apt.date,
          latestStatus: apt.status,
          service: apt.service
        };
      }
      patientMap[key].appointments.push(apt);
      patientMap[key].totalSessions += 1;
    });

    const patientHistory = Object.values(patientMap);

    res.status(200).json({
      success: true,
      count: patientHistory.length,
      data: patientHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Physiotherapist Accept Appointment Request
// @route   PUT /api/v1/doctor/appointments/:id/accept
// @access  Private (Doctor/Admin)
const acceptDoctorAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment request not found" });
    }

    if (appointment.status !== "PENDING_PHYSIOTHERAPIST_APPROVAL") {
      return res.status(400).json({ success: false, message: "Appointment is not pending physiotherapist approval" });
    }

    appointment.status = "CONFIRMED";
    appointment.physiotherapistApprovedAt = new Date();
    await appointment.save();

    // 1. Notify patient
    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Appointment Confirmed!",
        message: `Your appointment with ${appointment.specialist} for ${appointment.service} on ${appointment.date} at ${appointment.timeSlot} has been CONFIRMED by the specialist!`,
        type: "appointment"
      });
    }

    // 2. Notify Admin
    await notifyAdmins({
      title: "Appointment Confirmed by Specialist",
      message: `${appointment.specialist} confirmed appointment for ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}.`,
      type: "appointment"
    });

    res.status(200).json({
      success: true,
      message: "Appointment request accepted & confirmed!",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Physiotherapist Reject Appointment Request
// @route   PUT /api/v1/doctor/appointments/:id/reject
// @access  Private (Doctor/Admin)
const rejectDoctorAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment request not found" });
    }

    if (appointment.status !== "PENDING_PHYSIOTHERAPIST_APPROVAL") {
      return res.status(400).json({ success: false, message: "Appointment is not pending physiotherapist approval" });
    }

    appointment.status = "REJECTED_BY_PHYSIOTHERAPIST";
    appointment.physiotherapistRejectedAt = new Date();
    appointment.physiotherapistRejectionReason = reason || "";
    await appointment.save();

    // 1. Notify patient
    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Appointment Request Declined by Specialist",
        message: `Your appointment request for ${appointment.date} was declined by ${appointment.specialist}. ${reason ? 'Reason: ' + reason : ''}`,
        type: "appointment"
      });
    }

    // 2. Notify Admin
    await notifyAdmins({
      title: "Appointment Rejected by Specialist",
      message: `${appointment.specialist} declined appointment request for ${appointment.patientName} on ${appointment.date}. ${reason ? 'Reason: ' + reason : ''}`,
      type: "appointment"
    });

    res.status(200).json({
      success: true,
      message: "Appointment request rejected by physiotherapist.",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Confirm, Reject, Mark Completed)
// @route   PUT /api/v1/doctor/appointments/:id/status
// @access  Private (Doctor/Admin)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body; // status: 'upcoming', 'completed', 'cancelled'

    if (!["upcoming", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment record not found"
      });
    }

    // Send notification to patient if linked to a user account
    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      let title = "Appointment Status Update";
      let msg = `Your appointment for ${appointment.date} at ${appointment.timeSlot} has been updated to: ${status}.`;

      if (status === "completed") {
        title = "Visit Completed";
        msg = `Thank you for visiting Satya Physiotherapy. Your consultation on ${appointment.date} with ${appointment.specialist} is marked completed.`;
      } else if (status === "cancelled") {
        title = "Appointment Cancelled by Specialist";
        msg = `Your appointment for ${appointment.date} was cancelled. ${note ? 'Reason: ' + note : ''}`;
      }

      await sendNotification({
        userId: patientUserId,
        title,
        message: msg,
        type: "appointment"
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment date & time slot
// @route   PUT /api/v1/doctor/appointments/:id/reschedule
// @access  Private (Doctor/Admin)
const rescheduleDoctorAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Date and Time Slot are required for rescheduling"
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, timeSlot, status: "upcoming" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment record not found"
      });
    }

    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Appointment Rescheduled",
        message: `Your appointment with ${appointment.specialist} has been rescheduled to ${date} at ${timeSlot}.`,
        type: "appointment"
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update offline payment status (pending / paid)
// @route   PUT /api/v1/doctor/appointments/:id/payment
// @access  Private (Doctor/Admin)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body; // 'pending' or 'paid'

    if (!["pending", "paid"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment record not found"
      });
    }

    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId && paymentStatus === "paid") {
      await sendNotification({
        userId: patientUserId,
        title: "Offline Payment Confirmed",
        message: `Payment status for your appointment on ${appointment.date} has been marked as PAID (Received offline).`,
        type: "appointment"
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorPatientHistory,
  acceptDoctorAppointment,
  rejectDoctorAppointment,
  updateAppointmentStatus,
  rescheduleDoctorAppointment,
  updatePaymentStatus
};
