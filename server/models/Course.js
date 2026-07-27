const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
    },
    branches: [
      {
        type: String,
        trim: true,
      }
    ],
    semesters: [
      {
        type: String,
        trim: true,
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", CourseSchema, "courses");
