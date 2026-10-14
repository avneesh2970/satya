const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllAppointments,
  approveAppointmentByAdmin,
  rejectAppointmentByAdmin,
  markAppointmentsRead,
  updateAppointmentStatus,
  updatePaymentStatus,
  getAllPhysiotherapists,
  verifyPhysiotherapist,
  createPhysiotherapist,
  getAllUsers,
  updateUserRole,
  getAllServices,
  createService,
  updateService,
  deleteService,
  getAllOnlineConsultations,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllInquiries,
  markInquiriesRead,
  getSystemSettings,
  updateSystemSettings,
  getAllBlogs,
  markBlogsRead,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllNews,
  markNewsRead,
  createNews,
  updateNews,
  deleteNews,
  getPhysioApprovals,
  approvePhysioRegistration,
  rejectPhysioRegistration
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

// All admin routes strictly protected for admin role only
router.use(protectAdmin);

router.get("/stats", getDashboardStats);
router.get("/appointments", getAllAppointments);
router.put("/appointments/mark-read", markAppointmentsRead);
router.put("/appointments/:id/approve", approveAppointmentByAdmin);
router.put("/appointments/:id/reject", rejectAppointmentByAdmin);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.put("/appointments/:id/payment", updatePaymentStatus);

router.get("/doctors", getAllPhysiotherapists);
router.post("/doctors", createPhysiotherapist);
router.put("/doctors/:id/verify", verifyPhysiotherapist);

router.get("/physio-approvals", getPhysioApprovals);
router.put("/physio-approvals/:id/approve", approvePhysioRegistration);
router.put("/physio-approvals/:id/reject", rejectPhysioRegistration);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);

const upload = require("../middleware/uploadMiddleware");

router.get("/services", getAllServices);
router.post("/services", upload.single("image"), createService);
router.put("/services/:id", upload.single("image"), updateService);
router.delete("/services/:id", deleteService);

router.get("/online-consultations", getAllOnlineConsultations);

router.get("/testimonials", getAllTestimonials);
router.post("/testimonials", createTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

router.get("/inquiries", getAllInquiries);
router.put("/inquiries/mark-read", markInquiriesRead);

router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

router.get("/blogs", getAllBlogs);
router.put("/blogs/mark-read", markBlogsRead);
router.post("/blogs", upload.single("image"), createBlog);
router.put("/blogs/:id", upload.single("image"), updateBlog);
router.delete("/blogs/:id", deleteBlog);

router.get("/news", getAllNews);
router.put("/news/mark-read", markNewsRead);
router.post("/news", upload.single("image"), createNews);
router.put("/news/:id", upload.single("image"), updateNews);
router.delete("/news/:id", deleteNews);

module.exports = router;
