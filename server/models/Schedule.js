const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema(
  {
    userRole: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day: {
      type: String, // e.g. "Monday", "Tuesday", etc.
      required: true,
    },
    time: {
      type: String, // e.g. "09:00 AM - 10:30 AM"
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", ScheduleSchema);
