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
    // 1. Seed Admin User & Profile
    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new User({
      name: "UniTech Administrator",
      username: "admin@unitech",
      password: adminHashedPassword,
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
    console.log("Admin account seeded successfully: admin@unitech / admin123");

    // 3. Seed Departments
    const depts = [
      { name: "Computer Science Department", code: "CS" },
      { name: "Information Science Department", code: "IS" },
      { name: "Electronics & Communication Department", code: "EC" },
      { name: "Mechanical Engineering Department", code: "ME" },
      { name: "Civil Engineering Department", code: "CV" }
    ];
    for (const d of depts) {
      await new Department(d).save();
    }
    console.log("Departments seeded successfully.");

    // 4. Seed Semesters
    const sems = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];
    for (const s of sems) {
      await new Semester({ name: s }).save();
    }
    console.log("Semesters seeded successfully.");

    console.log("Database cleared and initial base configurations seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
