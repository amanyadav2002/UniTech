const express = require("express");
const router = express.Router();
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getClasses,
  getAttendanceRoster,
  submitAttendance,
  getGrades,
  submitGrade,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getSchedule,
  uploadResource,
  getResources,
  deleteResource,
  getAllStudents,
  createPersonalizedCourse,
  markStudentAttendance,
} = require("../controllers/facultyController");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/classes", authMiddleware, getClasses);
router.get("/attendance", authMiddleware, getAttendanceRoster);
router.post("/attendance", authMiddleware, submitAttendance);
router.get("/grades", authMiddleware, getGrades);
router.post("/grades", authMiddleware, submitGrade);
router.get("/notices", authMiddleware, getNotices);
router.post("/notices", authMiddleware, createNotice);
router.put("/notices/:id", authMiddleware, updateNotice);
router.delete("/notices/:id", authMiddleware, deleteNotice);
router.get("/schedule", authMiddleware, getSchedule);
router.get("/resources", authMiddleware, getResources);
router.post("/resources", authMiddleware, uploadResource);
router.delete("/resources/:id", authMiddleware, deleteResource);

router.get("/students", authMiddleware, getAllStudents);
router.post("/personalized-course", authMiddleware, createPersonalizedCourse);
router.post("/student-attendance", authMiddleware, markStudentAttendance);

// Multer Setup for Media Uploads
const multer = require("multer");
const fs = require("fs");
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

const Event = require("../models/Event");
router.get("/events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
