const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getSecurity,
  createSecurity,
  updateSecurity,
  deleteSecurity,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetUserPassword,
  getDepartments,
  createDepartment,
  deleteDepartment,
  getCourses,
  createCourse,
  deleteCourse,
  getSubjects,
  createSubject,
  deleteSubject,
  getSemesters,
  createSemester,
  deleteSemester,
  getClasses,
  createClass,
  deleteClass,
  getAttendanceReport,
  getLeaveRequests,
  reviewLeaveRequest,
  getNotices,
  createNotice,
  deleteNotice,
  getEvents,
  createEvent,
  deleteEvent,
  getSecurityMonitoringLogs,
  createVisitorLog,
  checkoutVisitor,
  getMaterials,
  createMaterial,
  deleteMaterial,
  getAssignments,
  createAssignment,
  deleteAssignment,
  sendNotification,
  getReports,
  generateReport,
  getSystemSettings,
  updateSystemSettings
} = require("../controllers/adminController");

// Admin Role authorization checker middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access only" });
  }
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

// Stats
router.get("/stats", getDashboardStats);

// User CRUD
router.get("/students", getStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

router.get("/faculty", getFaculty);
router.post("/faculty", createFaculty);
router.put("/faculty/:id", updateFaculty);
router.delete("/faculty/:id", deleteFaculty);

router.get("/security", getSecurity);
router.post("/security", createSecurity);
router.put("/security/:id", updateSecurity);
router.delete("/security/:id", deleteSecurity);

router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

router.post("/reset-password", resetUserPassword);

// Academics Configuration
router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.delete("/departments/:id", deleteDepartment);

router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.delete("/courses/:id", deleteCourse);

router.get("/subjects", getSubjects);
router.post("/subjects", createSubject);
router.delete("/subjects/:id", deleteSubject);

router.get("/semesters", getSemesters);
router.post("/semesters", createSemester);
router.delete("/semesters/:id", deleteSemester);

router.get("/classes", getClasses);
router.post("/classes", createClass);
router.delete("/classes/:id", deleteClass);

// Attendance & Leaves
router.get("/attendance/report", getAttendanceReport);
router.get("/leaves", getLeaveRequests);
router.put("/leaves/:id", reviewLeaveRequest);

// Notice Board
router.get("/notices", getNotices);
router.post("/notices", createNotice);
router.delete("/notices/:id", deleteNotice);

// Events
router.get("/events", getEvents);
router.post("/events", createEvent);
router.delete("/events/:id", deleteEvent);

// Security logs
router.get("/security-logs", getSecurityMonitoringLogs);
router.post("/security-logs", createVisitorLog);
router.put("/security-logs/:id/checkout", checkoutVisitor);

// Materials & Assignments
router.get("/materials", getMaterials);
router.post("/materials", createMaterial);
router.delete("/materials/:id", deleteMaterial);

router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.delete("/assignments/:id", deleteAssignment);

// Notifications Center
router.post("/notifications/send", sendNotification);

// Reports Generator
router.get("/reports", getReports);
router.post("/reports/generate", generateReport);

// System Settings
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

module.exports = router;
