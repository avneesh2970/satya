const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "News title is required"],
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
      default: "Announcement"
    },
    author: {
      type: String,
      default: "Satya Physiotherapy Admin"
    },
    summary: {
      type: String,
      required: [true, "News summary is required"]
    },
    content: {
      type: String,
      required: [true, "News content is required"]
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
    },
    important: {
      type: Boolean,
      default: false
    },
    published: {
      type: Boolean,
      default: true
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

module.exports = mongoose.model("News", newsSchema);
