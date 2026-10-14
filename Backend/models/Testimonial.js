const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true
    },
    patientRole: {
      type: String,
      default: "Patient",
      trim: true
    },
    quote: {
      type: String,
      required: [true, "Testimonial quote is required"]
    },
    stars: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    tag: {
      type: String,
      default: "Recovery Milestone"
    },
    featured: {
      type: Boolean,
      default: true
    },
    approved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);

