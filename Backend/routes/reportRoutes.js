const express = require("express");
const router = express.Router();
const {
  uploadReport,
  getMyReports,
  getAppointmentReports,
  deleteReport,
  downloadReport,
  downloadConsultationReport
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Upload report
router.post("/upload", protect, upload.single("reportFile"), uploadReport);

// Get my reports
router.get("/my-reports", protect, getMyReports);

// Get reports for appointment
router.get("/appointment/:appointmentId", protect, getAppointmentReports);

// Secure authenticated download / view routes
router.get("/:id/download", protect, downloadReport);
router.get("/consultation/:consultationId/download", protect, downloadConsultationReport);

// Delete report
router.delete("/:id", protect, deleteReport);

module.exports = router;

