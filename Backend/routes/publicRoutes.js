const express = require("express");
const router = express.Router();
const {
  getServices,
  getServiceBySlug,
  getDoctors,
  getTestimonials,
  getFAQs,
  getClinicInfo,
  getBlogs,
  getBlogBySlug,
  getNews,
  getNewsBySlug
} = require("../controllers/publicController");

router.get("/services", getServices);
router.get("/services/:slug", getServiceBySlug);
router.get("/doctors", getDoctors);
router.get("/testimonials", getTestimonials);
router.get("/faqs", getFAQs);
router.get("/clinic-info", getClinicInfo);
router.get("/blogs", getBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.get("/news", getNews);
router.get("/news/:slug", getNewsBySlug);

module.exports = router;
