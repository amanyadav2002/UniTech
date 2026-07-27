const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  studentName: String,
  studentUsn: String,
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  fileUrl: String,
  fileName: String,
  marks: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Submitted", "Graded", "Late"],
    default: "Submitted",
  },
});

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    submissions: [SubmissionSchema],
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", AssignmentSchema, "assignments");
