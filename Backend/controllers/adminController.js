const User = require("../models/User");
const Physiotherapist = require("../models/Physiotherapist");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const OnlineConsultation = require("../models/OnlineConsultation");
const Inquiry = require("../models/Inquiry");
const Testimonial = require("../models/Testimonial");
const SystemSetting = require("../models/SystemSetting");
const Notification = require("../models/Notification");
const { sendNotification, resolvePatientUserId, resolveDoctorUserId } = require("../utils/notificationHelper");
const { sendPhysioApprovalEmail, sendPhysioRejectionEmail } = require("../utils/emailService");
const Blog = require("../models/Blog");
const News = require("../models/News");

// @desc    Get Admin Dashboard KPI Statistics & Analytics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      completedAppointments,
      totalConsultations,
      totalInquiries,
      unreadInquiries,
      recentAppointments
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Physiotherapist.countDocuments({ active: true }),
      Physiotherapist.countDocuments({ active: false }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "completed" }),
      OnlineConsultation.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ isReadAdmin: { $ne: true } }),
      Appointment.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Dynamic revenue calculation from paid appointments in MongoDB based on Service pricing
    const paidAppointments = await Appointment.find({ paymentStatus: "paid" });
    const allServices = await Service.find();
    const servicePriceMap = {};
    allServices.forEach(s => {
      const numericPrice = parseInt(String(s.price || "").replace(/[^0-9]/g, "")) || 800;
      servicePriceMap[(s.title || "").toLowerCase()] = numericPrice;
    });

    let totalEstRevenue = 0;
    paidAppointments.forEach(apt => {
      const matchedPrice = servicePriceMap[(apt.service || "").toLowerCase()] || 800;
      totalEstRevenue += matchedPrice;
    });

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        totalConsultations,
        totalInquiries,
        unreadInquiries,
        totalEstRevenue: `₹${totalEstRevenue.toLocaleString()}`,
        recentAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments for Admin with filters
