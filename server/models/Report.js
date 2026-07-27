const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Attendance", "Students", "Faculty", "Assignments", "Visitors", "Events", "Departments"],
      required: true,
    },
    format: {
      type: String,
      enum: ["PDF", "Excel"],
      required: true,
    },
    generatedBy: {
      type: String,
      default: "Admin System",
    },
    downloadUrl: {
      type: String,
      default: "#",
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", ReportSchema, "reports");
