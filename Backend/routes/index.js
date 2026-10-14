const express = require("express");
const router = express.Router();

const publicRoutes = require("./publicRoutes");
const inquiryRoutes = require("./inquiryRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const authRoutes = require("./authRoutes");
const onlineConsultationRoutes = require("./onlineConsultationRoutes");
const notificationRoutes = require("./notificationRoutes");
const doctorRoutes = require("./doctorRoutes");
const adminRoutes = require("./adminRoutes");
const reportRoutes = require("./reportRoutes");

router.use("/public", publicRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/auth", authRoutes);
router.use("/online-consultations", onlineConsultationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/doctor", doctorRoutes);
router.use("/admin", adminRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