// @route   GET /api/v1/admin/appointments
// @access  Private (Admin)
const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/v1/admin/appointments/:id/status
// @access  Private (Admin)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Appointment Status Updated",
        message: `Your appointment for ${appointment.date} is now marked as ${status.toUpperCase()}. ${note || ''}`,
        type: "appointment"
      });
    }

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Approve Appointment Request
// @route   PUT /api/v1/admin/appointments/:id/approve
// @access  Private (Admin)
const approveAppointmentByAdmin = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment request not found" });
    }

    appointment.status = "PENDING_PHYSIOTHERAPIST_APPROVAL";
    appointment.adminApprovedAt = new Date();
    await appointment.save();

    // 1. Send notification strictly to the patient
    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Approved by Admin – Waiting for Specialist",
        message: `Your appointment request with ${appointment.specialist} for ${appointment.service} on ${appointment.date} at ${appointment.timeSlot} has been approved by Admin! Waiting for specialist confirmation.`,
        type: "appointment"
      });
    }

    // 2. Send notification strictly to the assigned Physiotherapist
    const doctorUserId = await resolveDoctorUserId(appointment.physiotherapistId, appointment.specialist);
    if (doctorUserId) {
      await sendNotification({
        userId: doctorUserId,
        title: "New Appointment Request Pending Approval",
        message: `New request: ${appointment.patientName} requested ${appointment.service} on ${appointment.date} at ${appointment.timeSlot}.`,
        type: "appointment"
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment approved by Admin. Forwarded to Specialist.",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Reject Appointment Request
// @route   PUT /api/v1/admin/appointments/:id/reject
// @access  Private (Admin)
const rejectAppointmentByAdmin = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment request not found" });
    }

    appointment.status = "REJECTED_BY_ADMIN";
    appointment.adminRejectedAt = new Date();
    appointment.adminRejectionReason = reason || "";
    await appointment.save();

    // Send notification strictly to the patient
    const patientUserId = await resolvePatientUserId(appointment);
    if (patientUserId) {
      await sendNotification({
        userId: patientUserId,
        title: "Appointment Request Rejected by Admin",
        message: `Your appointment request for ${appointment.date} was rejected by Admin. ${reason ? 'Reason: ' + reason : ''}`,
        type: "appointment"
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment request rejected by Admin.",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update offline payment status
// @route   PUT /api/v1/admin/appointments/:id/payment
// @access  Private (Admin)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.status(200).json({ success: true, message: `Payment status updated to ${paymentStatus}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all physiotherapists
// @route   GET /api/v1/admin/doctors
// @access  Private (Admin)
const getAllPhysiotherapists = async (req, res, next) => {
  try {
    const doctors = await Physiotherapist.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify / Toggle active status of physiotherapist
// @route   PUT /api/v1/admin/doctors/:id/verify
// @access  Private (Admin)
const verifyPhysiotherapist = async (req, res, next) => {
  try {
    const doctor = await Physiotherapist.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.active = !doctor.active;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.name} is now ${doctor.active ? 'VERIFIED & ACTIVE' : 'SUSPENDED'}`,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new physiotherapist manually
// @route   POST /api/v1/admin/doctors
// @access  Private (Admin)
const createPhysiotherapist = async (req, res, next) => {
  try {
    const doctor = await Physiotherapist.create(req.body);
    res.status(201).json({ success: true, message: "Doctor created successfully", data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all non-admin users & patients
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (patient / doctor / admin)
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles are: patient, doctor, admin"
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    user.role = role;
    await user.save();

    // If role changed to doctor, auto-sync / create Physiotherapist record if not exists
    if (role === "doctor") {
      const existingPhysio = await Physiotherapist.findOne({
        $or: [{ user: user._id }, { name: new RegExp(user.name, "i") }]
      });

      if (!existingPhysio) {
        await Physiotherapist.create({
          name: user.name,
          title: "Senior Physiotherapist",
          qualification: "MPT (Orthopedic Rehabilitation)",
          experienceYears: 5,
          specialization: "Spine & Joint Rehabilitation",
          consultationFee: "₹800",
          user: user._id,
          active: true
        }).catch(err => console.error("Physiotherapist auto-profile error:", err));
      } else if (!existingPhysio.user) {
        existingPhysio.user = user._id;
        existingPhysio.active = true;
        await existingPhysio.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Role for ${user.name} successfully updated to ${role.toUpperCase()}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const serviceImageRules = [
  { keywords: ["posture", "ergonomic"], image: "/images/posture.jpg" },
  { keywords: ["post-surgical", "post surgical", "post op", "post-op"], image: "/images/Post.jpg" },
  { keywords: ["orthopedic"], image: "/images/ortho.jpg" },
  { keywords: ["sports"], image: "/images/sports.jpeg" },
  { keywords: ["neuro"], image: "/images/neuro.jpeg" },
  { keywords: ["laser"], image: "/images/classIV.jpeg" }
];

// @desc    Get services
// @route   GET /api/v1/admin/services
// @access  Private (Admin)
const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    for (const srv of services) {
      const titleLower = (srv.title || "").toLowerCase();
      let matchedImage = "";
      for (const rule of serviceImageRules) {
        if (rule.keywords.some((kw) => titleLower.includes(kw))) {
          matchedImage = rule.image;
          break;
        }
      }
      if (matchedImage && srv.image !== matchedImage) {
        srv.image = matchedImage;
        await srv.save().catch(() => {});
      }
    }

    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new treatment service with image upload support
// @route   POST /api/v1/admin/services
// @access  Private (Admin)
const createService = async (req, res, next) => {
  try {
    const { title, description, desc, duration, price, category, image, iconName } = req.body;
    const serviceTitle = title || "New Treatment Service";
    const slug = req.body.slug || (serviceTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now());

    let imageUrl = image;

    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/services", req.file.originalname);
        imageUrl = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary service image upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/services");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `service-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = `/uploads/services/${filename}`;
      }
    }

    const service = await Service.create({
      title: serviceTitle,
      slug,
      category: category || "General Rehabilitation",
      description: description || desc || "Evidence-based clinical rehabilitation service",
      iconName: iconName || "Activity",
      image: imageUrl || "/images/hero_physio.jpg",
      duration: duration || "45 mins",
      price: price || "₹1,200"
    });

    res.status(201).json({ success: true, message: "Treatment Service created successfully", data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/v1/admin/services/:id
// @access  Private (Admin)
const deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/v1/admin/services/:id
// @access  Private (Admin)
const updateService = async (req, res, next) => {
  try {
    const { title, description, desc, duration, price, category, image, iconName } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    let imageUrl = image !== undefined ? image : service.image;

    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/services", req.file.originalname);
        imageUrl = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary service image upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/services");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `service-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = `/uploads/services/${filename}`;
      }
    }

    if (title) service.title = title;
    if (category) service.category = category;
    if (description || desc) service.description = description || desc;
    if (iconName) service.iconName = iconName;
    if (duration) service.duration = duration;
    if (price) service.price = price;
    if (imageUrl !== undefined) service.image = imageUrl;

    await service.save();

    res.status(200).json({ success: true, message: "Service updated successfully", data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Get online consultation requests
// @route   GET /api/v1/admin/online-consultations
// @access  Private (Admin)
const getAllOnlineConsultations = async (req, res, next) => {
  try {
    const requests = await OnlineConsultation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

const defaultTestimonialsData = [
  {
    patientName: 'Rajesh Malhotra',
    patientRole: 'L4-L5 Disc Herniation Patient',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'I was advised surgery for my sciatica pain. Dr. Satya’s decompression and core stabilization protocol got me back to walking without pain in 4 weeks. Truly life-changing care!',
    stars: 5,
    tag: 'Pain-Free in 4 Weeks',
    featured: true,
    approved: true
  },
  {
    patientName: 'Priya Sundaram',
    patientRole: 'Post ACL Reconstruction Athlete',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    quote: 'The sports rehab program at Satya was incredibly methodical. From gait retraining to agility drills, they gave me complete confidence to return to marathon running.',
    stars: 5,
    tag: 'Returned to Running',
    featured: true,
    approved: true
  },
  {
    patientName: 'Anil Kapoor',
    patientRole: 'Frozen Shoulder Patient',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    quote: 'Six months of shoulder stiffness vanished in 3 weeks with Class IV laser therapy and joint mobilization. Punctual, clean, and extremely professional doctors.',
    stars: 5,
    tag: 'Full Mobility Restored',
    featured: true,
    approved: true
  },
  {
    patientName: 'Sunita Sharma',
    patientRole: 'Cervical Spondylosis Care',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    quote: 'Severe neck tightness and numbness in my fingers used to interrupt my work daily. The targeted manual therapy and posture correction exercises worked wonders!',
    stars: 5,
    tag: '100% Non-Surgical Care',
    featured: true,
    approved: true
  },
  {
    patientName: 'Vikram Sethi',
    patientRole: 'Total Knee Replacement Rehab',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    quote: 'After my knee replacement, getting back on my feet felt daunting. The team guided me step-by-step with patient care. I was climbing stairs within 3 weeks!',
    stars: 5,
    tag: 'Post-Op Knee Rehab',
    featured: true,
    approved: true
  },
  {
    patientName: 'Kavita Reddy',
    patientRole: 'Posture & Sciatica Recovery',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    quote: 'Years of computer desk work ruined my posture and caused severe lower back aches. The ergonomic guidance and core alignment exercises eliminated the pain.',
    stars: 5,
    tag: 'Zero Back Pain',
    featured: true,
    approved: true
  }
];

// @desc    Get testimonials
// @route   GET /api/v1/admin/testimonials
// @access  Private (Admin)
const getAllTestimonials = async (req, res, next) => {
  try {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(defaultTestimonialsData);
    }
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    next(error);
  }
};

// @desc    Create testimonial
// @route   POST /api/v1/admin/testimonials
// @access  Private (Admin)
const createTestimonial = async (req, res, next) => {
  try {
    const payload = {
      patientName: req.body.patientName || req.body.name || "Patient",
      patientRole: req.body.patientRole || req.body.role || "Patient",
      quote: req.body.quote || req.body.content || "",
      stars: Number(req.body.stars || req.body.rating || 5),
      tag: req.body.tag || req.body.outcomeTag || "Recovery Milestone",
      avatar: req.body.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      featured: req.body.featured !== undefined ? req.body.featured : true,
      approved: req.body.approved !== undefined ? req.body.approved : true
    };
    const testimonial = await Testimonial.create(payload);
    res.status(201).json({ success: true, message: "Testimonial created", data: testimonial });
  } catch (error) {
    next(error);
  }
};

// @desc    Update testimonial
// @route   PUT /api/v1/admin/testimonials/:id
// @access  Private (Admin)
const updateTestimonial = async (req, res, next) => {
  try {
    const payload = {
      patientName: req.body.patientName || req.body.name,
      patientRole: req.body.patientRole || req.body.role,
      quote: req.body.quote || req.body.content,
      stars: req.body.stars !== undefined ? Number(req.body.stars) : (req.body.rating !== undefined ? Number(req.body.rating) : undefined),
      tag: req.body.tag || req.body.outcomeTag,
      avatar: req.body.avatar,
      featured: req.body.featured,
      approved: req.body.approved
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, message: "Testimonial updated", data: testimonial });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/v1/admin/testimonials/:id
// @access  Private (Admin)
const deleteTestimonial = async (req, res, next) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiries
// @route   GET /api/v1/admin/inquiries
// @access  Private (Admin)
const getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get System Settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
const getSystemSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update System Settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
const updateSystemSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json({ success: true, message: "System settings updated successfully", data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blog articles
// @route   GET /api/v1/admin/blogs
// @access  Private (Admin)
const getAllBlogs = async (req, res, next) => {
  try {
    let blogs = await Blog.find().sort({ createdAt: -1 });

    if (blogs.length === 0) {
      const defaultBlogs = [
        {
          title: "5 Essential Exercises for Decompressing Lower Back Sciatica",
          slug: "5-essential-exercises-lower-back-sciatica",
          category: "Spine & Joint Care",
          author: "Dr. Satya Prakash",
          readTime: "5 min read",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
          excerpt: "Learn how targeted pelvic tilting, cat-cow flexions, and nerve glides reduce herniated disc pressure without surgery.",
          content: "Sciatica pain originating from L4-L5 and L5-S1 lumbar disc herniations can severely impair daily movement. Non-surgical spinal decompression therapy combined with targeted core stabilization exercises helps create negative intra-discal pressure, allowing the bulge to retract away from exiting nerve roots.\n\n1. Pelvic Tilts: Lie flat on your back with knees bent. Gently flatten your spine against the floor by tightening your abdominal muscles. Hold for 5 seconds and repeat 10 times.\n\n2. Cat-Cow Stretch: On all fours, alternate between arching your spine upward and letting your belly sink downward. This gently mobilizes the lumbar facet joints.\n\n3. Nerve Flossing: Sit upright, straighten the affected leg while flexing your ankle upward, then bend your knees while tucking your chin. This releases sciatic nerve entrapment.\n\n4. Cobra Extension: Lie face down and press up through your palms, extending the lower back to promote anterior disc movement.\n\n5. Bird-Dog Stabilization: Maintain a neutral spine while extending alternate arm and leg to strengthen deep multifidus muscles.",
          featured: true,
          published: true
        },
        {
          title: "Class IV High-Intensity Laser Therapy vs SWD: Which is Right for Pain?",
          slug: "class-iv-laser-vs-swd-pain-relief",
          category: "Advanced Pain Tech",
          author: "Dr. Satya Prakash & Team",
          readTime: "6 min read",
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
          excerpt: "Understanding deep tissue photobiomodulation versus shortwave diathermy for chronic inflammation, bursitis, and deep joint stiffness.",
          content: "Modern physical therapy modalities have revolutionized non-surgical pain management. Class IV High-Intensity Laser Therapy operates at 905nm and 810nm wavelengths to deliver deep photonic energy to mitochondria in damaged tissue, accelerating ATP synthesis and cellular repair.\n\nShortwave Diathermy (SWD), on the other hand, utilizes high-frequency electromagnetic energy to produce deep volumetric heating in muscular layers. While SWD excels at relieving muscle spasms and chronic joint stiffness, Class IV Laser is superior for nerve pain, acute tendonitis, and localized bursitis where deep cellular healing without thermal overload is required.",
          featured: true,
          published: true
        },
        {
          title: "Post-ACL Reconstruction Milestone Timeline & Safe Return-to-Play",
          slug: "post-acl-reconstruction-milestone-timeline",
          category: "Sports Rehab",
          author: "Senior Sports Physiotherapist",
          readTime: "7 min read",
          image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
          excerpt: "A phase-by-phase guide from initial graft protection to biomechanical agility drills and functional return to competitive sports.",
          content: "Recovering from Anterior Cruciate Ligament (ACL) reconstruction requires a structured, phase-based rehabilitation protocol. Rushing the process increases the risk of graft failure.\n\nPhase 1 (Weeks 0-4): Focus on full knee extension, patellar mobility, quad activation (straight leg raises), and reducing post-op swelling.\n\nPhase 2 (Weeks 4-12): Progressive weight-bearing, single-leg stance balance training, closed kinetic chain exercises (squats, step-ups), and stationary cycling.\n\nPhase 3 (Months 3-6): Dynamic agility, deceleration drills, plyometrics, and biomechanical movement analysis.\n\nPhase 4 (Months 6-9): Sport-specific drills and limb symmetry index (LSI) testing over 90% before full clearance.",
          featured: false,
          published: true
        }
      ];
      blogs = await Blog.insertMany(defaultBlogs);
    }

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blog article (Admin only)
// @route   POST /api/v1/admin/blogs
// @access  Private (Admin)
// @desc    Create new blog article (Admin only)
// @route   POST /api/v1/admin/blogs
// @access  Private (Admin)
const createBlog = async (req, res, next) => {
  try {
    const { title, category, author, readTime, image, excerpt, content, featured, published } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Blog title is required" });
    }

    let imageUrl = image;

    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/blogs", req.file.originalname);
        imageUrl = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary blog image upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/blogs");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `blog-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = `/uploads/blogs/${filename}`;
      }
    }

    let baseSlug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "blog-post";

    let slug = baseSlug;
    let count = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const finalExcerpt = excerpt || (content ? content.slice(0, 150) + "..." : title);
    const finalContent = content || finalExcerpt || title;

    let tags = req.body.tags;
    if (typeof tags === "string") {
      try { tags = JSON.parse(tags); } catch (e) { tags = tags.split(",").map(t => t.trim()); }
    }

    const blog = await Blog.create({
      title,
      slug,
      category: category || "Orthopedic Care",
      author: author || "Dr. Satya Prakash & Team",
      readTime: readTime || "5 min read",
      image: imageUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      excerpt: finalExcerpt,
      content: finalContent,
      tags: tags || [],
      featured: featured || false,
      published: published !== undefined ? (published === "true" || published === true) : true
    });

    res.status(201).json({ success: true, message: "Blog article published successfully!", data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog article
// @route   DELETE /api/v1/admin/blogs/:id
// @access  Private (Admin)
const deleteBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Blog article deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog article
// @route   PUT /api/v1/admin/blogs/:id
// @access  Private (Admin)
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog article not found" });
    }

    let updateData = { ...req.body };

    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/blogs", req.file.originalname);
        updateData.image = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary blog image upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/blogs");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `blog-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        updateData.image = `/uploads/blogs/${filename}`;
      }
    }

    if (typeof updateData.tags === "string") {
      try { updateData.tags = JSON.parse(updateData.tags); } catch (e) { updateData.tags = updateData.tags.split(",").map(t => t.trim()); }
    }
    if (updateData.published !== undefined) {
      updateData.published = updateData.published === "true" || updateData.published === true;
    }

    Object.assign(blog, updateData);
    await blog.save();

    res.status(200).json({ success: true, message: "Blog article updated successfully!", data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all news articles for Admin
// @route   GET /api/v1/admin/news
// @access  Private (Admin)
const getAllNews = async (req, res, next) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: news.length, data: news });
  } catch (error) {
    next(error);
  }
};

// @desc    Create & publish new news item
// @route   POST /api/v1/admin/news
// @access  Private (Admin)
const createNews = async (req, res, next) => {
  try {
    const { title, category, author, summary, content, image, important } = req.body;
    if (!title || !summary || !content) {
      return res.status(400).json({ success: false, message: "Title, summary, and content are required" });
    }

    let imageUrl = image;

    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/news", req.file.originalname);
        imageUrl = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary news image upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/news");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `news-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = `/uploads/news/${filename}`;
      }
    }

    const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const news = await News.create({
      title,
      slug,
      category: category || "Announcement",
      author: author || "Satya Physiotherapy Admin",
      summary,
      content,
      image: imageUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      important: important !== undefined ? (important === "true" || important === true) : false,
      published: true
    });

    res.status(201).json({ success: true, message: "News item published successfully!", data: news });
  } catch (error) {
    next(error);
  }
};

// @desc    Update news article
// @route   PUT /api/v1/admin/news/:id
// @access  Private (Admin)
const updateNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "News item not found" });
    }

    let updateData = { ...req.body };

    if (req.file) {
      try {
        const { uploadToCloudinary } = require("../config/cloudinary");
        const result = await uploadToCloudinary(req.file.buffer, "clinic/news", req.file.originalname);
        updateData.image = result.secure_url || result.url;
      } catch (uploadErr) {
        console.error("Cloudinary news image upload failed, fallback to local disk:", uploadErr);
        const fs = require("fs");
        const path = require("path");
        const uploadDir = path.join(__dirname, "../uploads/news");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(req.file.originalname) || ".jpg";
        const filename = `news-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        updateData.image = `/uploads/news/${filename}`;
      }
    }

    if (updateData.important !== undefined) {
      updateData.important = updateData.important === "true" || updateData.important === true;
    }

    Object.assign(news, updateData);
    await news.save();

    res.status(200).json({ success: true, message: "News item updated successfully!", data: news });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news article
// @route   DELETE /api/v1/admin/news/:id
// @access  Private (Admin)
const deleteNews = async (req, res, next) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "News item deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all appointments as read by admin
const markAppointmentsRead = async (req, res, next) => {
  try {
    await Appointment.updateMany({ isReadAdmin: { $ne: true } }, { isReadAdmin: true });
    res.status(200).json({ success: true, message: "Appointments marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all blogs as read by admin
const markBlogsRead = async (req, res, next) => {
  try {
    await Blog.updateMany({ isReadAdmin: { $ne: true } }, { isReadAdmin: true });
    res.status(200).json({ success: true, message: "Blogs marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all news items as read by admin
const markNewsRead = async (req, res, next) => {
  try {
    await News.updateMany({ isReadAdmin: { $ne: true } }, { isReadAdmin: true });
    res.status(200).json({ success: true, message: "News items marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all inquiries as read by admin
const markInquiriesRead = async (req, res, next) => {
  try {
    await Inquiry.updateMany({ isReadAdmin: { $ne: true } }, { isReadAdmin: true });
    res.status(200).json({ success: true, message: "Inquiries marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Physio registrations for Admin Approval
// @route   GET /api/v1/admin/physio-approvals
// @access  Private (Admin)
const getPhysioApprovals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { role: { $in: ["physio", "doctor"] } };
    if (status) {
      filter.approvalStatus = status;
    }
    const physios = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: physios.length,
      data: physios
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Approve Physio Registration
// @route   PUT /api/v1/admin/physio-approvals/:id/approve
// @access  Private (Admin)
const approvePhysioRegistration = async (req, res, next) => {
  try {
    const physioUser = await User.findById(req.params.id);
    if (!physioUser) {
      return res.status(404).json({ success: false, message: "Physiotherapist account not found" });
    }

    physioUser.approvalStatus = "APPROVED";
    physioUser.isApproved = true;
    physioUser.approvedBy = req.user._id;
    physioUser.approvedAt = new Date();
    physioUser.rejectionReason = null;
    await physioUser.save();

    // Auto-create / Sync linked Physiotherapist catalog document
    let physioDoc = await Physiotherapist.findOne({
      $or: [{ user: physioUser._id }, { email: physioUser.email }]
    });

    if (!physioDoc) {
      await Physiotherapist.create({
        user: physioUser._id,
        name: physioUser.name.startsWith("Dr.") ? physioUser.name : `Dr. ${physioUser.name}`,
        email: physioUser.email,
        phone: physioUser.phone,
        qualification: physioUser.qualification || "MPT (Orthopedics)",
        experienceYears: physioUser.experience || 5,
        specialization: physioUser.specialization || "Spine & Joint Rehabilitation",
        avatar: physioUser.profilePhoto || physioUser.avatar || "/images/cover.jpg",
        bio: physioUser.bio || "Dedicated physical therapy specialist focused on non-surgical recovery.",
        consultationFee: "₹800",
        active: true
      });
    } else {
      physioDoc.user = physioUser._id;
      physioDoc.name = physioUser.name.startsWith("Dr.") ? physioUser.name : `Dr. ${physioUser.name}`;
      physioDoc.qualification = physioUser.qualification || physioDoc.qualification;
      physioDoc.experienceYears = physioUser.experience || physioDoc.experienceYears;
      physioDoc.specialization = physioUser.specialization || physioDoc.specialization;
      if (physioUser.profilePhoto) physioDoc.avatar = physioUser.profilePhoto;
      physioDoc.active = true;
      await physioDoc.save();
    }

    // Send notification strictly to the approved Physio
    await sendNotification({
      userId: physioUser._id,
      title: "Physio Account Approved!",
      message: "Congratulations! Your professional registration has been approved by Admin. Your Physio Dashboard is now unlocked.",
      type: "system"
    }).catch(err => console.error("Notification error:", err));

    // Send approval email to Physio
    await sendPhysioApprovalEmail(physioUser).catch(err => console.error("Approval email error:", err));

    res.status(200).json({
      success: true,
      message: `Physiotherapist ${physioUser.name} has been APPROVED successfully!`,
      data: physioUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Reject Physio Registration
// @route   PUT /api/v1/admin/physio-approvals/:id/reject
// @access  Private (Admin)
const rejectPhysioRegistration = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const physioUser = await User.findById(req.params.id);
    if (!physioUser) {
      return res.status(404).json({ success: false, message: "Physiotherapist account not found" });
    }

    physioUser.approvalStatus = "REJECTED";
    physioUser.isApproved = false;
    physioUser.rejectionReason = reason || "Details provided do not meet administrative verification standards.";
    await physioUser.save();

    // Deactivate linked Physiotherapist catalog document if exists
    const physioDoc = await Physiotherapist.findOne({
      $or: [{ user: physioUser._id }, { email: physioUser.email }]
    });
    if (physioDoc) {
      physioDoc.active = false;
      await physioDoc.save();
    }

    // Send notification strictly to the rejected Physio
    await sendNotification({
      userId: physioUser._id,
      title: "Physio Registration Review Update",
      message: `Your registration was reviewed by Admin and requires updates. Reason: ${physioUser.rejectionReason}`,
      type: "system"
    }).catch(err => console.error("Notification error:", err));

    // Send rejection email to Physio
    await sendPhysioRejectionEmail(physioUser, physioUser.rejectionReason).catch(err => console.error("Rejection email error:", err));

    res.status(200).json({
      success: true,
      message: `Physiotherapist ${physioUser.name} has been REJECTED.`,
      data: physioUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
