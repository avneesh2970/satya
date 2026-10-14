const OnlineConsultation = require("../models/OnlineConsultation");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const { sendNotification, notifyAdmins, resolvePatientUserId } = require("../utils/notificationHelper");
const { uploadToCloudinary } = require("../config/cloudinary");

const createOnlineConsultation = async (req, res, next) => {
  try {
    const { name, phone, email, condition, preferredDate, preferredTime, additionalInfo, physiotherapistId } = req.body;

    if (!name || !phone || !condition || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Phone, Condition, Preferred Date, Preferred Time)"
      });
    }

    let reportFilePath = "";
    let cloudinaryPublicId = "";
    if (req.file) {
      const folderPath = `clinic/patient-reports/${req.user?._id || "guest"}/online-consultations`;
      const result = await uploadToCloudinary(req.file.buffer, folderPath, req.file.originalname);
      reportFilePath = result.secure_url;
      cloudinaryPublicId = result.public_id;
    }

    const consultationData = {
      name,
      phone,
      email: email || "",
      condition,
      preferredDate,
      preferredTime,
      additionalInfo: additionalInfo || "",
      reportFile: reportFilePath,
      physiotherapist: physiotherapistId || null
    };

    if (req.user) {
      consultationData.user = req.user._id;
    }

    const consultation = await OnlineConsultation.create(consultationData);

    // Save metadata to Report collection if patient is authenticated & file attached
    if (req.user && req.file && reportFilePath) {
      await Report.create({
        patientId: req.user._id,
        appointmentId: null,
        fileName: req.file.originalname,
        fileUrl: reportFilePath,
        publicId: cloudinaryPublicId,
        fileType: req.file.mimetype,
        uploadedAt: new Date()
      }).catch(err => console.error("Report metadata creation error:", err));
    }

    // 1. Notify patient
    const patientUserId = await resolvePatientUserId(consultation);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Online Consultation Request Submitted",
        message: `Your request for ${preferredDate} at ${preferredTime} has been received. Our clinical team will review your report and contact you shortly.`,
        type: "consultation"
      });
    }

    // 2. Notify Admins
    await notifyAdmins({
      title: "New Online Consultation Request",
      message: `New consultation request from ${name} (${phone}) for ${preferredDate} at ${preferredTime}. Condition: ${condition}`,
      type: "consultation"
    });

    res.status(201).json({
      success: true,
      message: "Online Consultation Request submitted successfully!",
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

const getMyOnlineConsultations = async (req, res, next) => {
  try {
    const consultations = await OnlineConsultation.find({ user: req.user._id })
      .populate("physiotherapist", "name title qualification avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOnlineConsultation,
  getMyOnlineConsultations
};
