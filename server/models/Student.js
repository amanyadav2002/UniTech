const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    usn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    mail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    blood: {
      type: String,
      required: true,
      trim: true,
    },
    bookmarks: [
      {
        itemId: { type: String, required: true },
        type: { type: String, required: true, enum: ["note", "assignment", "announcement"] },
        title: { type: String, required: true },
        courseCode: { type: String },
        courseName: { type: String },
        dueDate: { type: String },
        category: { type: String },
        link: { type: String },
        content: { type: String },
      }
    ],
    cgpa: {
      type: Number,
      default: 0.0,
    },
    totalEarnedCredits: {
      type: Number,
      default: 0,
    },
    gpaHistory: [
      {
        semester: { type: String, required: true },
        gpa: { type: Number, required: true },
        earnedCredits: { type: Number, required: true },
        remarks: { type: String, default: "" },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", StudentSchema);
