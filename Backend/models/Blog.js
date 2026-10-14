const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
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
      default: "Orthopedic Care"
    },
    author: {
      type: String,
      default: "Dr. Satya Prakash & Team"
    },
    readTime: {
      type: String,
      default: "5 min read"
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
    },
    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"]
    },
    content: {
      type: String,
      required: [true, "Blog content is required"]
    },
    featured: {
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

module.exports = mongoose.model("Blog", blogSchema);
