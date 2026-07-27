const mongoose = require("mongoose");

const VisitorLogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleNo: {
      type: String,
      trim: true,
      default: "",
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    studentGatePass: {
      isPass: { type: Boolean, default: false },
      studentName: { type: String, default: "" },
      studentUsn: { type: String, default: "" },
      reason: { type: String, default: "" },
    },
    emergencyAlert: {
      isEmergency: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
    lostFound: {
      item: { type: String, default: "" },
      reporter: { type: String, default: "" },
      status: { type: String, enum: ["None", "Lost", "Found", "Claimed"], default: "None" },
    },
    incidentReport: {
      hasIncident: { type: Boolean, default: false },
      details: { type: String, default: "" },
      reportedBy: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["Active", "Cleared"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VisitorLog", VisitorLogSchema, "visitorLogs");
