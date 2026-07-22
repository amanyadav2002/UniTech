const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getResources,
  getAttendance,
  getGrades,
  getNotices,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getSchedule,
  saveGPA,
} = require("../controllers/studentController");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/resources", authMiddleware, getResources);
router.get("/attendance", authMiddleware, getAttendance);
router.get("/grades", authMiddleware, getGrades);
router.get("/notices", authMiddleware, getNotices);
router.get("/bookmarks", authMiddleware, getBookmarks);
router.post("/bookmarks", authMiddleware, addBookmark);
router.delete("/bookmarks/:itemId", authMiddleware, removeBookmark);
router.get("/tasks", authMiddleware, getTasks);
router.post("/tasks", authMiddleware, createTask);
router.put("/tasks/:id", authMiddleware, updateTask);
router.delete("/tasks/:id", authMiddleware, deleteTask);
router.get("/schedule", authMiddleware, getSchedule);
router.post("/gpa", authMiddleware, saveGPA);

module.exports = router;
