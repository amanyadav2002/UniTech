const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
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
    date: {
      type: String, // Store YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      required: true,
    },
    period: {
      type: String,
      trim: true,
    },
    hours: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student only has one attendance record per class per period per day
AttendanceSchema.index({ student: 1, subjectCode: 1, date: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
