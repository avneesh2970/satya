const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorPatientHistory,
  acceptDoctorAppointment,
  rejectDoctorAppointment,
  updateAppointmentStatus,
  rescheduleDoctorAppointment,
  updatePaymentStatus
} = require("../controllers/doctorController");
const { protectPhysio } = require("../middleware/authMiddleware");

// All doctor/physio dashboard routes are protected with strict physio authorization
router.use(protectPhysio);

router.get("/profile", getDoctorProfile);
router.put("/profile", upload.single("avatar"), updateDoctorProfile);
router.get("/appointments", getDoctorAppointments);
router.get("/patient-history", getDoctorPatientHistory);
router.put("/appointments/:id/accept", acceptDoctorAppointment);
router.put("/appointments/:id/reject", rejectDoctorAppointment);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.put("/appointments/:id/reschedule", rescheduleDoctorAppointment);
router.put("/appointments/:id/payment", updatePaymentStatus);

module.exports = router;
