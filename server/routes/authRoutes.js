const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateProfile, addBookmark, removeBookmark, checkSocialEmail, socialLogin, socialSignup, googleLogin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const Department = require("../models/Department");
const Semester = require("../models/Semester");
const Course = require("../models/Course");

// @route   POST api/auth/signup
// @desc    Register user
router.post("/signup", signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post("/login", login);

// @route   POST api/auth/social-check
// @desc    Check if email exists
router.post("/social-check", checkSocialEmail);

// @route   POST api/auth/social-login
// @desc    Authenticate user via Google/GitHub
router.post("/social-login", socialLogin);

// @route   POST api/auth/social-signup
// @desc    Register user via Google/GitHub
router.post("/social-signup", socialSignup);

// @route   POST api/auth/google
// @desc    Verify Google ID token and login
router.post("/google", googleLogin);

// @route   GET api/auth/me
// @desc    Get logged in user profile
router.get("/me", authMiddleware, getMe);

// @route   PUT api/auth/profile
// @desc    Update user profile details
router.put("/profile", authMiddleware, updateProfile);

// @route   POST api/auth/bookmarks
// @desc    Add a bookmark to student profile
router.post("/bookmarks", authMiddleware, addBookmark);

// @route   DELETE api/auth/bookmarks/:itemId
// @desc    Remove a bookmark from student profile
router.delete("/bookmarks/:itemId", authMiddleware, removeBookmark);

// @route   GET api/auth/departments
// @desc    Get list of registered departments for public signup selection
router.get("/departments", async (req, res) => {
  try {
    const depts = await Department.find().sort({ name: 1 });
    res.json({ departments: depts });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching departments" });
  }
});

// @route   GET api/auth/semesters
// @desc    Get list of registered semesters for public signup selection
router.get("/semesters", async (req, res) => {
  try {
    const sems = await Semester.find();
    sems.sort((a, b) => {
      const numA = parseInt(a.name);
      const numB = parseInt(b.name);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.name.localeCompare(b.name);
    });
    res.json({ semesters: sems });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching semesters" });
  }
});

// @route   GET api/auth/courses
// @desc    Get list of registered courses for selection
router.get("/courses", async (req, res) => {
  try {
    const list = await Course.find().sort({ code: 1 });
    res.json({ courses: list });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching courses" });
  }
});

module.exports = router;
