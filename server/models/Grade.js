const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    internal: {
      type: Number,
      default: 0,
    },
    assignment: {
      type: Number,
      default: 0,
    },
    lab: {
      type: Number,
      default: 0,
    },
    final: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      trim: true,
      default: "F",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one grade entry per student per subject
GradeSchema.index({ student: 1, subjectCode: 1 }, { unique: true });

module.exports = mongoose.model("Grade", GradeSchema);
