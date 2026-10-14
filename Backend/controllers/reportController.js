const Report = require("../models/Report");
const Appointment = require("../models/Appointment");
const Physiotherapist = require("../models/Physiotherapist");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { sendNotification } = require("../utils/notificationHelper");

// @desc    Upload a new medical report to Cloudinary & save metadata in MongoDB
// @route   POST /api/v1/reports/upload
// @access  Private (Patient / Admin)
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No report file uploaded. Please select a PDF, JPG, JPEG, or PNG file."
      });
    }

    const patientId = req.user._id;
    let appointmentId = req.body.appointmentId || null;

    if (appointmentId && appointmentId !== "general" && appointmentId !== "null") {
      const apt = await Appointment.findById(appointmentId);
      if (!apt) {
        appointmentId = null;
      }
    } else {
      appointmentId = null;
    }

    const folderPath = `clinic/patient-reports/${patientId}/${appointmentId || "general"}`;
    const result = await uploadToCloudinary(req.file.buffer, folderPath, req.file.originalname);

    const report = await Report.create({
      patientId,
      appointmentId: appointmentId || null,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      uploadedAt: new Date()
    });

    await sendNotification({
      userId: patientId,
      title: "Medical Report Uploaded",
      message: `Your medical document "${req.file.originalname}" has been uploaded successfully.`,
      type: "system"
    }).catch(err => console.error("Report notification error:", err));

    res.status(201).json({
      success: true,
      message: "Medical report uploaded successfully to Cloudinary!",
      data: report
    });
  } catch (error) {
    console.error("Report upload error:", error);
    next(error);
  }
};

// @desc    Get all medical reports for logged in patient
// @route   GET /api/v1/reports/my-reports
// @access  Private (Patient)
const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ patientId: req.user._id })
      .populate("appointmentId", "service specialist date timeSlot status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical reports for a specific appointment
// @route   GET /api/v1/reports/appointment/:appointmentId
// @access  Private (Patient / Doctor / Admin)
const getAppointmentReports = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Security Authorization Check
    const isPatient = appointment.user && appointment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    let isAssignedDoctor = false;

    if (req.user.role === "doctor") {
      const physio = await Physiotherapist.findOne({ user: req.user._id });
      if (physio) {
        if (appointment.physiotherapistId && appointment.physiotherapistId.toString() === physio._id.toString()) {
          isAssignedDoctor = true;
        } else if (appointment.specialist && new RegExp(physio.name, "i").test(appointment.specialist)) {
          isAssignedDoctor = true;
        }
      }
    }

    if (!isPatient && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to view these reports."
      });
    }

    const reports = await Report.find({ appointmentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medical report (removes Cloudinary asset & DB record)
// @route   DELETE /api/v1/reports/:id
// @access  Private (Owner / Admin)
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // Security Check: owner patient or admin only
    if (report.patientId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own reports."
      });
    }

    await deleteFromCloudinary(report.publicId);
    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Medical report deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download/view a medical report by Report ID
// @route   GET /api/v1/reports/:id/download
// @access  Private (Patient owner / Assigned Doctor / Admin)
const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isPatientOwner = report.patientId && report.patientId.toString() === req.user._id.toString();
    let isAssignedDoctor = false;

    if (req.user.role === "doctor" && report.appointmentId) {
      const appointment = await Appointment.findById(report.appointmentId);
      if (appointment) {
        const physio = await Physiotherapist.findOne({ user: req.user._id });
        if (physio) {
          if (appointment.physiotherapistId && appointment.physiotherapistId.toString() === physio._id.toString()) {
            isAssignedDoctor = true;
          } else if (appointment.specialist && new RegExp(physio.name, "i").test(appointment.specialist)) {
            isAssignedDoctor = true;
          }
        }
      }
    }

    if (!isAdmin && !isPatientOwner && !isAssignedDoctor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to view or download this report."
      });
    }

    if (report.fileUrl.startsWith("http://") || report.fileUrl.startsWith("https://")) {
      return res.redirect(report.fileUrl);
    } else {
      return res.redirect(`${req.protocol}://${req.get("host")}${report.fileUrl.startsWith("/") ? "" : "/"}${report.fileUrl}`);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Download/view online consultation report by Consultation ID
// @route   GET /api/v1/reports/consultation/:consultationId/download
// @access  Private (Patient owner / Assigned Doctor / Admin)
const downloadConsultationReport = async (req, res, next) => {
  try {
    const OnlineConsultation = require("../models/OnlineConsultation");
    const consultation = await OnlineConsultation.findById(req.params.consultationId);

    if (!consultation || !consultation.reportFile) {
      return res.status(404).json({ success: false, message: "Consultation report file not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isPatientOwner = consultation.user && consultation.user.toString() === req.user._id.toString();
    let isAssignedDoctor = false;

    if (req.user.role === "doctor" && consultation.physiotherapist) {
      const physio = await Physiotherapist.findOne({ user: req.user._id });
      if (physio && consultation.physiotherapist.toString() === physio._id.toString()) {
        isAssignedDoctor = true;
      }
    }

    if (!isAdmin && !isPatientOwner && !isAssignedDoctor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to view this report."
      });
    }

    const fileUrl = consultation.reportFile;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return res.redirect(fileUrl);
    } else {
      return res.redirect(`${req.protocol}://${req.get("host")}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReport,
  getMyReports,
  getAppointmentReports,
  deleteReport,
  downloadReport,
  downloadConsultationReport
};

