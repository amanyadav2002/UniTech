const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateProfile, addBookmark, removeBookmark } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   POST api/auth/signup
// @desc    Register user
router.post("/signup", signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post("/login", login);

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

module.exports = router;
