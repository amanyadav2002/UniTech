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
const Admin = require("./models/Admin");
const Security = require("./models/Security");
const Course = require("./models/Course");
const LeaveRequest = require("./models/LeaveRequest");
const Event = require("./models/Event");
const VisitorLog = require("./models/VisitorLog");
const Notification = require("./models/Notification");
const Report = require("./models/Report");

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
    console.log("MongoDB Connected. Clearing all database collections...");

    // Clear all existing data
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
    await Admin.deleteMany({});
    await Security.deleteMany({});
    await Course.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Event.deleteMany({});
    await VisitorLog.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log("Collections cleared successfully.");
    console.log("Seeding default login credentials...");

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 1. Seed Admin User & Profile
    const adminUser = new User({
      name: "UniTech Administrator",
      email: "admin@unitech.edu",
      password: hashedPassword,
      role: "admin",
    });
    const savedAdminUser = await adminUser.save();
    
    const adminProfile = new Admin({
      user: savedAdminUser._id,
      name: "UniTech Administrator",
      id: "ADM001",
      phone: "+1 (555) 011-2222",
      mail: "admin@unitech.edu",
      department: "Administration",
    });
    await adminProfile.save();
    console.log("Admin account seeded successfully: admin@unitech.edu / password123");

    // 2. Seed Security User & Profile
    const securityUser = new User({
      name: "Chief Officer Marcus",
      email: "security@unitech.edu",
      password: hashedPassword,
      role: "security",
    });
    const savedSecurityUser = await securityUser.save();
    
    const securityProfile = new Security({
      user: savedSecurityUser._id,
      name: "Chief Officer Marcus",
      id: "SEC001",
      phone: "+1 (555) 019-7777",
      mail: "security@unitech.edu",
      gateNumber: "Gate 1",
      shift: "Day",
    });
    await securityProfile.save();
    console.log("Security account seeded successfully: security@unitech.edu / password123");

    console.log("Database cleared and initial credentials seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
