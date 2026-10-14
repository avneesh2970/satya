require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const Service = require("../models/Service");
const Physiotherapist = require("../models/Physiotherapist");
const Testimonial = require("../models/Testimonial");
const FAQ = require("../models/FAQ");
const ClinicInfo = require("../models/ClinicInfo");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected for seeding...");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

const initialServices = [
  {
    title: "Orthopedic Rehabilitation",
    slug: "orthopedic-rehabilitation",
    category: "Orthopedic Rehabilitation",
    description: "Targeted joint mobilization & spinal decompression for arthritis, slip disc, frozen shoulder, and neck pain.",
    iconName: "Bone",
    image: "/images/ortho.jpg",
    duration: "45 mins",
    price: "₹1,200",
    order: 1,
    featured: true
  },
  {
    title: "Sports Injury & Performance",
    slug: "sports-injury-performance",
    category: "Sports Injury & Performance",
    description: "Rapid rehabilitation for ACL tears, ankle sprains, muscle tears, and athletic gait optimization.",
    iconName: "Activity",
    image: "/images/sports.jpeg",
    duration: "60 mins",
    price: "₹1,800",
    order: 2,
    featured: true
  },
  {
    title: "Neurological Recovery",
    slug: "neurological-recovery",
    category: "Neurological Recovery",
    description: "Specialized neuro-rehab for stroke recovery, nerve compression, balance disorders, and Parkinson’s.",
    iconName: "Brain",
    image: "/images/neuro.jpeg",
    duration: "60 mins",
    price: "₹2,000",
    order: 3,
    featured: true
  },
  {
    title: "Post-Surgical Rehabiliation",
    slug: "post-surgical-rehab",
    category: "Post-Surgical Rehabiliation",
    description: "Structured post-op therapy following total knee/hip replacement, arthroscopy, and spine surgery.",
    iconName: "HeartPulse",
    image: "/images/Post.jpg",
    duration: "50 mins",
    price: "₹1,500",
    order: 4,
    featured: true
  },
  {
    title: "Class IV Laser & Pain Relief",
    slug: "class-iv-laser-pain-relief",
    category: "Class IV Laser & Pain Relief",
    description: "High-intensity laser therapy, SWD, Ultrasound, and TENS for rapid non-surgical pain reduction.",
    iconName: "Flame",
    image: "/images/classIV.jpeg",
    duration: "45 mins",
    price: "₹1,200",
    order: 5,
    featured: true
  },
  {
    title: "Ergonomics & Posture Care",
    slug: "ergonomics-posture-care",
    category: "Ergonomics & Posture Care",
    description: "Desk posture correction, spinal alignment exercises, and workplace injury prevention.",
    iconName: "UserCheck",
    image: "/images/posture.jpg",
    duration: "40 mins",
    price: "₹1,000",
    order: 6,
    featured: true
  }
];

