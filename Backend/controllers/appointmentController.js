const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const Physiotherapist = require("../models/Physiotherapist");
const { sendNotification, notifyAdmins, resolvePatientUserId } = require("../utils/notificationHelper");

// @desc    Schedule / book a new appointment
// @route   POST /api/v1/appointments
// @access  Public (Optional auth)
const createAppointment = async (req, res, next) => {
  try {
    const {
      patientName,
      phone,
      email,
      service,
      specialist,
      physiotherapistId,
      date,
      timeSlot,
      notes,
      appointmentType = "clinic",
      homeAddress = "",
      cityArea = ""
    } = req.body;

    if (!patientName || !phone || !date) {
      return res.status(400).json({
        success: false,
        message: "Patient name, phone number, and appointment date are required"
      });
    }

    if (appointmentType === "home") {
      if (!homeAddress || !cityArea) {
        return res.status(400).json({
          success: false,
          message: "Home address and City / Area are required for Home Physiotherapy visits"
        });
      }
    }

    let physioId = physiotherapistId;
    let targetSpecialist = specialist || "Dr. Satya Prakash";

    let physioDoc = null;
    if (physioId) {
      physioDoc = await Physiotherapist.findById(physioId);
    }
    if (!physioDoc && targetSpecialist) {
      physioDoc = await Physiotherapist.findOne({ name: new RegExp(targetSpecialist.replace(/^Dr\.\s*/i, ""), "i") });
      if (physioDoc) physioId = physioDoc._id;
    }

    if (physioDoc && physioDoc.active === false) {
      return res.status(400).json({
        success: false,
        message: `Specialist ${targetSpecialist} is currently unavailable for new bookings.`
      });
    }

    // Double-booking prevention
    const selectedSlot = (timeSlot || "10:00 AM").trim();
    const selectedDate = date.trim();

    if (physioId || targetSpecialist) {
      const existingBooking = await Appointment.findOne({
        $or: [
          ...(physioId ? [{ physiotherapistId: physioId }] : []),
          { specialist: new RegExp(targetSpecialist.replace(/^Dr\.\s*/i, ""), "i") }
        ],
        date: selectedDate,
        timeSlot: selectedSlot,
        status: { $nin: ["REJECTED_BY_ADMIN", "REJECTED_BY_PHYSIOTHERAPIST", "cancelled"] }
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: `The time slot (${selectedSlot}) on ${selectedDate} is already booked for ${targetSpecialist}. Please choose a different date or time slot.`
        });
      }
    }

    const appointmentData = {
      patientName,
      phone,
      email: email || "",
      service: service || "Orthopedic Rehabilitation",
      specialist: specialist || "Dr. Satya Prakash",
      physiotherapistId: physioId || null,
      date,
      timeSlot: timeSlot || "10:00 AM",
      appointmentType,
      homeAddress: homeAddress || "",
      cityArea: cityArea || "",
      paymentStatus: "pending",
      notes: notes || "",
      status: "PENDING_ADMIN_APPROVAL",
      isReadAdmin: false
    };

    if (req.user) {
      appointmentData.user = req.user._id;
    }

    const appointment = await Appointment.create(appointmentData);

    // 1. Send notification to booking patient
    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Appointment Request Submitted",
        message: `Your appointment request with ${appointment.specialist} for ${appointment.service} on ${appointment.date} at ${appointment.timeSlot} has been submitted. Status: Waiting for Admin Approval.`,
        type: "appointment"
      });
    }

    // 2. Send notification to all admins
    await notifyAdmins({
      title: "New Appointment Request Pending Admin Approval",
      message: `New request from ${appointment.patientName} (${appointment.phone}) for ${appointment.service} on ${appointment.date} at ${appointment.timeSlot}.`,
      type: "appointment"
    });

    res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully! Waiting for Admin Approval.",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for current logged in patient
// @route   GET /api/v1/appointments/my-appointments
// @access  Private
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/v1/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    await sendNotification({
      userId: req.user._id,
      title: "Appointment Cancelled",
      message: `Your appointment scheduled for ${appointment.date} at ${appointment.timeSlot} has been cancelled.`,
      type: "appointment"
    });

    await notifyAdmins({
      title: "Appointment Cancelled by Patient",
      message: `Appointment for ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot} was cancelled by the patient.`,
      type: "appointment"
    });

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment
};
