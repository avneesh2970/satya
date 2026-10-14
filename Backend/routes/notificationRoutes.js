const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, markNotificationsByType } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.put("/mark-all-read", protect, markAllAsRead);
router.put("/mark-type-read", protect, markNotificationsByType);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
