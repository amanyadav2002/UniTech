const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Security = require("../models/Security");
const Department = require("../models/Department");
const Course = require("../models/Course");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Material = require("../models/Material");
const LeaveRequest = require("../models/LeaveRequest");
const Notice = require("../models/Notice");
const Event = require("../models/Event");
const VisitorLog = require("../models/VisitorLog");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const Semester = require("../models/Semester");
const Schedule = require("../models/Schedule");
const Class = require("../models/Class");

// Helper to get formatted date YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================

exports.getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDateString();
    
    // Total Counts
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Teacher.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalCourses = await Course.countDocuments();

    // Attendance Counts (using today or fallback to latest date in DB if today has no attendance logs)
    let presentToday = await Attendance.countDocuments({ date: today, status: { $in: ["Present", "Late"] } });
    let absentToday = await Attendance.countDocuments({ date: today, status: "Absent" });
    
    if (presentToday === 0 && absentToday === 0) {
      // Fallback to latest seeded date "2026-07-22"
      presentToday = await Attendance.countDocuments({ date: "2026-07-22", status: { $in: ["Present", "Late"] } });
      absentToday = await Attendance.countDocuments({ date: "2026-07-22", status: "Absent" });
    }

    // Visitors counts
    const visitorsToday = await VisitorLog.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const activeNotices = await Notice.countDocuments();
    const pendingLeaves = await LeaveRequest.countDocuments({ status: "Pending" });
    const securityAlerts = await VisitorLog.countDocuments({ "emergencyAlert.isEmergency": true });

    // Chart 1: Attendance Trend (Last 7 active days)
    const attendanceGroup = await Attendance.aggregate([
      { $group: { _id: "$date", present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);
    
    const attendanceTrend = attendanceGroup.map(g => ({
      date: g._id,
      percentage: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0
    })).reverse();

    // Chart 2: Department-wise student distribution
    const deptDistribution = await Student.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    const deptWiseStudents = deptDistribution.map(d => ({
      name: d._id || "Unassigned",
      students: d.count
    }));

    // Chart 3: Faculty workload (Classes per faculty)
    const facultyWorkloadData = await Class.aggregate([
      { $group: { _id: "$faculty", classesCount: { $sum: 1 } } }
    ]);
    await Teacher.populate(facultyWorkloadData, { path: "_id", select: "name" });
    const facultyWorkload = facultyWorkloadData.map(f => ({
      name: f._id ? f._id.name : "Unknown",
      classes: f.classesCount
    }));

    // Recent activities (combined timeline)
    const recentNotices = await Notice.find().sort({ createdAt: -1 }).limit(3);
    const recentVisitors = await VisitorLog.find().sort({ createdAt: -1 }).limit(3);
    const recentLeaves = await LeaveRequest.find().sort({ createdAt: -1 }).limit(3);

    const timeline = [];
    recentNotices.forEach(n => {
      timeline.push({ id: n._id, type: "notice", title: `Notice: ${n.title}`, time: n.createdAt });
    });
    recentVisitors.forEach(v => {
      timeline.push({ id: v._id, type: "visitor", title: `Visitor Entry: ${v.name}`, time: v.createdAt });
    });
    recentLeaves.forEach(l => {
      timeline.push({ id: l._id, type: "leave", title: `Leave Request: ${l.name}`, time: l.createdAt });
    });
    timeline.sort((a, b) => b.time - a.time);

    // Recent notifications
    const recentNotifications = await Notification.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalCourses,
        presentToday,
        absentToday,
        visitorsToday,
        activeNotices,
        pendingLeaves,
        securityAlerts
      },
      charts: {
        attendanceTrend,
        deptWiseStudents,
        facultyWorkload
      },
      timeline: timeline.slice(0, 5),
      recentNotifications
    });
  } catch (error) {
    console.error("Dashboard Stats error:", error);
    res.status(500).json({ message: "Server error retrieving dashboard statistics" });
  }
};

// ==========================================
// 2. USER MANAGEMENT (CRUD)
// ==========================================

