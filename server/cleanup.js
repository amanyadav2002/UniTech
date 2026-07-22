require("dotenv").config();
const mongoose = require("mongoose");

const Attendance = require("./models/Attendance");
const Grade = require("./models/Grade");
const Notice = require("./models/Notice");
const Task = require("./models/Task");
const AcademicResource = require("./models/AcademicResource");
const Schedule = require("./models/Schedule");

const cleanMockData = async () => {
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

    console.log("MongoDB Connected. Cleaning transactional mock data logs...");

    const attRes = await Attendance.deleteMany({});
    console.log(`Deleted ${attRes.deletedCount} attendance logs.`);

    const gradeRes = await Grade.deleteMany({});
    console.log(`Deleted ${gradeRes.deletedCount} grade records.`);

    const noticeRes = await Notice.deleteMany({});
    console.log(`Deleted ${noticeRes.deletedCount} notices.`);

    const taskRes = await Task.deleteMany({});
    console.log(`Deleted ${taskRes.deletedCount} tasks.`);

    const resourceRes = await AcademicResource.deleteMany({});
    console.log(`Deleted ${resourceRes.deletedCount} academic resources.`);

    const scheduleRes = await Schedule.deleteMany({});
    console.log(`Deleted ${scheduleRes.deletedCount} schedule timelines.`);

    console.log("\n🎉 Transactional mock data collections successfully cleaned to 0 documents!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
};

cleanMockData();
