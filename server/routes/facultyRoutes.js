const express = require("express");
const router = express.Router();
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

module.exports = router;
