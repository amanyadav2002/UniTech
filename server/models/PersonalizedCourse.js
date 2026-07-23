const mongoose = require("mongoose");

const PersonalizedCourseSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    credits: {
      type: Number,
      required: true,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate course registration for the same student
PersonalizedCourseSchema.index({ student: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model("PersonalizedCourse", PersonalizedCourseSchema);