const initialDoctors = [
  {
    name: "Dr. Satya Prakash",
    title: "Chief Physiotherapist & Founder",
    qualification: "MPT (Orthopedics & Spine Care)",
    experienceYears: 15,
    specialization: "Spine & Joint Rehabilitation",
    avatar: "/images/SATYA.jpeg",
    bio: "Over 15 years of clinical excellence in treating complex disc herniations, sciatica, and sports injuries non-surgically.",
    consultationFee: "₹1,000",
    rating: 4.9,
    reviewsCount: 340,
    availableSlots: ["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "04:00 PM", "05:30 PM"]
  },
  {
    name: "Dr. Neha Sharma",
    title: "Senior Neuro Rehabilitation Specialist",
    qualification: "MPT (Neurology)",
    experienceYears: 10,
    specialization: "Neurological Recovery",
    avatar: "/images/SATYA.jpeg",
    bio: "Specialist in neuromuscular re-education, gait training, and post-stroke recovery protocols.",
    consultationFee: "₹900",
    rating: 4.8,
    reviewsCount: 210,
    availableSlots: ["09:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "05:00 PM"]
  },
  {
    name: "Dr. Amit Varma",
    title: "Sports Physical Therapist",
    qualification: "MPT (Sports Medicine)",
    experienceYears: 8,
    specialization: "Sports Injury & Performance",
    avatar: "/images/SATYA.jpeg",
    bio: "Dedicated sports rehab expert assisting athletes in returning to peak athletic performance.",
    consultationFee: "₹850",
    rating: 4.9,
    reviewsCount: 180,
    availableSlots: ["10:00 AM", "11:30 AM", "01:30 PM", "04:30 PM", "06:00 PM"]
  }
];

const initialTestimonials = [
  {
    patientName: "Rajesh Malhotra",
    patientRole: "L4-L5 Disc Herniation Patient",
    quote: "I was advised surgery for my sciatica pain. Dr. Satya’s decompression and core stabilization protocol got me back to walking without pain in 4 weeks. Truly life-changing care!",
    stars: 5,
    featured: true,
    approved: true
  },
  {
    patientName: "Priya Sundaram",
    patientRole: "Post ACL Reconstruction Athlete",
    quote: "The sports rehab program at Satya was incredibly methodical. From gait retraining to agility drills, they gave me complete confidence to return to marathon running.",
    stars: 5,
    featured: true,
    approved: true
  },
  {
    patientName: "Anil Kapoor",
    patientRole: "Frozen Shoulder Patient",
    quote: "Six months of shoulder stiffness vanished in 3 weeks with Class IV laser therapy and joint mobilization. Punctual, clean, and extremely professional doctors.",
    stars: 5,
    featured: true,
    approved: true
  }
];

const initialFAQs = [
  {
    question: "What conditions do you treat at Satya Physiotherapy Center?",
    answer: "We treat a wide spectrum of physical conditions including back & neck pain, disc herniation, frozen shoulder, knee osteoarthritis, sports injuries (ACL, meniscus), stroke rehabilitation, facial palsy, and post-surgical rehab.",
    category: "General",
    order: 1
  },
  {
    question: "What advanced technology & equipment is available at the clinic?",
    answer: "We feature advanced medical technology including Class IV Laser Therapy, Shortwave Diathermy (SWD), Digital Ultrasound, IFT (Interferential Therapy), TENS, and Automated Cervical/Lumbar Traction.",
    category: "Technology",
    order: 2
  },
  {
    question: "Do I need a doctor referral before booking an appointment?",
    answer: "No referral is mandatory. You can book a direct consultation with our senior physiotherapists. However, if you already have X-rays, MRIs, or prescription notes, please bring them for accurate evaluation.",
    category: "Appointments",
    order: 3
  },
  {
    question: "Can physiotherapy help me avoid surgery for joint or disc pain?",
    answer: "Yes! In many cases of L4-L5 disc bulges, knee arthritis, and rotator cuff tears, targeted spinal decompression, manual mobilization, and core stabilization can resolve pain without surgical intervention.",
    category: "Treatment",
    order: 4
  },
  {
    question: "How long does each physical therapy session take?",
    answer: "An initial comprehensive movement assessment takes approximately 45 to 60 minutes. Subsequent therapy sessions typically last 40 to 50 minutes depending on the treatment plan.",
    category: "Appointments",
    order: 5
  },
  {
    question: "What should I wear or bring to my first appointment?",
    answer: "Please wear comfortable, flexible clothing (like sports shorts or sweatpants) that allows easy access to the affected joint. Bring any relevant diagnostic reports (X-Ray, MRI, CT Scans).",
    category: "Appointments",
    order: 6
  },
  {
    question: "Is physiotherapy treatment painful?",
    answer: "Our treatment procedures are designed to be gentle and therapeutic. While mild stretching discomfort may occur during joint mobilization, our specialists strictly monitor pain thresholds to ensure your comfort.",
    category: "Treatment",
    order: 7
  },
  {
    question: "Are home exercise programs provided alongside therapy?",
    answer: "Yes! Every patient receives a customized, easy-to-follow home exercise guide featuring posture corrections and stretching drills to accelerate recovery between clinic visits.",
    category: "Treatment",
    order: 8
  },
  {
    question: "How many sessions will I require for full recovery?",
    answer: "Recovery timelines depend on the severity of your condition. Acute muscle strains may resolve in 3 to 6 sessions, while chronic nerve or post-operative conditions may require 2 to 4 weeks of structured rehab.",
    category: "Treatment",
    order: 9
  },
  {
    question: "How do you prevent pain relapses after treatment ends?",
    answer: "Before discharge, we transition you through a stabilization phase focusing on joint strengthening, core stability, and ergonomic education to protect you against future injuries.",
    category: "Treatment",
    order: 10
  }
];

const seedData = async () => {
  await connectDB();

  console.log("Clearing existing public data...");
  await Service.deleteMany({});
  await Physiotherapist.deleteMany({});
  await Testimonial.deleteMany({});
  await FAQ.deleteMany({});
  await ClinicInfo.deleteMany({});

  console.log("Seeding services...");
  await Service.insertMany(initialServices);

  console.log("Seeding doctors...");
  await Physiotherapist.insertMany(initialDoctors);

  console.log("Seeding testimonials...");
  await Testimonial.insertMany(initialTestimonials);

  console.log("Seeding FAQs...");
  await FAQ.insertMany(initialFAQs);

  console.log("Seeding clinic info...");
  await ClinicInfo.create({
    clinicName: "Satya Physiotherapy Center",
    tagline: "Move better. Heal deeper. Live stronger.",
    helpline: "+91 7500831828",
    address: "Satya Physiotherapy Center, Main Road, New Delhi",
    email: "contact@satyaphysio.com",
    clinicHours: "Mon–Sat: 8 AM – 8 PM · Sun: 9 AM – 1 PM",
    heroStats: {
      yearsPractice: "15+",
      recoveriesGuided: "12k+",
      recommendationRate: "98%",
      ratingScore: "4.9 / 5",
      totalReviews: "from 900+ patient reviews"
    }
  });

  console.log("Data seeding completed successfully!");
  process.exit(0);
};

seedData();
