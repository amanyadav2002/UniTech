const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Generate JWT Helper
const generateToken = (id, email, role) => {
  return jwt.sign(
    { id: id.toString(), email, role },
    process.env.JWT_SECRET || "unitech_jwt_secret_key_12345",
    { expiresIn: "7d" }
  );
};

// @desc    Register a new user (with Student/Faculty profile)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  let createdUserId = null;
  try {
    const { name, email, password, role } = req.body;

    // Base Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please enter all required authentication fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedRole = role.toLowerCase();
    if (!["student", "faculty"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role specified for signup" });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Validate Custom profile fields
    let profileData = {};
    if (normalizedRole === "student") {
      const { id, age, usn, phone, year, semester, dob, blood } = req.body;
      if (!id || !age || !usn || !phone || !year || !semester || !dob || !blood) {
        return res.status(400).json({ message: "Please fill in all student profile fields" });
      }

      // Check unique constraints for student profile
      const dupStudentId = await Student.findOne({ id: id.trim() });
      if (dupStudentId) return res.status(400).json({ message: "Student ID already exists" });

      const dupStudentUsn = await Student.findOne({ usn: usn.trim().toUpperCase() });
      if (dupStudentUsn) return res.status(400).json({ message: "USN already exists" });

      const dupStudentMail = await Student.findOne({ mail: email.toLowerCase().trim() });
      if (dupStudentMail) return res.status(400).json({ message: "Email is already linked to a student profile" });

      profileData = { id, age, usn, phone, year, semester, dob, blood };
    } else if (normalizedRole === "faculty") {
      const { id, age, phone, department, salary, dob } = req.body;
      if (!id || !age || !phone || !department || !salary || !dob) {
        return res.status(400).json({ message: "Please fill in all teacher profile fields" });
      }

      // Check unique constraints for teacher profile
      const dupTeacherId = await Teacher.findOne({ id: id.trim() });
      if (dupTeacherId) return res.status(400).json({ message: "Teacher ID already exists" });

      const dupTeacherMail = await Teacher.findOne({ mail: email.toLowerCase().trim() });
      if (dupTeacherMail) return res.status(400).json({ message: "Email is already linked to a teacher profile" });

      profileData = { id, age, phone, department, salary, dob };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Create Core User
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: normalizedRole,
    });

    const savedUser = await newUser.save();
    createdUserId = savedUser._id;

    // 2. Create Role Profile Document
    let savedProfile = null;
    if (normalizedRole === "student") {
      const newStudentProfile = new Student({
        user: savedUser._id,
        name: savedUser.name,
        id: profileData.id.trim(),
        age: Number(profileData.age),
        usn: profileData.usn.trim().toUpperCase(),
        mail: savedUser.email,
        phone: profileData.phone.trim(),
        year: profileData.year.trim(),
        semester: profileData.semester.trim(),
        dob: new Date(profileData.dob),
        blood: profileData.blood.trim(),
      });
      savedProfile = await newStudentProfile.save();
    } else if (normalizedRole === "faculty") {
      const newTeacherProfile = new Teacher({
        user: savedUser._id,
        name: savedUser.name,
        id: profileData.id.trim(),
        age: Number(profileData.age),
        phone: profileData.phone.trim(),
        mail: savedUser.email,
        department: profileData.department.trim(),
        salary: Number(profileData.salary),
        dob: new Date(profileData.dob),
      });
      savedProfile = await newTeacherProfile.save();
    }

    // Generate Token
    const token = generateToken(savedUser._id, savedUser.email, savedUser.role);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        profile: savedProfile,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    // Cleanup User if profile creation failed to ensure integrity
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
    res.status(500).json({ message: error.message || "Server error occurred during signup" });
  }
};

// @desc    Authenticate a user & get token (populated with profile data)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const normalizedRole = role.toLowerCase();

    // Find User
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify role matches
    if (user.role !== normalizedRole) {
      return res.status(400).json({ message: `Account is not registered as ${role}` });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Retrieve corresponding profile details
    let profile = null;
    if (normalizedRole === "student") {
      profile = await Student.findOne({ user: user._id });
    } else if (normalizedRole === "faculty") {
      profile = await Teacher.findOne({ user: user._id });
    }

    // Generate Token
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error occurred during login" });
  }
};

// @desc    Get user data (with populated profile details)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve corresponding profile details
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === "faculty") {
      profile = await Teacher.findOne({ user: user._id });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: profile,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error occurred retrieving user profile" });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, age, blood, year, semester, department, salary } = req.body;

    // Find User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update base user details if provided
    if (name) {
      user.name = name.trim();
      await user.save();
    }

    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: userId });
      if (profile) {
        if (phone !== undefined) profile.phone = phone.trim();
        if (age !== undefined) profile.age = Number(age);
        if (blood !== undefined) profile.blood = blood.trim();
        if (year !== undefined) profile.year = year.trim();
        if (semester !== undefined) profile.semester = semester.trim();
        if (name) profile.name = name.trim();
        await profile.save();
      }
    } else if (user.role === "faculty") {
      profile = await Teacher.findOne({ user: userId });
      if (profile) {
        if (phone !== undefined) profile.phone = phone.trim();
        if (age !== undefined) profile.age = Number(age);
        if (department !== undefined) profile.department = department.trim();
        if (salary !== undefined) profile.salary = Number(salary);
        if (name) profile.name = name.trim();
        await profile.save();
      }
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error occurred during profile update" });
  }
};

// @desc    Add a bookmark to student profile
// @route   POST /api/auth/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type, title, courseCode, courseName, dueDate, category, link, content } = req.body;

    if (!itemId || !type || !title) {
      return res.status(400).json({ message: "Item ID, type, and title are required for bookmarking" });
    }

    // Find Student profile
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Check if already bookmarked
    const alreadyBookmarked = student.bookmarks.some(b => b.itemId === itemId);
    if (alreadyBookmarked) {
      return res.status(400).json({ message: "Item is already bookmarked" });
    }

    // Add bookmark
    student.bookmarks.push({ itemId, type, title, courseCode, courseName, dueDate, category, link, content });
    await student.save();

    // Get base user to return populated user object
    const user = await User.findById(userId).select("-password");

    res.json({
      message: "Bookmark added successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: student,
      }
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Server error occurred adding bookmark" });
  }
};

// @desc    Remove a bookmark from student profile
// @route   DELETE /api/auth/bookmarks/:itemId
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Find Student profile
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Pull bookmark
    student.bookmarks = student.bookmarks.filter(b => b.itemId !== itemId);
    await student.save();

    // Get base user to return populated user object
    const user = await User.findById(userId).select("-password");

    res.json({
      message: "Bookmark removed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: student,
      }
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ message: "Server error occurred removing bookmark" });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  addBookmark,
  removeBookmark,
};