// --- STUDENTS ---
exports.getStudents = async (req, res) => {
  try {
    const { search, department, semester, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { usn: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { mail: { $regex: search, $options: "i" } }
      ];
    }

    const count = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate("user", "role createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ students, totalPages: Math.ceil(count / limit), currentPage: Number(page), totalCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, usn, id, age, phone, year, semester, department, dob, blood } = req.body;
    
    // Check user uniqueness
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
    });
    const savedUser = await newUser.save();

    const newStudent = new Student({
      user: savedUser._id,
      name,
      id: id || usn,
      usn: usn.toUpperCase(),
      mail: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "+1 (555) 012-3456",
      age: Number(age) || 20,
      year: year || "3rd Year",
      semester: semester || "6th Sem",
      department: department || "Computer Science Department",
      dob: dob ? new Date(dob) : new Date("2005-08-15"),
      blood: blood || "O+",
    });

    await newStudent.save();
    res.status(201).json({ message: "Student account created successfully", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // Update Core user if name or mail changes
    const user = await User.findById(student.user);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email.toLowerCase();
      await user.save();
    }

    Object.assign(student, updates);
    if (updates.email) student.mail = updates.email.toLowerCase();
    await student.save();

    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FACULTY ---
exports.getFaculty = async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { mail: { $regex: search, $options: "i" } }
      ];
    }

    const count = await Teacher.countDocuments(query);
    const faculty = await Teacher.find(query)
      .populate("user", "role createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ faculty, totalPages: Math.ceil(count / limit), currentPage: Number(page), totalCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { name, email, password, id, age, phone, department, salary, dob } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "faculty",
    });
    const savedUser = await newUser.save();

    const newFaculty = new Teacher({
      user: savedUser._id,
      name,
      id: id || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      mail: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "+1 (555) 019-9999",
      age: Number(age) || 35,
      department: department || "Computer Science Department",
      salary: Number(salary) || 80000,
      dob: dob ? new Date(dob) : new Date("1985-01-01"),
    });

    await newFaculty.save();
    res.status(201).json({ message: "Faculty account created successfully", faculty: newFaculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const faculty = await Teacher.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

    const user = await User.findById(faculty.user);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email.toLowerCase();
      await user.save();
    }

    Object.assign(faculty, updates);
    if (updates.email) faculty.mail = updates.email.toLowerCase();
    await faculty.save();

    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await Teacher.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    await User.findByIdAndDelete(faculty.user);
    await Teacher.findByIdAndDelete(id);

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SECURITY STAFF ---
exports.getSecurity = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { mail: { $regex: search, $options: "i" } }
      ];
    }

    const securityStaff = await Security.find(query).populate("user", "role createdAt");
    res.json({ securityStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSecurity = async (req, res) => {
  try {
    const { name, email, password, id, phone, gateNumber, shift } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "security",
    });
    const savedUser = await newUser.save();

    const newSecurity = new Security({
      user: savedUser._id,
      name,
      id: id || `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
      mail: email.toLowerCase(),
      phone: phone || "+1 (555) 016-8888",
      gateNumber: gateNumber || "Gate 1",
      shift: shift || "Day",
    });

    await newSecurity.save();
    res.status(201).json({ message: "Security staff created successfully", security: newSecurity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const security = await Security.findById(id);
    if (!security) return res.status(404).json({ message: "Security staff not found" });

    const user = await User.findById(security.user);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email.toLowerCase();
      await user.save();
    }

    Object.assign(security, updates);
    if (updates.email) security.mail = updates.email.toLowerCase();
    await security.save();

    res.json({ message: "Security staff updated successfully", security });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    const security = await Security.findById(id);
    if (!security) return res.status(404).json({ message: "Security staff not found" });

    await User.findByIdAndDelete(security.user);
    await Security.findByIdAndDelete(id);

    res.json({ message: "Security staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMINS ---
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate("user", "role createdAt");
    res.json({ admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, id, phone, department } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });
    const savedUser = await newUser.save();

    const newAdmin = new Admin({
      user: savedUser._id,
      name,
      id: id || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      mail: email.toLowerCase(),
      phone: phone || "+1 (555) 011-1111",
      department: department || "Administration",
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin account created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const user = await User.findById(admin.user);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email.toLowerCase();
      await user.save();
    }

    Object.assign(admin, updates);
    if (updates.email) admin.mail = updates.email.toLowerCase();
    await admin.save();

    res.json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await User.findByIdAndDelete(admin.user);
    await Admin.findByIdAndDelete(id);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ message: "User ID and new password are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User account not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. ACADEMICS CONFIGURATION
// ==========================================

// Departments CRUD
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    const newDept = new Department({ name, code });
    await newDept.save();
    res.status(201).json({ message: "Department created successfully", department: newDept });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);
    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Courses CRUD
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { code, name, department, credits, branches, semesters } = req.body;
    const newCourse = new Course({ code, name, department, credits, branches, semesters });
    await newCourse.save();
    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subjects CRUD
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { code, name, credits, department } = req.body;
    const newSubject = new Subject({ code, name, credits, department });
    await newSubject.save();
    res.status(201).json({ message: "Subject created successfully", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.findByIdAndDelete(id);
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Semesters CRUD
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json({ semesters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSemester = async (req, res) => {
  try {
    const { name } = req.body;
    const newSem = new Semester({ name });
    await newSem.save();
    res.status(201).json({ message: "Semester added successfully", semester: newSem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    await Semester.findByIdAndDelete(id);
    res.json({ message: "Semester deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Timetable (Classes) CRUD
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("faculty", "name");
    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { subjectCode, subjectName, faculty, department, semester, schedule, room, studentsCount } = req.body;
    const newClass = new Class({ subjectCode, subjectName, faculty, department, semester, schedule, room, studentsCount });
    await newClass.save();
    res.status(201).json({ message: "Timetable class created successfully", class: newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await Class.findByIdAndDelete(id);
    res.json({ message: "Timetable class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. ATTENDANCE & LEAVES
// ==========================================

exports.getAttendanceReport = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("student", "name usn department semester");
    
    // Group attendance by student to find defaulters
    const studentStats = {};
    attendance.forEach(record => {
      if (!record.student) return;
      const key = record.student._id.toString();
      if (!studentStats[key]) {
        studentStats[key] = {
          name: record.student.name,
          usn: record.student.usn,
          department: record.student.department,
          semester: record.student.semester,
          held: 0,
          attended: 0
        };
      }
      studentStats[key].held += 1;
      if (["Present", "Late"].includes(record.status)) {
        studentStats[key].attended += 1;
      }
    });

    const studentList = Object.values(studentStats).map(s => ({
      ...s,
      percentage: s.held > 0 ? Math.round((s.attended / s.held) * 100) : 100
    }));

    const defaulters = studentList.filter(s => s.percentage < 75);

    res.json({ attendanceLogs: attendance.slice(-100), studentList, defaulters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave requests
exports.getLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const request = await LeaveRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Leave request not found" });

    request.status = status;
    request.comments = comments || "";
    await request.save();

    res.json({ message: `Leave request ${status.toLowerCase()} successfully`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 5. NOTICE BOARD & EVENTS
// ==========================================

// Notices CRUD
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ notices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const { title, category, content, date, author, faculty, important, department, semester } = req.body;
    
    // Fallback faculty ID from existing teacher if not specified
    let targetFaculty = faculty;
    if (!targetFaculty) {
      const firstFac = await Teacher.findOne();
      targetFaculty = firstFac ? firstFac._id : null;
    }

    const newNotice = new Notice({
      title,
      category: category || "academic",
      content,
      date: date || getTodayDateString(),
      author: author || "Administrator",
      faculty: targetFaculty,
      important: important || false,
      department: department || "All",
      semester: semester || "All",
    });

    await newNotice.save();

    // Trigger Real-time socket message
    const io = req.app.get("io");
    if (io) {
      io.emit("notice_posted", newNotice);
    }

    res.status(201).json({ message: "Notice posted successfully", notice: newNotice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await Notice.findByIdAndDelete(id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Events CRUD
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, type, date, time, location, capacity } = req.body;
    const newEvent = new Event({ title, description, type, date, time, location, capacity });
    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 6. SECURITY MONITORING
// ==========================================

exports.getSecurityMonitoringLogs = async (req, res) => {
  try {
    const logs = await VisitorLog.find().sort({ createdAt: -1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVisitorLog = async (req, res) => {
  try {
    const { name, purpose, vehicleNo, studentGatePass, emergencyAlert, lostFound, incidentReport } = req.body;
    const newLog = new VisitorLog({ name, purpose, vehicleNo, studentGatePass, emergencyAlert, lostFound, incidentReport });
    await newLog.save();

    // Trigger alert if emergency
    if (emergencyAlert && emergencyAlert.isEmergency) {
      const io = req.app.get("io");
      if (io) {
        io.emit("emergency_alert", { message: `ALERT: Emergency reported at gate: ${emergencyAlert.description}`, details: newLog });
      }
    }

    res.status(201).json({ message: "Security log record added", log: newLog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkoutVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await VisitorLog.findById(id);
    if (!log) return res.status(404).json({ message: "Visitor log not found" });

    log.exitTime = new Date();
    log.status = "Cleared";
    await log.save();

    res.json({ message: "Visitor marked as checked out", log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 7. STUDY MATERIALS & ASSIGNMENTS (ADMIN SIDE)
// ==========================================

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { title, description, subjectCode, subjectName, department, semester, fileUrl, fileName } = req.body;
    const newMaterial = new Material({
      title,
      description,
      subjectCode,
      subjectName,
      department,
      semester,
      fileUrl: fileUrl || "#",
      fileName: fileName || "LectureNote.pdf",
      uploadedBy: "Admin Portal",
    });
    await newMaterial.save();
    res.status(201).json({ message: "Study material added successfully", material: newMaterial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await Material.findByIdAndDelete(id);
    res.json({ message: "Study material deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, subjectCode, subjectName, department, semester, dueDate, totalMarks, fileUrl } = req.body;
    const newAssignment = new Assignment({
      title,
      description,
      subjectCode,
      subjectName,
      department,
      semester,
      dueDate,
      totalMarks: Number(totalMarks) || 100,
      fileUrl: fileUrl || "",
    });
    await newAssignment.save();
    res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    res.json({ message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 8. NOTIFICATIONS CENTER
// ==========================================

exports.sendNotification = async (req, res) => {
  try {
    const { title, message, targetRole, targetDept, targetSemester } = req.body;

    const newNotification = new Notification({
      title,
      message,
      targetRole: targetRole || "all",
      targetDept: targetDept || "All",
      targetSemester: targetSemester || "All",
      sentBy: "System Administration",
    });

    await newNotification.save();

    // Socket.io dispatch
    const io = req.app.get("io");
    if (io) {
      io.emit("system_announcement", newNotification);
    }

    res.status(201).json({ message: "Notification broadcasted successfully", notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 9. REPORTS GENERATOR (MOCK LOGS)
// ==========================================

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { title, type, format } = req.body;
    
    // Create a mock record log for download
    const newReport = new Report({
      title,
      type,
      format,
      generatedBy: "System Admin",
      downloadUrl: `/api/admin/reports/download-mock?format=${format}&type=${type}`,
    });

    await newReport.save();
    res.status(201).json({ message: "Report generated successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 10. SYSTEM SETTINGS
// ==========================================

let systemConfig = {
  collegeName: "UniTech Institute of Technology",
  academicYear: "2026-2027",
  semesterDates: {
    start: "2026-08-01",
    end: "2026-12-15"
  },
  theme: "light",
  backupStatus: "Last backup conducted on 2026-07-26"
};

exports.getSystemSettings = async (req, res) => {
  try {
    res.json(systemConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    systemConfig = { ...systemConfig, ...updates };
    res.json({ message: "Settings updated successfully", settings: systemConfig });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
