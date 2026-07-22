require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Subject = require("./models/Subject");
const Department = require("./models/Department");
const Semester = require("./models/Semester");
const Class = require("./models/Class");
const Attendance = require("./models/Attendance");
const Grade = require("./models/Grade");
const Notice = require("./models/Notice");
const Task = require("./models/Task");
const Schedule = require("./models/Schedule");
const AcademicResource = require("./models/AcademicResource");

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is not defined");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, {
      dbName: "unitech",
    });
    console.log("MongoDB Connected. Clearing database collections...");

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Subject.deleteMany({});
    await Department.deleteMany({});
    await Semester.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Grade.deleteMany({});
    await Notice.deleteMany({});
    await Task.deleteMany({});
    await Schedule.deleteMany({});
    await AcademicResource.deleteMany({});

    console.log("Collections cleared. Seeding starting...");

    // 1. Seed Departments & Semesters
    const departments = [
      { name: "Computer Science Department", code: "CS" },
      { name: "Information Science Department", code: "IS" },
      { name: "Electronics Department", code: "EC" },
      { name: "Electrical Department", code: "EE" },
    ];
    await Department.insertMany(departments);

    const semesters = [
      { name: "1st Sem" },
      { name: "2nd Sem" },
      { name: "3rd Sem" },
      { name: "4th Sem" },
      { name: "5th Sem" },
      { name: "6th Sem" },
      { name: "7th Sem" },
      { name: "8th Sem" },
    ];
    await Semester.insertMany(semesters);

    // 2. Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 3. Seed Faculty / Teacher User
    const facultyUser = new User({
      name: "Dr. Robert Vance",
      email: "vance@unitech.edu",
      password: hashedPassword,
      role: "faculty",
    });
    const savedFacultyUser = await facultyUser.save();

    const facultyProfile = new Teacher({
      user: savedFacultyUser._id,
      name: "Dr. Robert Vance",
      id: "T101",
      age: 45,
      phone: "+1 (555) 019-8234",
      mail: "vance@unitech.edu",
      department: "Computer Science Department",
      salary: 95000,
      dob: new Date("1981-05-12"),
    });
    const savedFacultyProfile = await facultyProfile.save();

    // 4. Seed Subjects
    const subjectsList = [
      { code: "CS-301", name: "Computer Networks", credits: 4, department: "Computer Science Department" },
      { code: "CS-302", name: "Operating Systems", credits: 4, department: "Computer Science Department" },
      { code: "CS-303", name: "Database Management Systems", credits: 4, department: "Computer Science Department" },
      { code: "MA-202", name: "Linear Algebra", credits: 3, department: "Computer Science Department" },
      { code: "HU-201", name: "Professional Ethics", credits: 2, department: "Computer Science Department" },
    ];
    const savedSubjects = await Subject.insertMany(subjectsList);

    // 5. Seed Classes Assigned to Faculty
    const classesList = [
      {
        subjectCode: "CS-301",
        subjectName: "Computer Networks",
        faculty: savedFacultyProfile._id,
        department: "Computer Science Department",
        semester: "6th Sem",
        schedule: "Mon, Wed 09:00 AM",
        room: "Room 402, Block C",
        studentsCount: 8,
      },
      {
        subjectCode: "CS-302",
        subjectName: "Operating Systems",
        faculty: savedFacultyProfile._id,
        department: "Computer Science Department",
        semester: "6th Sem",
        schedule: "Tue, Thu 11:00 AM",
        room: "Room 405, Block C",
        studentsCount: 8,
      },
      {
        subjectCode: "CS-303",
        subjectName: "Database Management Systems",
        faculty: savedFacultyProfile._id,
        department: "Computer Science Department",
        semester: "6th Sem",
        schedule: "Mon, Wed 02:00 PM",
        room: "Room 301, Block B",
        studentsCount: 8,
      },
    ];
    await Class.insertMany(classesList);

    // 6. Seed Student Users (the roster of 8 students)
    const studentRoster = [
      { name: "Aman Yadav", usn: "1RV21CS001", email: "aman@unitech.edu" },
      { name: "John Doe", usn: "1RV21CS002", email: "john@unitech.edu" },
      { name: "Jane Smith", usn: "1RV21CS003", email: "jane@unitech.edu" },
      { name: "Bob Johnson", usn: "1RV21CS004", email: "bob@unitech.edu" },
      { name: "Alice Brown", usn: "1RV21CS005", email: "alice@unitech.edu" },
      { name: "Charlie Wilson", usn: "1RV21CS006", email: "charlie@unitech.edu" },
      { name: "David Miller", usn: "1RV21CS007", email: "david@unitech.edu" },
      { name: "Eva Green", usn: "1RV21CS008", email: "eva@unitech.edu" },
    ];

    const studentProfiles = [];
    for (let i = 0; i < studentRoster.length; i++) {
      const roster = studentRoster[i];
      const sUser = new User({
        name: roster.name,
        email: roster.email,
        password: hashedPassword,
        role: "student",
      });
      const savedSUser = await sUser.save();

      const sProfile = new Student({
        user: savedSUser._id,
        name: roster.name,
        id: roster.usn,
        age: 21,
        usn: roster.usn,
        mail: roster.email,
        phone: `+1 (555) 014-990${i + 1}`,
        year: "3rd Year",
        semester: "6th Sem",
        dob: new Date("2005-08-15"),
        blood: "O+",
        cgpa: 3.82,
        totalEarnedCredits: 74,
        gpaHistory: [
          { semester: "1st Sem", gpa: 3.75, earnedCredits: 18, remarks: "Excellent" },
          { semester: "2nd Sem", gpa: 3.80, earnedCredits: 18, remarks: "Excellent" },
          { semester: "3rd Sem", gpa: 3.70, earnedCredits: 19, remarks: "Good effort" },
          { semester: "4th Sem", gpa: 3.91, earnedCredits: 19, remarks: "Outstanding" },
          { semester: "5th Sem", gpa: 3.85, earnedCredits: 18, remarks: "Very Good" },
        ],
      });
      const savedSProfile = await sProfile.save();
      studentProfiles.push(savedSProfile);
    }

    // 7. Seed Tasks for Aman Yadav (studentProfiles[0])
    const defaultTasks = [
      { title: "Submit Physics Lab Report", completed: false, priority: "Medium", dueDate: "2026-07-25", createdBy: studentProfiles[0].user },
      { title: "Register for semester electives", completed: true, priority: "High", dueDate: "2026-07-22", createdBy: studentProfiles[0].user },
      { title: "Return 'Operating Systems' book to library", completed: false, priority: "Low", dueDate: "2026-07-28", createdBy: studentProfiles[0].user },
    ];
    await Task.insertMany(defaultTasks);

    // Seed Tasks for Faculty Member
    const facultyTasks = [
      { title: "Grade Computer Networks mid-term assignments", completed: false, priority: "High", dueDate: "2026-07-24", createdBy: savedFacultyUser._id },
      { title: "Upload Unit 3 lecture slides for OS", completed: false, priority: "Medium", dueDate: "2026-07-26", createdBy: savedFacultyUser._id },
      { title: "Prepare final exam paper template", completed: true, priority: "High", dueDate: "2026-07-20", createdBy: savedFacultyUser._id },
    ];
    await Task.insertMany(facultyTasks);

    // 8. Seed Schedule (Timetable)
    const mondayClasses = [
      { time: "09:00 AM - 10:30 AM", code: "CS-301", name: "Computer Networks", room: "Room 402, Block C", active: false, completed: true },
      { time: "11:00 AM - 12:30 PM", code: "CS-302", name: "Operating Systems", room: "Room 405, Block C", active: true, completed: false },
      { time: "02:00 PM - 03:30 PM", code: "MA-202", name: "Linear Algebra", room: "Room 201, Block A", active: false, completed: false },
    ];

    for (const cls of mondayClasses) {
      // Seed for student (Aman Yadav)
      await new Schedule({
        userRole: "student",
        userId: studentProfiles[0].user,
        day: "Monday",
        time: cls.time,
        code: cls.code,
        name: cls.name,
        room: cls.room,
        active: cls.active,
        completed: cls.completed,
      }).save();
    }

    // Seed for Faculty (Dr. Robert Vance)
    const facultyMondayClasses = [
      { time: "09:00 AM - 10:30 AM", code: "CS-301", name: "Computer Networks", room: "Room 402, Block C" },
      { time: "02:00 PM - 03:30 PM", code: "CS-303", name: "Database Management Systems", room: "Room 301, Block B" },
    ];

    for (const cls of facultyMondayClasses) {
      await new Schedule({
        userRole: "faculty",
        userId: savedFacultyUser._id,
        day: "Monday",
        time: cls.time,
        code: cls.code,
        name: cls.name,
        room: cls.room,
        active: false,
        completed: false,
      }).save();
    }

    const resourcesList = [
      { type: "note", title: "Unit 1: Introduction to Computer Networks", description: "Introduction to layered network architectures, OSI model, TCP/IP protocol suite. Fundamental concepts of packet switching, circuit switching.", subject: "CS-301", subjectName: "Computer Networks", department: "Computer Science Department", semester: "6th Sem", uploadedBy: "Dr. Robert Vance", faculty: savedFacultyProfile._id, uploadedDate: "2026-07-10", fileUrl: "#", downloadUrl: "#" },
      { type: "note", title: "TCP/IP Protocol Suite & Wireshark Lab Guide", description: "Comprehensive lab manual for packet sniffing using Wireshark. Detailed analysis of TCP 3-way handshake.", subject: "CS-301", subjectName: "Computer Networks", department: "Computer Science Department", semester: "6th Sem", uploadedBy: "Dr. Robert Vance", faculty: savedFacultyProfile._id, uploadedDate: "2026-07-12", fileUrl: "#", downloadUrl: "#" },
      { type: "note", title: "Process Synchronization & Semaphores Lecture Slides", description: "Detailed slides explaining the critical section problem, mutual exclusion, semaphores, and mutexes.", subject: "CS-302", subjectName: "Operating Systems", department: "Computer Science Department", semester: "6th Sem", uploadedBy: "Dr. Robert Vance", faculty: savedFacultyProfile._id, uploadedDate: "2026-07-14", fileUrl: "#", downloadUrl: "#" },
      { type: "assignment", title: "Assignment 1: Socket Programming in Python (TCP/UDP)", description: "Implement a multi-threaded TCP chat server and client in Python. Also write a UDP client-server pair simulating a file transfer protocol.", subject: "CS-301", subjectName: "Computer Networks", department: "Computer Science Department", semester: "6th Sem", uploadedBy: "Dr. Robert Vance", faculty: savedFacultyProfile._id, uploadedDate: "2026-07-15", fileUrl: "#", downloadUrl: "#", dueDate: "2026-07-25" },
      { type: "assignment", title: "Lab Exercise 2: Implementing Producer-Consumer using Mutex", description: "Write a C program that simulates the Producer-Consumer problem using POSIX threads.", subject: "CS-302", subjectName: "Operating Systems", department: "Computer Science Department", semester: "6th Sem", uploadedBy: "Dr. Robert Vance", faculty: savedFacultyProfile._id, uploadedDate: "2026-07-16", fileUrl: "#", downloadUrl: "#", dueDate: "2026-07-28" },
    ];
    await AcademicResource.insertMany(resourcesList);

    // 10. Seed Attendance Logs
    // Subjects: CS-301, CS-302, CS-303, MA-202, HU-201
    // Seed attendance logs for student Aman Yadav to reflect overall/subject wise
    // CS-301: 35 held, 32 attended (3 Absent)
    // CS-302: 36 held, 29 attended (7 Absent)
    // CS-303: 34 held, 34 attended (0 Absent)
    // MA-202: 28 held, 21 attended (7 Absent)
    // HU-201: 17 held, 11 attended (6 Absent)

    console.log("Seeding attendance records for Aman Yadav...");
    const attendanceSeeds = [];
    const subjectsData = [
      { code: "CS-301", name: "Computer Networks", held: 35, attended: 32 },
      { code: "CS-302", name: "Operating Systems", held: 36, attended: 29 },
      { code: "CS-303", name: "Database Management Systems", held: 34, attended: 34 },
      { code: "MA-202", name: "Linear Algebra", held: 28, attended: 21 },
      { code: "HU-201", name: "Professional Ethics", held: 17, attended: 11 },
    ];

    for (const sub of subjectsData) {
      let attendedCount = 0;
      for (let day = 1; day <= sub.held; day++) {
        const isPresent = attendedCount < sub.attended;
        if (isPresent) attendedCount++;
        
        attendanceSeeds.push({
          student: studentProfiles[0]._id,
          subjectCode: sub.code,
          subjectName: sub.name,
          faculty: savedFacultyProfile._id,
          date: `2026-06-${day.toString().padStart(2, "0")}`,
          status: isPresent ? (day % 15 === 0 ? "Late" : "Present") : "Absent",
        });
      }
    }
    
    // Also seed simple attendance for other students so there is baseline attendance data
    for (let sIdx = 1; sIdx < studentProfiles.length; sIdx++) {
      attendanceSeeds.push({
        student: studentProfiles[sIdx]._id,
        subjectCode: "CS-301",
        subjectName: "Computer Networks",
        faculty: savedFacultyProfile._id,
        date: "2026-07-22",
        status: sIdx % 4 === 0 ? "Absent" : "Present",
      });
    }

    await Attendance.insertMany(attendanceSeeds);

    // 11. Seed Grades for student Aman Yadav
    const gradesList = [
      {
        student: studentProfiles[0]._id,
        subjectCode: "CS-301",
        subjectName: "Computer Networks",
        faculty: savedFacultyProfile._id,
        internal: 45,
        assignment: 9,
        lab: 18,
        final: 88,
        total: 160,
        grade: "A+",
        remarks: "Excellent work in sockets project",
        semester: "6th Sem",
        department: "Computer Science Department",
      },
      {
        student: studentProfiles[0]._id,
        subjectCode: "CS-302",
        subjectName: "Operating Systems",
        faculty: savedFacultyProfile._id,
        internal: 38,
        assignment: 8,
        lab: 17,
        final: 76,
        total: 139,
        grade: "A",
        remarks: "Good thread sync implementation",
        semester: "6th Sem",
        department: "Computer Science Department",
      },
      {
        student: studentProfiles[0]._id,
        subjectCode: "CS-303",
        subjectName: "Database Management Systems",
        faculty: savedFacultyProfile._id,
        internal: 48,
        assignment: 10,
        lab: 20,
        final: 94,
        total: 172,
        grade: "O",
        remarks: "Flawless schema normalization design",
        semester: "6th Sem",
        department: "Computer Science Department",
      },
    ];
    await Grade.insertMany(gradesList);

    // 12. Seed Notices
    const noticesListSeeds = [
      {
        title: "Mid-Term Examination Timetable Released",
        category: "exams",
        content: "The mid-term examinations for the 6th semester are scheduled to start from August 3rd, 2026. The detailed subject-wise timetable is uploaded on the official university examination branch website. Students must fetch their hall tickets before July 30th.",
        date: "2026-07-14",
        author: "Dr. Robert Vance",
        faculty: savedFacultyProfile._id,
        important: true,
        department: "Computer Science Department",
        semester: "6th Sem",
      },
      {
        title: "Annual Hackfest Registration Deadline Extended",
        category: "events",
        content: "Excellent news for innovators! Registration for the UniTech Annual Hackfest has been extended until July 22nd. Assemble teams of 2 to 4 members. Prizes worth $10,000 up for grabs. Mentorship from global tech industry leaders will be provided.",
        date: "2026-07-12",
        author: "Dr. Robert Vance",
        faculty: savedFacultyProfile._id,
        important: false,
        department: "Computer Science Department",
        semester: "All",
      },
      {
        title: "Vite Project Submission & Oral Evaluation Guidelines",
        category: "academic",
        content: "All students must submit their complete codebase links by July 25th. Oral evaluations will be conducted in Lab Block C during regular teaching hours.",
        date: "2026-07-15",
        author: "Dr. Robert Vance",
        faculty: savedFacultyProfile._id,
        important: true,
        department: "Computer Science Department",
        semester: "6th Sem",
      },
    ];
    await Notice.insertMany(noticesListSeeds);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
