const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    mail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    bookmarks: [
      {
        itemId: { type: String, required: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        courseCode: { type: String },
        courseName: { type: String },
        dueDate: { type: String },
        category: { type: String },
        link: { type: String },
        content: { type: String },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Teacher", TeacherSchema);
