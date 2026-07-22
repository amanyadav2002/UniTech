const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["academic", "events", "exams"],
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // Store YYYY-MM-DD
      required: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    important: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String, // e.g. "Computer Science" or "All"
      default: "All",
    },
    semester: {
      type: String, // e.g. "6th Sem" or "All"
      default: "All",
    },
    visibleUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notice", NoticeSchema);
