const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");
const Notice = require("../models/Notice");
const Schedule = require("../models/Schedule");
const Task = require("../models/Task");
const Subject = require("../models/Subject");
const AcademicResource = require("../models/AcademicResource");
const PersonalizedCourse = require("../models/PersonalizedCourse");

// Helper to get Teacher profile by user ID
const getTeacherProfileHelper = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId });
  if (!teacher) {
    throw new Error("Teacher profile not found");
  }
  return teacher;
};

// @desc    Get faculty profile
// @route   GET /api/faculty/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id }).populate("user", "-password");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update faculty profile details
// @route   PUT /api/faculty/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const { name, phone, age, department, salary } = req.body;

    if (name) {
      teacher.name = name;
      await User.findByIdAndUpdate(req.user.id, { name });
    }
    if (phone !== undefined) teacher.phone = phone;
    if (age !== undefined) teacher.age = Number(age);
    if (department !== undefined) teacher.department = department;
    if (salary !== undefined) teacher.salary = Number(salary);

    const updatedTeacher = await teacher.save();
    res.json({
      message: "Profile updated successfully",
      faculty: updatedTeacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get classes assigned to faculty
// @route   GET /api/faculty/classes
// @access  Private
exports.getClasses = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const classes = await Class.find({ faculty: teacher._id });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students roster and their marked attendance status for a class and date
// @route   GET /api/faculty/attendance
// @access  Private
exports.getAttendanceRoster = async (req, res) => {
  try {
    const { department, semester, subjectCode, date } = req.query;
    if (!department || !semester || !subjectCode || !date) {
      return res.status(400).json({ message: "Missing required query parameters: department, semester, subjectCode, date" });
    }

    // Find all students enrolled in this department & semester
    const students = await Student.find({ department, semester });

    // Find marked attendance for this date & subject
    const attendanceLogs = await Attendance.find({
      subjectCode,
      date,
    });

    // Map students list to include their attendance status
    const roster = students.map(student => {
      const log = attendanceLogs.find(l => l.student.toString() === student._id.toString());
      return {
        id: student.usn, // Keep usn as id for UI compatibility
        dbId: student._id,
        name: student.name,
        present: log ? (log.status === "Present" || log.status === "Late") : true, // default to true
        status: log ? log.status : "Present",
      };
    });

    res.json(roster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit or update student attendance for a class
// @route   POST /api/faculty/attendance
// @access  Private
exports.submitAttendance = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const { subjectCode, subjectName, date, records } = req.body;
    
    if (!subjectCode || !subjectName || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Missing required attendance submission fields" });
    }

    const savedLogs = [];
    for (const record of records) {
      const { studentUsn, present, status } = record;
      
      const student = await Student.findOne({ usn: studentUsn });
      if (!student) continue;

      // Map boolean present to status if status is not explicitly passed
      const finalStatus = status || (present ? "Present" : "Absent");

      // Upsert Attendance record
      const log = await Attendance.findOneAndUpdate(
        { student: student._id, subjectCode, date },
        {
          student: student._id,
          subjectCode,
          subjectName,
          faculty: teacher._id,
          date,
          status: finalStatus,
        },
        { upsert: true, new: true }
      );
      savedLogs.push(log);
    }

    res.json({ message: "Attendance submitted successfully", logsCount: savedLogs.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grades for a specific class/subject
// @route   GET /api/faculty/grades
// @access  Private
exports.getGrades = async (req, res) => {
  try {
    const { department, semester, subjectCode } = req.query;
    if (!department || !semester || !subjectCode) {
      return res.status(400).json({ message: "Missing query parameters: department, semester, subjectCode" });
    }

    const students = await Student.find({ department, semester });
    const grades = await Grade.find({ subjectCode });

    const rosterGrades = students.map(student => {
      const g = grades.find(item => item.student.toString() === student._id.toString());
      return {
        studentId: student.usn,
        studentDbId: student._id,
        studentName: student.name,
        internal: g ? g.internal : 0,
        assignment: g ? g.assignment : 0,
        lab: g ? g.lab : 0,
        final: g ? g.final : 0,
        total: g ? g.total : 0,
        grade: g ? g.grade : "F",
        remarks: g ? g.remarks : "",
        isGraded: !!g,
      };
    });

    res.json(rosterGrades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit or update student grade
// @route   POST /api/faculty/grades
// @access  Private
exports.submitGrade = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const { studentUsn, subjectCode, subjectName, internal, assignment, lab, final, remarks, semester, department } = req.body;

    if (!studentUsn || !subjectCode || !subjectName) {
      return res.status(400).json({ message: "Missing studentUsn, subjectCode or subjectName" });
    }

    const student = await Student.findOne({ usn: studentUsn });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const intVal = Number(internal || 0);
    const assignVal = Number(assignment || 0);
    const labVal = Number(lab || 0);
    const finalVal = Number(final || 0);
    const totalVal = intVal + assignVal + labVal + finalVal;

    // Calculate letter grade (Max total is 50 + 10 + 20 + 100 = 180)
    let gradeLetter = "F";
    const percent = (totalVal / 180) * 100;
    if (percent >= 90) gradeLetter = "O";
    else if (percent >= 80) gradeLetter = "A+";
    else if (percent >= 70) gradeLetter = "A";
    else if (percent >= 60) gradeLetter = "B+";
    else if (percent >= 50) gradeLetter = "B";
    else if (percent >= 40) gradeLetter = "C";

    const updatedGrade = await Grade.findOneAndUpdate(
      { student: student._id, subjectCode },
      {
        student: student._id,
        subjectCode,
        subjectName,
        faculty: teacher._id,
        internal: intVal,
        assignment: assignVal,
        lab: labVal,
        final: finalVal,
        total: totalVal,
        grade: gradeLetter,
        remarks: remarks || "",
        semester: semester || student.semester,
        department: department || student.department,
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Grade posted successfully", grade: updatedGrade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notices posted by faculty member
// @route   GET /api/faculty/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const notices = await Notice.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    
    // Map to fields expected by UI
    const mapped = notices.map(n => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      content: n.content,
      date: n.date,
      author: n.author,
      important: n.important,
      department: n.department,
      semester: n.semester,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a notice
// @route   POST /api/faculty/notices
// @access  Private
exports.createNotice = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const { title, category, content, important, department, semester } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ message: "Title, category, and content are required notice fields" });
    }

    const newNotice = new Notice({
      title,
      category,
      content,
      important: important || false,
      date: new Date().toISOString().split("T")[0],
      author: teacher.name,
      faculty: teacher._id,
      department: department || "All",
      semester: semester || "All",
    });

    await newNotice.save();
    
    // Return all notices by this faculty
    const list = await Notice.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    res.json(list.map(n => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      content: n.content,
      date: n.date,
      author: n.author,
      important: n.important,
      department: n.department,
      semester: n.semester,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a notice
// @route   PUT /api/faculty/notices/:id
// @access  Private
exports.updateNotice = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const notice = await Notice.findOne({ _id: req.params.id, faculty: teacher._id });
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const { title, category, content, important, department, semester } = req.body;
    if (title !== undefined) notice.title = title;
    if (category !== undefined) notice.category = category;
    if (content !== undefined) notice.content = content;
    if (important !== undefined) notice.important = important;
    if (department !== undefined) notice.department = department;
    if (semester !== undefined) notice.semester = semester;

    await notice.save();

    const list = await Notice.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    res.json(list.map(n => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      content: n.content,
      date: n.date,
      author: n.author,
      important: n.important,
      department: n.department,
      semester: n.semester,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/faculty/notices/:id
// @access  Private
exports.deleteNotice = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const result = await Notice.deleteOne({ _id: req.params.id, faculty: teacher._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const list = await Notice.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    res.json(list.map(n => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      content: n.content,
      date: n.date,
      author: n.author,
      important: n.important,
      department: n.department,
      semester: n.semester,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get faculty schedule
// @route   GET /api/faculty/schedule
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({ userId: req.user.id });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload resource
// @route   POST /api/faculty/resources
// @access  Private
exports.uploadResource = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const { title, description, subjectCode, subjectName, department, semester, fileUrl } = req.body;
    
    if (!title || !subjectCode || !subjectName) {
      return res.status(400).json({ message: "Title, Subject Code and Subject Name are required" });
    }

    const newResource = new AcademicResource({
      title,
      description: description || "",
      subject: subjectCode,
      subjectName,
      department: department || teacher.department,
      semester: semester || "6th Sem",
      uploadedBy: teacher.name,
      faculty: teacher._id,
      uploadedDate: new Date().toISOString().split("T")[0],
      fileUrl: fileUrl || "#",
      downloadUrl: fileUrl || "#",
    });

    await newResource.save();
    
    // Fetch all resources uploaded by this faculty
    const list = await AcademicResource.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get faculty uploaded resources
// @route   GET /api/faculty/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const list = await AcademicResource.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete faculty resource
// @route   DELETE /api/faculty/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const result = await AcademicResource.deleteOne({ _id: req.params.id, faculty: teacher._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    const list = await AcademicResource.find({ faculty: teacher._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all registered students
// @route   GET /api/faculty/students
// @access  Private
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user", "-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a personalized course for a student
// @route   POST /api/faculty/personalized-course
// @access  Private
exports.createPersonalizedCourse = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const { studentId, courseCode, courseName, description, credits } = req.body;

    if (!studentId || !courseCode || !courseName) {
      return res.status(400).json({ message: "Student ID, Course Code, and Course Name are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Check if duplicate personalized course code exists for this student
    const existing = await PersonalizedCourse.findOne({ student: studentId, courseCode });
    if (existing) {
      return res.status(400).json({ message: "This student is already registered for a personalized course with this course code." });
    }

    const newCourse = new PersonalizedCourse({
      student: studentId,
      faculty: teacher._id,
      courseCode,
      courseName,
      description: description || "",
      credits: credits ? Number(credits) : 4,
    });

    await newCourse.save();

    // Trigger real-time refresh in student portal
    const io = req.app.get("io");
    if (io) {
      io.to(`student:${student.user.toString()}`).emit("course_created", {
        courseCode,
        courseName,
        teacher: teacher.name,
      });
      console.log(`Socket emitted course_created to room student:${student.user.toString()}`);
    }

    res.json({ message: "Personalized course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark direct attendance for a student
// @route   POST /api/faculty/student-attendance
// @access  Private
exports.markStudentAttendance = async (req, res) => {
  try {
    const teacher = await getTeacherProfileHelper(req.user.id);
    const { studentId, subjectCode, subjectName, date, status } = req.body;

    if (!studentId || !subjectCode || !subjectName || !date || !status) {
      return res.status(400).json({ message: "Student ID, Subject Code, Subject Name, Date, and Status are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Upsert Attendance record
    const log = await Attendance.findOneAndUpdate(
      { student: studentId, subjectCode, date },
      {
        student: studentId,
        subjectCode,
        subjectName,
        faculty: teacher._id,
        date,
        status,
      },
      { upsert: true, new: true }
    );

    // Trigger real-time refresh in student portal
    const io = req.app.get("io");
    if (io) {
      io.to(`student:${student.user.toString()}`).emit("attendance_updated", {
        subjectCode,
        subjectName,
        date,
        status,
      });
      console.log(`Socket emitted attendance_updated to room student:${student.user.toString()}`);
    }

    res.json({ message: "Attendance marked successfully", log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
