const Notification = require("../models/Notification");
const User = require("../models/User");
const Physiotherapist = require("../models/Physiotherapist");

/**
 * Send a notification strictly to a specific user ID.
 * Returns null if userId is invalid/missing.
 */
const sendNotification = async ({ userId, title, message, type = "appointment" }) => {
  try {
    if (!userId) return null;
    const recipientId = userId._id ? userId._id.toString() : userId.toString();

    const notification = await Notification.create({
      user: recipientId,
      title,
      message,
      type,
      read: false
    });
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err.message);
    return null;
  }
};

/**
 * Send a notification strictly to an array of recipient user IDs (deduplicated).
 */
const sendMultiNotification = async ({ userIds, title, message, type = "appointment" }) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) return [];
    
    const uniqueIds = new Set();
    userIds.forEach((id) => {
      if (id) {
        const strId = id._id ? id._id.toString() : id.toString();
        uniqueIds.add(strId);
      }
    });

    const notifications = [];
    for (const recipientId of uniqueIds) {
      const notif = await Notification.create({
        user: recipientId,
        title,
        message,
        type,
        read: false
      });
      notifications.push(notif);
    }
    return notifications;
  } catch (err) {
    console.error("Error creating multi-user notifications:", err.message);
    return [];
  }
};

/**
 * Send a notification strictly to all registered users with role === 'admin'.
 */
const notifyAdmins = async ({ title, message, type = "appointment" }) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map((a) => a._id);
    return await sendMultiNotification({ userIds: adminIds, title, message, type });
  } catch (err) {
    console.error("Error notifying admins:", err.message);
    return [];
  }
};

/**
 * Helper to resolve patient user ID from appointment object.
 * First checks appointment.user, then attempts to look up User by appointment.email.
 */
const resolvePatientUserId = async (appointment) => {
  if (!appointment) return null;
  if (appointment.user) return appointment.user;
  if (appointment.email) {
    const user = await User.findOne({ email: appointment.email.toLowerCase().trim() });
    if (user) return user._id;
  }
  return null;
};

/**
 * Helper to resolve doctor user ID from physiotherapistId or specialist name.
 */
const resolveDoctorUserId = async (physiotherapistId, specialistName) => {
  try {
    if (physiotherapistId) {
      const physio = await Physiotherapist.findById(physiotherapistId);
      if (physio) {
        if (physio.user) return physio.user;
        if (physio.email) {
          const docUser = await User.findOne({ email: physio.email.toLowerCase().trim(), role: "doctor" });
          if (docUser) return docUser._id;
        }
      }
    }
    if (specialistName) {
      const docUser = await User.findOne({
        name: new RegExp(specialistName.trim(), "i"),
        role: "doctor"
      });
      if (docUser) return docUser._id;
    }
    return null;
  } catch (err) {
    console.error("Error resolving doctor user ID:", err.message);
    return null;
  }
};

module.exports = {
  sendNotification,
  sendMultiNotification,
  notifyAdmins,
  resolvePatientUserId,
  resolveDoctorUserId
};
