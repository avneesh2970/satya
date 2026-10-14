const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  completePhysioRegistration
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

router.post(
  "/physio-registration",
  protect,
  upload.fields([
    { name: "registrationCertificate", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
    { name: "certifications", maxCount: 5 }
  ]),
  completePhysioRegistration
);

module.exports = router;
