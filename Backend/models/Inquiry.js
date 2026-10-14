const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ""
    },
    condition: {
      type: String,
      required: [true, "Please describe your condition or symptoms"]
    },
    preferredTime: {
      type: String,
      default: "Morning (10 AM - 12 PM)"
    },
    preferredDate: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new"
    },
    isReadAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
