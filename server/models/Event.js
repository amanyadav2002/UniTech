const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // HH:MM AM/PM
    },
    location: {
      type: String,
    },
    department: {
      type: String,
    },
    semester: {
      type: String,
    },
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        email: String,
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    capacity: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema, "events");
