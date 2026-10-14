const Service = require("../models/Service");
const Physiotherapist = require("../models/Physiotherapist");
const Testimonial = require("../models/Testimonial");
const FAQ = require("../models/FAQ");
const ClinicInfo = require("../models/ClinicInfo");
const Blog = require("../models/Blog");
const News = require("../models/News");

const serviceImageRules = [
  { keywords: ["posture", "ergonomic"], image: "/images/posture.jpg" },
  { keywords: ["post-surgical", "post surgical", "post op", "post-op"], image: "/images/Post.jpg" },
  { keywords: ["orthopedic"], image: "/images/ortho.jpg" },
  { keywords: ["sports"], image: "/images/sports.jpeg" },
  { keywords: ["neuro"], image: "/images/neuro.jpeg" },
  { keywords: ["laser"], image: "/images/classIV.jpeg" }
];

const getServices = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const services = await Service.find(filter).sort({ order: 1, createdAt: -1 });

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

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, active: true });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const filter = { active: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } }
      ];
    }

    if (specialization && specialization !== "all") {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    const doctors = await Physiotherapist.find(filter).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    next(error);
  }
};

const getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

const getClinicInfo = async (req, res, next) => {
  try {
    const SystemSetting = require("../models/SystemSetting");
    let systemSettings = await SystemSetting.findOne();
    let info = await ClinicInfo.findOne({ active: true });
    
    const responseData = {
      clinicName: systemSettings?.clinicName || info?.clinicName || "Satya Physiotherapy Center",
      tagline: info?.tagline || "Move better. Heal deeper. Live stronger.",
      helpline: systemSettings?.emergencyHelpline || systemSettings?.phone || info?.helpline || "+91 7500831828",
      phone: systemSettings?.phone || "+91 7500831828",
      address: systemSettings?.address || info?.address || "Satya Physiotherapy Center, Main Road, New Delhi",
      email: systemSettings?.email || info?.email || "contact@satyaphysio.com",
      clinicHours: systemSettings?.businessHours || info?.clinicHours || "Mon–Sat: 8 AM – 8 PM · Sun: 9 AM – 1 PM",
      siteAnnouncement: systemSettings?.siteAnnouncement || "Welcome to Satya Physiotherapy Center — Evidence-Based Non-Surgical Recovery.",
      heroStats: info?.heroStats || {
        yearsPractice: "15+",
        recoveriesGuided: "12k+",
        recommendationRate: "98%",
        ratingScore: "4.9 / 5",
        totalReviews: "from 900+ patient reviews"
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

const getBlogs = async (req, res, next) => {
  try {
    let blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    
    // Seed default clinical blogs if database has none
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

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog article not found" });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const getNews = async (req, res, next) => {
  try {
    let news = await News.find({ published: true }).sort({ important: -1, createdAt: -1 });
    
    // Seed default clinic news if database has none
    if (news.length === 0) {
      const defaultNews = [
        {
          title: "Satya Physiotherapy Launches Advanced Class IV Laser Rehabilitation Unit",
          slug: "satya-launches-class-iv-laser-unit",
          category: "Technology Update",
          author: "Satya Clinic Admin",
          summary: "Our clinic is proud to introduce high-intensity laser therapy for accelerated deep-tissue healing and non-surgical pain management.",
          content: "Satya Physiotherapy Center is excited to announce the installation of the state-of-the-art Class IV High-Intensity Laser Therapy system. Operating at dual 810nm and 905nm wavelengths, this non-invasive technology delivers photonic energy deep into damaged tendons, bursae, and spinal discs.\n\nKey benefits include:\n• Up to 70% faster recovery in acute inflammation and tendonitis\n• Zero pain, zero downtime during treatments\n• Deep mitochondrial stimulation accelerating cellular ATP production\n\nPatients can now book Class IV Laser consultations directly through our online booking system.",
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
          important: true,
          published: true
        },
        {
          title: "Free Community Spine & Posture Screening Camp This Weekend",
          slug: "free-community-spine-posture-screening",
          category: "Community Event",
          author: "Satya Health Team",
          summary: "Join our senior MPT physiotherapists for a complimentary posture assessment, spinal mobility check, and ergometrics consultation.",
          content: "As part of our commitment to preventive orthopedic care, Satya Physiotherapy Center is hosting a Free Community Spine & Posture Health Check on Sunday from 9:00 AM to 1:00 PM at our main clinic facility.\n\nWhat to expect:\n1. Digital Posture & Alignment Analysis\n2. Range-of-Motion (ROM) & Flexibility Assessment\n3. Personalized Workstation Ergonomics Recommendations\n\nRegistration is required. Contact care@satyaphysio.in or call +91 7500831828 to reserve your slot.",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
          important: false,
          published: true
        },
        {
          title: "New Extended Evening Clinic Hours Announced for Working Professionals",
          slug: "extended-evening-clinic-hours",
          category: "Clinic Operation",
          author: "Clinic Management",
          summary: "To serve our patients better, appointment slots are now open until 8:30 PM Monday through Saturday.",
          content: "We understand that balancing work schedules with physical therapy rehabilitation can be challenging. Starting this month, Satya Physiotherapy Center has extended its weekday operating hours.\n\nNew Schedule:\n• Monday – Saturday: 8:00 AM – 8:30 PM\n• Sunday: 9:00 AM – 1:00 PM\n\nEvening appointments fill up quickly, so we recommend booking 24–48 hours in advance via our website portal.",
          image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
          important: false,
          published: true
        }
      ];
      news = await News.insertMany(defaultNews);
    }

    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

const getNewsBySlug = async (req, res, next) => {
  try {
    const item = await News.findOne({ slug: req.params.slug, published: true });
    if (!item) {
      return res.status(404).json({ success: false, message: "News article not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
