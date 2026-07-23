require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*", // Adjust in production to specific frontend domains if necessary
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log("Client connected to socket:", socket.id);

  socket.on("join", (data) => {
    if (data && data.userId) {
      if (data.role === "student") {
        socket.join(`student:${data.userId}`);
        console.log(`Socket ${socket.id} joined student room: student:${data.userId}`);
      } else if (data.role === "faculty") {
        socket.join("role:faculty");
        console.log(`Socket ${socket.id} joined faculty room: role:faculty`);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from socket:", socket.id);
  });
});

// Share io instance with routes/controllers
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running smoothly" });
});

// Start Server and Connect DB
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start listening on server instead of app
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  }
};

startServer();
