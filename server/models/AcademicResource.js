const mongoose = require("mongoose");

const AcademicResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["note", "assignment"],
      default: "note",
    },
    dueDate: {
      type: String,
      default: "",
    },
    subject: {
      type: String, // e.g. "CS-301"
      required: true,
      trim: true,
    },
    subjectName: {
      type: String, // e.g. "Computer Networks"
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
    uploadedBy: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    uploadedDate: {
      type: String, // Store YYYY-MM-DD
      required: true,
    },
    fileUrl: {
      type: String,
      trim: true,
      default: "#",
    },
    downloadUrl: {
      type: String,
      trim: true,
      default: "#",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AcademicResource", AcademicResourceSchema);
