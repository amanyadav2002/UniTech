const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    targetRole: {
      type: String,
      enum: ["all", "student", "faculty", "security"],
      default: "all",
    },
    targetDept: {
      type: String,
      default: "All",
    },
    targetSemester: {
      type: String,
      default: "All",
    },
    sentBy: {
      type: String,
      default: "Admin",
    },
    sentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema, "notifications");
