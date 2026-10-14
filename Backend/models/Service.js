const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      default: "Orthopedic Rehabilitation"
    },
    description: {
      type: String,
      required: [true, "Service description is required"]
    },
    iconName: {
      type: String,
      default: "Activity"
    },
    image: {
      type: String,
      default: "/images/hero_physio.jpg"
    },
    duration: {
      type: String,
      default: "45 mins"
    },
    price: {
      type: String,
      default: "₹1,200"
    },
    active: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Service", serviceSchema);
