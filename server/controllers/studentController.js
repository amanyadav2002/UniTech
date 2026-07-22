const Student = require("../models/Student");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const AcademicResource = require("../models/AcademicResource");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");
const Notice = require("../models/Notice");
const Task = require("../models/Task");
const Schedule = require("../models/Schedule");

// Helper to get Student Profile by user ID
const getStudentProfileHelper = async (userId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw new Error("Student profile not found");
  }
  return student;
};

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate("user", "-password");
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student profile details
// @route   PUT /api/student/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const { name, phone, age, blood, year, semester } = req.body;

    if (name) {
      student.name = name;
      await User.findByIdAndUpdate(req.user.id, { name });
    }
    if (phone !== undefined) student.phone = phone;
    if (age !== undefined) student.age = Number(age);
    if (blood !== undefined) student.blood = blood;
    if (year !== undefined) student.year = year;
    if (semester !== undefined) student.semester = semester;

    const updatedStudent = await student.save();
    res.json({
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get academic resources matching student's department and semester
// @route   GET /api/student/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    
    // We fetch subjects matching department and semester, or general ones
    const query = {
      $or: [
        { department: student.department, semester: student.semester },
        { department: "All", semester: "All" },
      ]
    };
    
    const resources = await AcademicResource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student attendance dynamically calculated
// @route   GET /api/student/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    const attendanceLogs = await Attendance.find({ student: student._id });
    
    // Get all subjects in the department/semester or classes
    const classes = await Class.find({ department: student.department, semester: student.semester }).populate("faculty");
    const subjects = await Subject.find({ department: student.department });

    const coursesDetails = [];
    
    // Compile attendance statistics per subject
    // We prioritize classes assigned in the semester, but fallback to general subjects
    const subjectsToMap = classes.length > 0
      ? classes.map(c => ({ code: c.subjectCode, name: c.subjectName, teacher: c.faculty?.name || "Faculty Member", credits: 4 }))
      : subjects.map(s => ({ code: s.code, name: s.name, teacher: "Faculty Member", credits: s.credits }));

    let overallHeld = 0;
    let overallAttended = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;

    for (const sub of subjectsToMap) {
      const logs = attendanceLogs.filter(log => log.subjectCode === sub.code);
      const held = logs.length;
      const presentLogs = logs.filter(log => log.status === "Present");
      const lateLogs = logs.filter(log => log.status === "Late");
      const absentLogs = logs.filter(log => log.status === "Absent");
      
      const attended = presentLogs.length + lateLogs.length;

      overallHeld += held;
      overallAttended += attended;
      totalPresent += presentLogs.length;
      totalAbsent += absentLogs.length;
      totalLate += lateLogs.length;

      coursesDetails.push({
        code: sub.code,
        name: sub.name,
        credits: sub.credits,
        teacher: sub.teacher,
        held,
        attended,
        attendance: held > 0 ? Math.round((attended / held) * 100) : 100,
      });
    }

    const overallPercent = overallHeld > 0 ? Math.round((overallAttended / overallHeld) * 100) : 100;

    res.json({
      overallPercent,
      totalHeld: overallHeld,
      totalPresent,
      totalAbsent,
      totalLate,
      coursesDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student grades
// @route   GET /api/student/grades
// @access  Private
exports.getGrades = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    const grades = await Grade.find({ student: student._id });
    
    // We map the grades into the format the UI expects for the list:
    // e.g. code, name, type, marks, status
    const gradesRecord = [];
    
    for (const g of grades) {
      // Add individual assessment term records
      if (g.internal > 0) {
        gradesRecord.push({
          code: g.subjectCode,
          name: g.subjectName,
          type: "Internal IA-1",
          marks: `${g.internal}/50`,
          status: g.internal >= 20 ? "Pass" : "Fail",
        });
      }
      if (g.assignment > 0) {
        gradesRecord.push({
          code: g.subjectCode,
          name: g.subjectName,
          type: "Assignment",
          marks: `${g.assignment}/10`,
          status: g.assignment >= 4 ? "Pass" : "Fail",
        });
      }
      if (g.lab > 0) {
        gradesRecord.push({
          code: g.subjectCode,
          name: g.subjectName,
          type: "Lab Practice",
          marks: `${g.lab}/20`,
          status: g.lab >= 8 ? "Pass" : "Fail",
        });
      }
      if (g.final > 0) {
        gradesRecord.push({
          code: g.subjectCode,
          name: g.subjectName,
          type: "End-Sem Theory",
          marks: `${g.final}/100`,
          status: g.final >= 40 ? "Pass" : "Fail",
        });
      }
      // Add a Total and final grade entry
      if (g.total > 0) {
        gradesRecord.push({
          code: g.subjectCode,
          name: g.subjectName,
          type: `Total Grade: ${g.grade}`,
          marks: `${g.total}/180`,
          status: `Remarks: ${g.remarks || "Good"}`,
        });
      }
    }

    // Return both the mapped structure and raw grades
    res.json({
      gradesRecord,
      rawGrades: grades,
      cgpa: student.cgpa,
      totalEarnedCredits: student.totalEarnedCredits,
      gpaHistory: student.gpaHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student notices
// @route   GET /api/student/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    
    // Fetch notices for student's department/semester or "All"
    const query = {
      $or: [
        { department: student.department },
        { department: "All" },
      ],
      $or: [
        { semester: student.semester },
        { semester: "All" },
      ],
    };
    
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    
    // Map to fields expected by UI: id, title, category, content, date, author, important
    const mappedNotices = notices.map(n => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      content: n.content,
      date: n.date,
      author: n.author,
      important: n.important,
    }));
    
    res.json(mappedNotices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student bookmarks
// @route   GET /api/student/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    res.json(student.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a bookmark
// @route   POST /api/student/bookmarks
// @access  Private
exports.addBookmark = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    const { itemId, type, title, courseCode, courseName, dueDate, category, link, content } = req.body;
    
    if (!itemId || !type || !title) {
      return res.status(400).json({ message: "Item ID, type, and title are required" });
    }

    const alreadyExists = student.bookmarks.some(b => b.itemId === itemId);
    if (alreadyExists) {
      return res.status(400).json({ message: "Item already bookmarked" });
    }

    student.bookmarks.push({ itemId, type, title, courseCode, courseName, dueDate, category, link, content });
    await student.save();
    res.json(student.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/student/bookmarks/:itemId
// @access  Private
exports.removeBookmark = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    student.bookmarks = student.bookmarks.filter(b => b.itemId !== req.params.itemId);
    await student.save();
    res.json(student.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student tasks
// @route   GET /api/student/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    // Map to fields expected by UI: id, text, completed
    const mappedTasks = tasks.map(t => ({
      id: t._id.toString(),
      text: t.title,
      completed: t.completed,
    }));
    res.json(mappedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a student task
// @route   POST /api/student/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { text, completed } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Task text is required" });
    }
    const newTask = new Task({
      title: text,
      completed: completed || false,
      createdBy: req.user.id,
    });
    await newTask.save();
    
    // Return all tasks
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks.map(t => ({ id: t._id.toString(), text: t.title, completed: t.completed })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle or update a student task
// @route   PUT /api/student/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (req.body.completed !== undefined) task.completed = req.body.completed;
    if (req.body.text !== undefined) task.title = req.body.text;
    await task.save();
    
    // Return all tasks
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks.map(t => ({ id: t._id.toString(), text: t.title, completed: t.completed })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a student task
// @route   DELETE /api/student/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, createdBy: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Return all tasks
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks.map(t => ({ id: t._id.toString(), text: t.title, completed: t.completed })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student schedule
// @route   GET /api/student/schedule
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({ userId: req.user.id });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save GPA history
// @route   POST /api/student/gpa
// @access  Private
exports.saveGPA = async (req, res) => {
  try {
    const student = await getStudentProfileHelper(req.user.id);
    const { semester, gpa, earnedCredits, remarks } = req.body;
    
    if (!semester || gpa === undefined || earnedCredits === undefined) {
      return res.status(400).json({ message: "Semester, GPA, and earned credits are required" });
    }

    // Add or update semester record in history
    const existingIndex = student.gpaHistory.findIndex(h => h.semester === semester);
    if (existingIndex > -1) {
      student.gpaHistory[existingIndex] = { semester, gpa: Number(gpa), earnedCredits: Number(earnedCredits), remarks: remarks || "" };
    } else {
      student.gpaHistory.push({ semester, gpa: Number(gpa), earnedCredits: Number(earnedCredits), remarks: remarks || "" });
    }

    // Recalculate CGPA and total earned credits
    let totalCredits = 0;
    let weightedPoints = 0;
    student.gpaHistory.forEach(h => {
      totalCredits += h.earnedCredits;
      weightedPoints += h.gpa * h.earnedCredits;
    });

    student.totalEarnedCredits = totalCredits;
    student.cgpa = totalCredits > 0 ? Number((weightedPoints / totalCredits).toFixed(2)) : 0;

    await student.save();
    res.json({
      cgpa: student.cgpa,
      totalEarnedCredits: student.totalEarnedCredits,
      gpaHistory: student.gpaHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
