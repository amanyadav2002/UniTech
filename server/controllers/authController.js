const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Security = require("../models/Security");

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

    // Clean up existing User(s) with this email to allow overwrite/re-registration
    const matchedUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (matchedUser) {
      await User.deleteOne({ _id: matchedUser._id });
      if (matchedUser.role === "student") {
        await Student.deleteOne({ user: matchedUser._id });
      } else if (matchedUser.role === "faculty") {
        await Teacher.deleteOne({ user: matchedUser._id });
      }
    }

    // Validate Custom profile fields
    let profileData = {};
    if (normalizedRole === "student") {
      const { id, age, usn, phone, year, semester, dob, blood, department } = req.body;

      // Handle fallback values if profile details are missing
      const finalId = (id || usn || `STU${Math.floor(1000 + Math.random() * 9000)}`).trim();
      const finalUsn = (usn || id || `1RV21CS${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();
      const finalAge = age ? Number(age) : 20;
      const finalPhone = (phone || "+1 (555) 014-9900").trim();
      const finalYear = (year || "3rd Year").trim();
      const finalSemester = (semester || "6th Sem").trim();
      const finalDob = dob ? new Date(dob) : new Date("2005-08-15");
      const finalBlood = (blood || "O+").trim();
      const finalDept = (department || "Computer Science Department").trim();

      // Clean up any existing students matching finalId, finalUsn, or mail to avoid duplicate key errors
      const existingStudents = await Student.find({
        $or: [
          { id: finalId },
          { usn: finalUsn },
          { mail: email.toLowerCase().trim() }
        ]
      });
      for (const s of existingStudents) {
        await User.deleteOne({ _id: s.user });
        await Student.deleteOne({ _id: s._id });
      }

      profileData = {
        id: finalId,
        age: finalAge,
        usn: finalUsn,
        phone: finalPhone,
        year: finalYear,
        semester: finalSemester,
        dob: finalDob,
        blood: finalBlood,
        department: finalDept
      };
    } else if (normalizedRole === "faculty") {
      const { id, age, phone, department, salary, dob } = req.body;

      // Handle fallback values if profile details are missing
      const finalId = (id || `FAC${Math.floor(1000 + Math.random() * 9000)}`).trim();
      const finalAge = age ? Number(age) : 35;
      const finalPhone = (phone || "+1 (555) 014-9900").trim();
      const finalDept = (department || "Computer Science Department").trim();
      const finalSalary = salary ? Number(salary) : 75000;
      const finalDob = dob ? new Date(dob) : new Date("1990-01-01");

      // Clean up any existing teachers matching finalId or mail to avoid duplicate key errors
      const existingTeachers = await Teacher.find({
        $or: [
          { id: finalId },
          { mail: email.toLowerCase().trim() }
        ]
      });
      for (const t of existingTeachers) {
        await User.deleteOne({ _id: t.user });
        await Teacher.deleteOne({ _id: t._id });
      }

      profileData = {
        id: finalId,
        age: finalAge,
        phone: finalPhone,
        department: finalDept,
        salary: finalSalary,
        dob: finalDob
      };
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
        id: profileData.id,
        age: profileData.age,
        usn: profileData.usn,
        mail: savedUser.email,
        password: savedUser.password,
        phone: profileData.phone,
        year: profileData.year,
        semester: profileData.semester,
        dob: profileData.dob,
        blood: profileData.blood,
        department: profileData.department,
      });
      savedProfile = await newStudentProfile.save();
    } else if (normalizedRole === "faculty") {
      const newTeacherProfile = new Teacher({
        user: savedUser._id,
        name: savedUser.name,
        id: profileData.id,
        age: profileData.age,
        phone: profileData.phone,
        mail: savedUser.email,
        password: savedUser.password,
        department: profileData.department,
        salary: profileData.salary,
        dob: profileData.dob,
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

    // Find User (supports Username for Admin, Email/USN/ID for other roles)
    let user = null;
    if (normalizedRole === "admin") {
      user = await User.findOne({ username: email.trim() });
    } else {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }
    if (!user) {
      // Alternate lookup if email yields no match
      if (normalizedRole === "student") {
        const studentProfile = await Student.findOne({
          $or: [
            { usn: email.trim().toUpperCase() },
            { id: email.trim() }
          ]
        });
        if (studentProfile) {
          user = await User.findById(studentProfile.user);
        }
      } else if (normalizedRole === "faculty") {
        const teacherProfile = await Teacher.findOne({ id: email.trim() });
        if (teacherProfile) {
          user = await User.findById(teacherProfile.user);
        }
      } else if (normalizedRole === "admin") {
        const adminProfile = await Admin.findOne({ id: email.trim() });
        if (adminProfile) {
          user = await User.findById(adminProfile.user);
        }
      } else if (normalizedRole === "security") {
        const securityProfile = await Security.findOne({ id: email.trim() });
        if (securityProfile) {
          user = await User.findById(securityProfile.user);
        }
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify role matches
    if (user.role !== normalizedRole) {
      return res.status(400).json({ message: `Account is not registered as ${role}` });
    }

    // Retrieve corresponding profile details (with self-healing)
    let profile = null;
    if (normalizedRole === "student") {
      profile = await Student.findOne({ user: user._id });
      if (!profile) {
        // Automatically create a default student profile if it is missing
        const defaultStudent = new Student({
          user: user._id,
          name: user.name,
          id: `STU${Math.floor(1000 + Math.random() * 9000)}`,
          age: 20,
          usn: `1RI23CS${Math.floor(100 + Math.random() * 900)}`,
          mail: user.email,
          password: user.password,
          phone: "+1 (555) 014-9900",
          year: "3rd Year",
          semester: "6th Sem",
          dob: new Date("2005-08-15"),
          blood: "O+",
          department: "Computer Science Department",
        });
        profile = await defaultStudent.save();
        console.log(`Automatically created missing student profile for ${user.email}`);
      }
    } else if (normalizedRole === "faculty") {
      profile = await Teacher.findOne({ user: user._id });
      if (!profile) {
        // Automatically create a default teacher profile if it is missing
        const defaultTeacher = new Teacher({
          user: user._id,
          name: user.name,
          id: `FAC${Math.floor(1000 + Math.random() * 9000)}`,
          age: 35,
          phone: "+1 (555) 014-9900",
          mail: user.email,
          password: user.password,
          department: "Computer Science Department",
          salary: 75000,
          dob: new Date("1990-01-01"),
        });
        profile = await defaultTeacher.save();
        console.log(`Automatically created missing teacher profile for ${user.email}`);
      }
    } else if (normalizedRole === "admin") {
      profile = await Admin.findOne({ user: user._id });
    } else if (normalizedRole === "security") {
      profile = await Security.findOne({ user: user._id });
    }

    // Determine which password hash to verify against
    let storedPassword = user.password;
    if (profile && (normalizedRole === "student" || normalizedRole === "faculty") && profile.password) {
      storedPassword = profile.password;
    }

    // Match password (support both bcrypt hash and plain text fallback)
    let isMatch = false;
    if (storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2y$")) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      isMatch = (password === storedPassword);
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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
      if (!profile) {
        const defaultStudent = new Student({
          user: user._id,
          name: user.name,
          id: `STU${Math.floor(1000 + Math.random() * 9000)}`,
          age: 20,
          usn: `1RI23CS${Math.floor(100 + Math.random() * 900)}`,
          mail: user.email,
          password: user.password || "",
          phone: "+1 (555) 014-9900",
          year: "3rd Year",
          semester: "6th Sem",
          dob: new Date("2005-08-15"),
          blood: "O+",
          department: "Computer Science Department",
        });
        profile = await defaultStudent.save();
      }
    } else if (user.role === "faculty") {
      profile = await Teacher.findOne({ user: user._id });
      if (!profile) {
        const defaultTeacher = new Teacher({
          user: user._id,
          name: user.name,
          id: `FAC${Math.floor(1000 + Math.random() * 9000)}`,
          age: 35,
          phone: "+1 (555) 014-9900",
          mail: user.email,
          password: user.password || "",
          department: "Computer Science Department",
          salary: 75000,
          dob: new Date("1990-01-01"),
        });
        profile = await defaultTeacher.save();
      }
    } else if (user.role === "admin") {
      profile = await Admin.findOne({ user: user._id });
    } else if (user.role === "security") {
      profile = await Security.findOne({ user: user._id });
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

// @desc    Add a bookmark to user profile
// @route   POST /api/auth/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type, title, courseCode, courseName, dueDate, category, link, content } = req.body;

    if (!itemId || !type || !title) {
      return res.status(400).json({ message: "Item ID, type, and title are required for bookmarking" });
    }

    // Get user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile;
    if (user.role === "student") {
      profile = await Student.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
    } else if (user.role === "faculty") {
      profile = await Teacher.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({ message: "Faculty profile not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid role for bookmarking" });
    }

    // Check if already bookmarked
    const alreadyBookmarked = profile.bookmarks.some(b => b.itemId === itemId);
    if (alreadyBookmarked) {
      return res.status(400).json({ message: "Item is already bookmarked" });
    }

    // Add bookmark
    profile.bookmarks.push({ itemId, type, title, courseCode, courseName, dueDate, category, link, content });
    await profile.save();

    res.json({
      message: "Bookmark added successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile,
      }
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Server error occurred adding bookmark" });
  }
};

// @desc    Remove a bookmark from user profile
// @route   DELETE /api/auth/bookmarks/:itemId
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Get user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile;
    if (user.role === "student") {
      profile = await Student.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
    } else if (user.role === "faculty") {
      profile = await Teacher.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({ message: "Faculty profile not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid role for bookmarking" });
    }

    // Pull bookmark
    profile.bookmarks = profile.bookmarks.filter(b => b.itemId !== itemId);
    await profile.save();

    res.json({
      message: "Bookmark removed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile,
      }
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ message: "Server error occurred removing bookmark" });
  }
};

// @desc    Check if email is already registered
// @route   POST /api/auth/social-check
// @access  Public
const checkSocialEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ exists: false });
    }

    // Determine registration provider
    let provider = "password";
    if (user.googleId) provider = "google";
    else if (user.githubId) provider = "github";

    res.json({
      exists: true,
      provider,
      role: user.role,
    });
  } catch (error) {
    console.error("Check social email error:", error);
    res.status(500).json({ message: "Server error checking email status" });
  }
};

// @desc    Authenticate existing user via Google or GitHub
// @route   POST /api/auth/social-login
// @access  Public
const socialLogin = async (req, res) => {
  try {
    const { email, provider, providerId } = req.body;

    if (!email || !provider || !providerId) {
      return res.status(400).json({ message: "Please provide email, provider, and providerId" });
    }

    const normalizedProvider = provider.toLowerCase();
    if (!["google", "github"].includes(normalizedProvider)) {
      return res.status(400).json({ message: "Invalid OAuth provider" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // Link the social ID if it isn't linked yet
    let updated = false;
    if (normalizedProvider === "google" && !user.googleId) {
      user.googleId = providerId;
      updated = true;
    } else if (normalizedProvider === "github" && !user.githubId) {
      user.githubId = providerId;
      updated = true;
    }
    if (updated) {
      await user.save();
    }

    // Retrieve corresponding profile details
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === "faculty") {
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
    console.error("Social login error:", error);
    res.status(500).json({ message: "Server error occurred during social login" });
  }
};

// @desc    Register a new user via Google or GitHub
// @route   POST /api/auth/social-signup
// @access  Public
const socialSignup = async (req, res) => {
  let createdUserId = null;
  try {
    const { name, email, role, provider, providerId } = req.body;

    if (!name || !email || !role || !provider || !providerId) {
      return res.status(400).json({ message: "Please enter all required authentication fields" });
    }

    const normalizedRole = role.toLowerCase();
    if (!["student", "faculty"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role specified for signup" });
    }

    const normalizedProvider = provider.toLowerCase();
    if (!["google", "github"].includes(normalizedProvider)) {
      return res.status(400).json({ message: "Invalid OAuth provider" });
    }

    // Clean up existing User(s) with this email to allow overwrite/re-registration
    const matchedUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (matchedUser) {
      await User.deleteOne({ _id: matchedUser._id });
      if (matchedUser.role === "student") {
        await Student.deleteOne({ user: matchedUser._id });
      } else if (matchedUser.role === "faculty") {
        await Teacher.deleteOne({ user: matchedUser._id });
      }
    }

    // Validate Custom profile fields
    let profileData = {};
    if (normalizedRole === "student") {
      const { id, age, usn, phone, year, semester, dob, blood, department } = req.body;

      // Handle fallback values if profile details are missing
      const finalId = (id || usn || `STU${Math.floor(1000 + Math.random() * 9000)}`).trim();
      const finalUsn = (usn || id || `1RV21CS${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();
      const finalAge = age ? Number(age) : 20;
      const finalPhone = (phone || "+1 (555) 014-9900").trim();
      const finalYear = (year || "3rd Year").trim();
      const finalSemester = (semester || "6th Sem").trim();
      const finalDob = dob ? new Date(dob) : new Date("2005-08-15");
      const finalBlood = (blood || "O+").trim();
      const finalDept = (department || "Computer Science Department").trim();

      // Clean up any existing students matching finalId, finalUsn, or mail to avoid duplicate key errors
      const existingStudents = await Student.find({
        $or: [
          { id: finalId },
          { usn: finalUsn },
          { mail: email.toLowerCase().trim() }
        ]
      });
      for (const s of existingStudents) {
        await User.deleteOne({ _id: s.user });
        await Student.deleteOne({ _id: s._id });
      }

      profileData = {
        id: finalId,
        age: finalAge,
        usn: finalUsn,
        phone: finalPhone,
        year: finalYear,
        semester: finalSemester,
        dob: finalDob,
        blood: finalBlood,
        department: finalDept
      };
    } else if (normalizedRole === "faculty") {
      const { id, age, phone, department, salary, dob } = req.body;

      // Handle fallback values if profile details are missing
      const finalId = (id || `FAC${Math.floor(1000 + Math.random() * 9000)}`).trim();
      const finalAge = age ? Number(age) : 35;
      const finalPhone = (phone || "+1 (555) 014-9900").trim();
      const finalDept = (department || "Computer Science Department").trim();
      const finalSalary = salary ? Number(salary) : 75000;
      const finalDob = dob ? new Date(dob) : new Date("1990-01-01");

      // Clean up any existing teachers matching finalId or mail to avoid duplicate key errors
      const existingTeachers = await Teacher.find({
        $or: [
          { id: finalId },
          { mail: email.toLowerCase().trim() }
        ]
      });
      for (const t of existingTeachers) {
        await User.deleteOne({ _id: t.user });
        await Teacher.deleteOne({ _id: t._id });
      }

      profileData = {
        id: finalId,
        age: finalAge,
        phone: finalPhone,
        department: finalDept,
        salary: finalSalary,
        dob: finalDob
      };
    }

    // 1. Create Core User with Social ID
    const newUserParams = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: normalizedRole,
    };

    if (normalizedProvider === "google") {
      newUserParams.googleId = providerId;
    } else if (normalizedProvider === "github") {
      newUserParams.githubId = providerId;
    }

    const newUser = new User(newUserParams);
    const savedUser = await newUser.save();
    createdUserId = savedUser._id;

    // 2. Create Role Profile Document
    let savedProfile = null;
    if (normalizedRole === "student") {
      const newStudentProfile = new Student({
        user: savedUser._id,
        name: savedUser.name,
        id: profileData.id,
        age: profileData.age,
        usn: profileData.usn,
        mail: savedUser.email,
        password: "", // social signup has no password
        phone: profileData.phone,
        year: profileData.year,
        semester: profileData.semester,
        dob: profileData.dob,
        blood: profileData.blood,
        department: profileData.department,
      });
      savedProfile = await newStudentProfile.save();
    } else if (normalizedRole === "faculty") {
      const newTeacherProfile = new Teacher({
        user: savedUser._id,
        name: savedUser.name,
        id: profileData.id,
        age: profileData.age,
        phone: profileData.phone,
        mail: savedUser.email,
        password: "", // social signup has no password
        department: profileData.department,
        salary: profileData.salary,
        dob: profileData.dob,
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
    console.error("Social signup error:", error);
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
    res.status(500).json({ message: error.message || "Server error occurred during social signup" });
  }
};

// @desc    Verify Google ID Token & Authenticate User
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Google ID Token is required" });
    }

    // Verify ID Token with Google's tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const tokenInfo = await response.json();

    if (!response.ok) {
      console.error("Google token verification failed:", tokenInfo);
      return res.status(400).json({ message: tokenInfo.error_description || "Invalid Google token" });
    }

    // Verify audience (client_id) matches
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && tokenInfo.aud !== expectedClientId) {
      return res.status(400).json({ message: "Token audience mismatch" });
    }

    const { sub: googleId, email, name } = tokenInfo;

    // Find User
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (user) {
      // User exists! Link Google ID if missing
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (updated) {
        await user.save();
      }

      // Retrieve corresponding profile details
      let profile = null;
      if (user.role === "student") {
        profile = await Student.findOne({ user: user._id });
      } else if (user.role === "faculty") {
        profile = await Teacher.findOne({ user: user._id });
      }

      // Generate Token
      const token = generateToken(user._id, user.email, user.role);

      return res.json({
        exists: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: profile,
        },
      });
    } else {
      // User does not exist, return user info for registration completion
      return res.json({
        exists: false,
        googleId,
        email,
        name,
      });
    }
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Server error occurred during Google sign in" });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  addBookmark,
  removeBookmark,
  checkSocialEmail,
  socialLogin,
  socialSignup,
  googleLogin,
};
