import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Mail,
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Building2,
  FlaskConical,
  ClipboardCheck,
  CalendarDays,
  FileText,
  Laptop,
  Briefcase,
  ArrowRight,
  Search,
  Bell,
  Clock,
  Plus,
  Trash2,
  Edit,
  User,
  LogOut,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MapPin,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  CheckSquare,
  X,
  FileSpreadsheet,
  Layers,
  Activity,
  DollarSign
} from "lucide-react";

export default function Faculty({ onOpenAuth }) {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard active tab navigation
  const [activeTab, setActiveTab] = useState("overview");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [noticeSearch, setNoticeSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      const container = document.getElementById("search-container");
      if (container && !container.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  
  // --- Profile Editing State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile details into inputs when edit state changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      if (user.profile) {
        setEditPhone(user.profile.phone || "");
        setEditAge(user.profile.age || "");
        setEditDepartment(user.profile.department || "");
        setEditSalary(user.profile.salary || "");
      }
    }
  }, [user, isEditing]);

  // --- Dynamic Courses based on Faculty Department ---
  const getCoursesForDept = (dept) => {
    const d = dept ? dept.toLowerCase() : "";
    if (d.includes("computer") || d.includes("science")) {
      return [
        { code: "CS-301", name: "Computer Networks", credits: 4, schedule: "Mon, Wed 09:00 AM", room: "Room 402, Block C", studentsCount: 45 },
        { code: "CS-302", name: "Operating Systems", credits: 4, schedule: "Tue, Thu 11:00 AM", room: "Room 405, Block C", studentsCount: 42 },
        { code: "CS-303", name: "Database Management Systems", credits: 4, schedule: "Mon, Wed 02:00 PM", room: "Room 301, Block B", studentsCount: 48 },
      ];
    } else if (d.includes("information")) {
      return [
        { code: "IS-304", name: "Web Technologies", credits: 4, schedule: "Mon, Wed 10:30 AM", room: "Room 102, Block A", studentsCount: 38 },
        { code: "IS-305", name: "Cloud Computing", credits: 3, schedule: "Tue, Fri 09:00 AM", room: "Room 108, Block A", studentsCount: 35 },
      ];
    } else if (d.includes("electronics")) {
      return [
        { code: "EC-201", name: "Microcontrollers", credits: 4, schedule: "Mon, Thu 11:00 AM", room: "Room 205, Block B", studentsCount: 50 },
        { code: "EC-202", name: "Digital Signal Processing", credits: 4, schedule: "Tue, Fri 02:00 PM", room: "Room 206, Block B", studentsCount: 44 },
      ];
    } else if (d.includes("electrical")) {
      return [
        { code: "EE-301", name: "Control Systems", credits: 4, schedule: "Mon, Wed 09:00 AM", room: "Room 312, Block C", studentsCount: 30 },
        { code: "EE-302", name: "Power Electronics", credits: 4, schedule: "Thu, Fri 11:00 AM", room: "Room 314, Block C", studentsCount: 28 },
      ];
    } else if (d.includes("mechanical")) {
      return [
        { code: "ME-201", name: "Thermodynamics", credits: 4, schedule: "Tue, Thu 09:00 AM", room: "Room 105, Workshop Block", studentsCount: 52 },
        { code: "ME-202", name: "Fluid Mechanics", credits: 4, schedule: "Mon, Wed 11:00 AM", room: "Room 106, Workshop Block", studentsCount: 49 },
      ];
    } else if (d.includes("civil")) {
      return [
        { code: "CV-301", name: "Structural Analysis", credits: 4, schedule: "Mon, Wed 02:00 PM", room: "Room 204, Block D", studentsCount: 25 },
        { code: "CV-302", name: "Surveying", credits: 3, schedule: "Fri 09:00 AM", room: "Surveying Lab, Ground Floor", studentsCount: 27 },
      ];
    } else {
      // General default courses
      return [
        { code: "UN-101", name: "Introduction to Engineering", credits: 3, schedule: "Mon 09:00 AM", room: "Main Seminar Hall", studentsCount: 120 },
        { code: "UN-201", name: "Advanced Professional Skills", credits: 2, schedule: "Fri 03:00 PM", room: "Room 101, Block A", studentsCount: 60 },
      ];
    }
  };

  const facultyDept = user?.profile?.department || "Computer Science";
  const coursesList = getCoursesForDept(facultyDept);

  // --- Task Manager State (Persisted) ---
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (user?.id) {
      const savedTasks = localStorage.getItem(`unitech_faculty_tasks_${user.id}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        const defaultTasks = [
          { id: "1", text: "Grade Computer Networks mid-term assignments", completed: false },
          { id: "2", text: "Upload Unit 3 slides for Database Systems", completed: false },
          { id: "3", text: "Submit monthly research progress report", completed: true },
        ];
        setTasks(defaultTasks);
        localStorage.setItem(`unitech_faculty_tasks_${user.id}`, JSON.stringify(defaultTasks));
      }
    }
  }, [user]);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_tasks_${user.id}`, JSON.stringify(updatedTasks));
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const updated = [
      ...tasks,
      { id: Date.now().toString(), text: newTaskText.trim(), completed: false },
    ];
    saveTasks(updated);
    setNewTaskText("");
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  // --- Attendance Management State ---
  const [attendanceCourse, setAttendanceCourse] = useState(coursesList[0]?.code || "");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceSuccess, setAttendanceSuccess] = useState("");

  // Custom Attendance Date states initialized to today
  const attInitialDate = new Date();
  const initialAttDay = attInitialDate.getDate().toString();
  const initialAttMonth = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ][attInitialDate.getMonth()];
  const initialAttYear = attInitialDate.getFullYear().toString();

  const [attDay, setAttDay] = useState(initialAttDay);
  const [attMonth, setAttMonth] = useState(initialAttMonth);
  const [attYear, setAttYear] = useState(initialAttYear);
  const [isAttDayOpen, setIsAttDayOpen] = useState(false);
  const [isAttMonthOpen, setIsAttMonthOpen] = useState(false);
  const [isAttYearOpen, setIsAttYearOpen] = useState(false);

  const attYearsList = Array.from({ length: 10 }, (_, i) => (2026 + i).toString());

  // Synchronize attendance custom date values with attendanceDate
  useEffect(() => {
    if (attDay && attMonth && attYear) {
      const monthNum = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ].indexOf(attMonth) + 1;
      if (monthNum > 0) {
        const formattedMonth = monthNum.toString().padStart(2, "0");
        const formattedDay = attDay.padStart(2, "0");
        setAttendanceDate(`${attYear}-${formattedMonth}-${formattedDay}`);
      } else {
        setAttendanceDate("");
      }
    } else {
      setAttendanceDate("");
    }
  }, [attDay, attMonth, attYear]);

  // Attendance date validation helper
  const getAttMaxDays = (monthName, yearString) => {
    if (!monthName) return 31;
    const m = monthName.toLowerCase();
    if (["april", "june", "september", "november"].includes(m)) {
      return 30;
    }
    if (m === "february") {
      const yr = parseInt(yearString, 10);
      if (!isNaN(yr) && ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0)) {
        return 29;
      }
      return 28;
    }
    return 31;
  };

  const handleAttDayChange = (val) => {
    setIsAttDayOpen(true);
    if (val === "") {
      setAttDay("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    const dayNum = parseInt(val, 10);
    const maxDays = getAttMaxDays(attMonth, attYear);
    if (dayNum <= maxDays) {
      setAttDay(val);
    }
  };

  const handleAttMonthChange = (val) => {
    setIsAttMonthOpen(true);
    if (val === "") {
      setAttMonth("");
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) return;
    setAttMonth(val);
  };

  const handleAttYearChange = (val) => {
    setIsAttYearOpen(true);
    if (val === "") {
      setAttYear("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    if (val.length > 4) return;
    setAttYear(val);
  };

  const handleAttDayBlur = () => {
    setTimeout(() => {
      setIsAttDayOpen(false);
      if (attDay) {
        const dayNum = parseInt(attDay, 10);
        if (isNaN(dayNum) || dayNum < 1) {
          setAttDay("");
        } else {
          setAttDay(dayNum.toString());
        }
      }
    }, 200);
  };

  const handleAttMonthBlur = () => {
    setTimeout(() => {
      setIsAttMonthOpen(false);
      if (attMonth) {
        const monthsArr = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const matchedMonth = monthsArr.find(
          (m) => m.toLowerCase() === attMonth.toLowerCase()
        );
        if (matchedMonth) {
          setAttMonth(matchedMonth);
          const maxDays = getAttMaxDays(matchedMonth, attYear);
          if (attDay && parseInt(attDay, 10) > maxDays) {
            setAttDay(maxDays.toString());
          }
        } else {
          setAttMonth("");
        }
      }
    }, 200);
  };

  const handleAttYearBlur = () => {
    setTimeout(() => {
      setIsAttYearOpen(false);
      if (attYear) {
        const yrNum = parseInt(attYear, 10);
        if (isNaN(yrNum) || yrNum < 2026 || yrNum > 2035) {
          setAttYear("");
        } else {
          setAttYear(yrNum.toString());
          if (attMonth.toLowerCase() === "february") {
            const maxDays = getAttMaxDays("february", yrNum.toString());
            if (attDay && parseInt(attDay, 10) > maxDays) {
              setAttDay(maxDays.toString());
            }
          }
        }
      }
    }, 200);
  };
  
  // Set default attendance course when list loads
  useEffect(() => {
    if (coursesList.length > 0 && !attendanceCourse) {
      setAttendanceCourse(coursesList[0].code);
    }
  }, [coursesList, attendanceCourse]);

  const initialStudents = [
    { id: "1RV21CS001", name: "Aman Yadav", present: true },
    { id: "1RV21CS002", name: "John Doe", present: true },
    { id: "1RV21CS003", name: "Jane Smith", present: true },
    { id: "1RV21CS004", name: "Bob Johnson", present: false },
    { id: "1RV21CS005", name: "Alice Brown", present: true },
    { id: "1RV21CS006", name: "Charlie Wilson", present: true },
    { id: "1RV21CS007", name: "David Miller", present: true },
    { id: "1RV21CS008", name: "Eva Green", present: false },
  ];

  const [studentRoster, setStudentRoster] = useState(initialStudents);

  const handleToggleAttendance = (studentId) => {
    setStudentRoster(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, present: !student.present } : student
      )
    );
  };

  const handleMarkAll = (status) => {
    setStudentRoster(prev => prev.map(s => ({ ...s, present: status })));
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    const courseObj = coursesList.find(c => c.code === attendanceCourse);
    const presentCount = studentRoster.filter(s => s.present).length;
    
    setAttendanceSuccess(
      `Attendance for ${courseObj?.name || attendanceCourse} on ${attendanceDate} successfully submitted! (${presentCount}/${studentRoster.length} students present)`
    );
    
    setTimeout(() => {
      setAttendanceSuccess("");
    }, 4000);
  };

  // --- Notice Board State (Persisted) ---
  const [notices, setNotices] = useState([]);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState("academic");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState("");

  const defaultNotices = [
    {
      id: "1",
      title: "Vite Project Submission & Oral Evaluation Guidelines",
      category: "academic",
      content: "All students must submit their complete codebase links by July 25th. Oral evaluations will be conducted in Lab Block C during regular teaching hours.",
      date: "2026-07-15",
      author: "Dr. Robert Vance",
      important: true,
    },
    {
      id: "2",
      title: "Makeup Internals for Labs & Seminars",
      category: "exams",
      content: "Students who missed Internal IA-1 due to medical emergencies must submit written proof to their coordinators to attend the makeup tests on July 23rd.",
      date: "2026-07-12",
      author: "Prof. Alan Turing",
      important: false,
    },
  ];

  useEffect(() => {
    if (user?.id) {
      const savedNotices = localStorage.getItem(`unitech_faculty_notices_${user.id}`);
      if (savedNotices) {
        setNotices(JSON.parse(savedNotices));
      } else {
        setNotices(defaultNotices);
        localStorage.setItem(`unitech_faculty_notices_${user.id}`, JSON.stringify(defaultNotices));
      }
    }
  }, [user]);

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    const newNotice = {
      id: Date.now().toString(),
      title: newNoticeTitle.trim(),
      category: newNoticeCategory,
      content: newNoticeContent.trim(),
      date: new Date().toISOString().split("T")[0],
      author: user.name || "Faculty Member",
      important: newNoticeImportant,
    };

    const updated = [newNotice, ...notices];
    setNotices(updated);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_notices_${user.id}`, JSON.stringify(updated));
    }

    setNewNoticeTitle("");
    setNewNoticeContent("");
    setNewNoticeImportant(false);
    setNoticeSuccess("Campus notice announced successfully!");
    
    setTimeout(() => {
      setNoticeSuccess("");
    }, 3000);
  };

  const handleDeleteNotice = (noticeId) => {
    const updated = notices.filter(n => n.id !== noticeId);
    setNotices(updated);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_notices_${user.id}`, JSON.stringify(updated));
    }
  };

  // --- Classroom Digital Resources State (Persisted) ---
  const [resources, setResources] = useState([]);
  const [resTitle, setResTitle] = useState("");
  const [resCourse, setResCourse] = useState(coursesList[0]?.code || "");
  const [resLink, setResLink] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resSuccess, setResSuccess] = useState("");

  const defaultResources = [
    {
      id: "res_1",
      title: "Unit 1: Introduction & Layered Network Reference Models",
      courseCode: "CS-301",
      courseName: "Computer Networks",
      link: "https://unitech.edu/classroom/cs301-unit1",
      description: "Introductory lecture slides explaining OSI 7-layer structure, TCP/IP reference architectures, and client-server paradigm.",
      date: "2026-07-05",
    },
    {
      id: "res_2",
      title: "Wireshark Packet Sniffing & TCP Handshake Lab Manual",
      courseCode: "CS-301",
      courseName: "Computer Networks",
      link: "https://unitech.edu/classroom/cs301-lab1",
      description: "Guide to sniffing packets on local interface, filtering TCP headers, and studying sequence numbers & 3-way handshakes.",
      date: "2026-07-08",
    },
    {
      id: "res_3",
      title: "Process Synchronization & Mutex Slides (Unit 2)",
      courseCode: "CS-302",
      courseName: "Operating Systems",
      link: "https://unitech.edu/classroom/cs302-unit2",
      description: "Critical section definitions, hardware instructions for mutual exclusion, semaphores, and classic dining philosophers examples.",
      date: "2026-07-10",
    },
  ];

  useEffect(() => {
    if (coursesList.length > 0 && !resCourse) {
      setResCourse(coursesList[0].code);
    }
  }, [coursesList, resCourse]);

  useEffect(() => {
    if (user?.id) {
      const savedResources = localStorage.getItem(`unitech_faculty_resources_${user.id}`);
      if (savedResources) {
        setResources(JSON.parse(savedResources));
      } else {
        setResources(defaultResources);
        localStorage.setItem(`unitech_faculty_resources_${user.id}`, JSON.stringify(defaultResources));
      }
    }
  }, [user]);

  const handleUploadResource = (e) => {
    e.preventDefault();
    if (!resTitle.trim() || !resLink.trim()) return;

    const courseObj = coursesList.find(c => c.code === resCourse);
    const newResource = {
      id: Date.now().toString(),
      title: resTitle.trim(),
      courseCode: resCourse,
      courseName: courseObj?.name || resCourse,
      link: resLink.startsWith("http") ? resLink : `https://${resLink}`,
      description: resDesc.trim() || "No details provided.",
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newResource, ...resources];
    setResources(updated);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_resources_${user.id}`, JSON.stringify(updated));
    }

    setResTitle("");
    setResLink("");
    setResDesc("");
    setResSuccess("E-Learning study resource uploaded successfully!");
    
    setTimeout(() => {
      setResSuccess("");
    }, 3000);
  };

  const handleDeleteResource = (resId) => {
    const updated = resources.filter(r => r.id !== resId);
    setResources(updated);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_resources_${user.id}`, JSON.stringify(updated));
    }
  };

  // --- Assignments & Grading State (Persisted) ---
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignForGrading, setSelectedAssignForGrading] = useState("");
  const [submissions, setSubmissions] = useState({});
  const [assignTitle, setAssignTitle] = useState("");
  const [assignCourse, setAssignCourse] = useState(coursesList[0]?.code || "");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  
  // Custom Due Date states
  const [dueDay, setDueDay] = useState("");
  const [dueMonth, setDueMonth] = useState("");
  const [dueYear, setDueYear] = useState("");
  const [isDueDayOpen, setIsDueDayOpen] = useState(false);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysList = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const yearsList = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

  // Synchronize custom due date values with assignDueDate
  useEffect(() => {
    if (dueDay && dueMonth && dueYear) {
      const monthNum = monthsList.indexOf(dueMonth) + 1;
      if (monthNum > 0) {
        const formattedMonth = monthNum.toString().padStart(2, "0");
        const formattedDay = dueDay.padStart(2, "0");
        setAssignDueDate(`${dueYear}-${formattedMonth}-${formattedDay}`);
      } else {
        setAssignDueDate("");
      }
    } else {
      setAssignDueDate("");
    }
  }, [dueDay, dueMonth, dueYear]);

  // Due date validation helper
  const getDueMaxDays = (monthName, yearString) => {
    if (!monthName) return 31;
    const m = monthName.toLowerCase();
    if (["april", "june", "september", "november"].includes(m)) {
      return 30;
    }
    if (m === "february") {
      const yr = parseInt(yearString, 10);
      if (!isNaN(yr) && ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0)) {
        return 29;
      }
      return 28;
    }
    return 31;
  };

  const handleDueDayChange = (val) => {
    setIsDueDayOpen(true);
    if (val === "") {
      setDueDay("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    const dayNum = parseInt(val, 10);
    const maxDays = getDueMaxDays(dueMonth, dueYear);
    if (dayNum <= maxDays) {
      setDueDay(val);
    }
  };

  const handleDueMonthChange = (val) => {
    if (val === "") {
      setDueMonth("");
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) return;
    setDueMonth(val);
  };

  const handleDueYearChange = (val) => {
    if (val === "") {
      setDueYear("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    if (val.length > 4) return;
    setDueYear(val);
  };

  const handleDueDayBlur = () => {
    setTimeout(() => {
      setIsDueDayOpen(false);
      if (dueDay) {
        const dayNum = parseInt(dueDay, 10);
        if (isNaN(dayNum) || dayNum < 1) {
          setDueDay("");
        } else {
          setDueDay(dayNum.toString());
        }
      }
    }, 200);
  };

  const handleDueMonthBlur = () => {
    if (dueMonth) {
      const matchedMonth = monthsList.find(
        (m) => m.toLowerCase() === dueMonth.toLowerCase()
      );
      if (matchedMonth) {
        setDueMonth(matchedMonth);
        const maxDays = getDueMaxDays(matchedMonth, dueYear);
        if (dueDay && parseInt(dueDay, 10) > maxDays) {
          setDueDay(maxDays.toString());
        }
      } else {
        setDueMonth("");
      }
    }
  };

  const handleDueYearBlur = () => {
    if (dueYear) {
      const yrNum = parseInt(dueYear, 10);
      const currentYr = new Date().getFullYear();
      if (isNaN(yrNum) || yrNum < currentYr || yrNum > currentYr + 20) {
        setDueYear("");
      } else {
        setDueYear(yrNum.toString());
        if (dueMonth.toLowerCase() === "february") {
          const maxDays = getDueMaxDays("february", yrNum.toString());
          if (dueDay && parseInt(dueDay, 10) > maxDays) {
            setDueDay(maxDays.toString());
          }
        }
      }
    }
  };

  const [assignSuccess, setAssignSuccess] = useState("");

  // Grade Edit Form State
  const [gradingStudentId, setGradingStudentId] = useState(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradeSuccess, setGradeSuccess] = useState("");

  const defaultAssignments = [
    {
      id: "assign_1",
      title: "Socket Programming in Python (TCP/UDP)",
      courseCode: "CS-301",
      dueDate: "2026-07-25",
      description: "Implement a multi-threaded TCP server and client chat. Handle errors gracefully.",
    },
    {
      id: "assign_2",
      title: "Lab 2: POSIX Threads & Producer-Consumer Semaphores",
      courseCode: "CS-302",
      dueDate: "2026-07-28",
      description: "Simulate a shared buffer stack with POSIX mutex locks and semaphores in C.",
    },
  ];

  const defaultSubmissions = {
    "assign_1": [
      { studentId: "1RV21CS001", studentName: "Aman Yadav", file: "socket_chat_aman.zip", submittedAt: "2026-07-16", status: "Pending", marks: "", feedback: "" },
      { studentId: "1RV21CS002", studentName: "John Doe", file: "socket_chat_doe.py", submittedAt: "2026-07-15", status: "Pending", marks: "", feedback: "" },
      { studentId: "1RV21CS003", studentName: "Jane Smith", file: "network_threads.pdf", submittedAt: "2026-07-14", status: "Graded", marks: "9.5", feedback: "Excellent documentation and thread safety handles." },
      { studentId: "1RV21CS004", studentName: "Bob Johnson", file: "", submittedAt: "", status: "Not Submitted", marks: "", feedback: "" },
      { studentId: "1RV21CS005", studentName: "Alice Brown", file: "py_sockets_final.zip", submittedAt: "2026-07-15", status: "Graded", marks: "8.0", feedback: "Good effort, but missing handling for multiple clients concurrently." },
    ],
    "assign_2": [
      { studentId: "1RV21CS001", studentName: "Aman Yadav", file: "producer_consumer_v1.c", submittedAt: "2026-07-17", status: "Pending", marks: "", feedback: "" },
      { studentId: "1RV21CS003", studentName: "Jane Smith", file: "posix_sems.zip", submittedAt: "2026-07-16", status: "Graded", marks: "10.0", feedback: "Flawless code structure and compile execution outputs." },
    ]
  };

  useEffect(() => {
    if (coursesList.length > 0 && !assignCourse) {
      setAssignCourse(coursesList[0].code);
    }
  }, [coursesList, assignCourse]);

  useEffect(() => {
    if (user?.id) {
      const savedAssigns = localStorage.getItem(`unitech_faculty_assigns_${user.id}`);
      const savedSubmissions = localStorage.getItem(`unitech_faculty_subs_${user.id}`);
      
      if (savedAssigns) {
        setAssignments(JSON.parse(savedAssigns));
      } else {
        setAssignments(defaultAssignments);
        localStorage.setItem(`unitech_faculty_assigns_${user.id}`, JSON.stringify(defaultAssignments));
      }

      if (savedSubmissions) {
        setSubmissions(JSON.parse(savedSubmissions));
      } else {
        setSubmissions(defaultSubmissions);
        localStorage.setItem(`unitech_faculty_subs_${user.id}`, JSON.stringify(defaultSubmissions));
      }
    }
  }, [user]);

  // Set default grading assignment on mount
  useEffect(() => {
    if (assignments.length > 0 && !selectedAssignForGrading) {
      setSelectedAssignForGrading(assignments[0].id);
    }
  }, [assignments, selectedAssignForGrading]);

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDueDate) return;

    const newAssignId = "assign_" + Date.now();
    const newAssignment = {
      id: newAssignId,
      title: assignTitle.trim(),
      courseCode: assignCourse,
      dueDate: assignDueDate,
      description: assignDesc.trim() || "No details provided.",
    };

    const updatedAssigns = [...assignments, newAssignment];
    setAssignments(updatedAssigns);
    
    // Setup empty mock submissions for this new assignment
    const updatedSubs = {
      ...submissions,
      [newAssignId]: [
        { studentId: "1RV21CS001", studentName: "Aman Yadav", file: "", submittedAt: "", status: "Not Submitted", marks: "", feedback: "" },
        { studentId: "1RV21CS002", studentName: "John Doe", file: "", submittedAt: "", status: "Not Submitted", marks: "", feedback: "" },
        { studentId: "1RV21CS003", studentName: "Jane Smith", file: "", submittedAt: "", status: "Not Submitted", marks: "", feedback: "" },
      ]
    };
    setSubmissions(updatedSubs);

    if (user?.id) {
      localStorage.setItem(`unitech_faculty_assigns_${user.id}`, JSON.stringify(updatedAssigns));
      localStorage.setItem(`unitech_faculty_subs_${user.id}`, JSON.stringify(updatedSubs));
    }

    setAssignTitle("");
    setAssignDueDate("");
    setDueDay("");
    setDueMonth("");
    setDueYear("");
    setAssignDesc("");
    setSelectedAssignForGrading(newAssignId);
    setAssignSuccess("Assignment created and published to students!");

    setTimeout(() => {
      setAssignSuccess("");
    }, 3000);
  };

  const handleOpenGradingModal = (sub) => {
    setGradingStudentId(sub.studentId);
    setGradingMarks(sub.marks || "");
    setGradingFeedback(sub.feedback || "");
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    if (!selectedAssignForGrading || !gradingStudentId) return;

    const assignmentSubsList = submissions[selectedAssignForGrading] || [];
    const updatedSubsList = assignmentSubsList.map(sub => {
      if (sub.studentId === gradingStudentId) {
        return {
          ...sub,
          status: "Graded",
          marks: gradingMarks,
          feedback: gradingFeedback.trim(),
        };
      }
      return sub;
    });

    const updatedAllSubs = {
      ...submissions,
      [selectedAssignForGrading]: updatedSubsList
    };

    setSubmissions(updatedAllSubs);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_subs_${user.id}`, JSON.stringify(updatedAllSubs));
    }

    setGradingStudentId(null);
    setGradingMarks("");
    setGradingFeedback("");
    setGradeSuccess("Grade updated and posted successfully!");
    
    setTimeout(() => {
      setGradeSuccess("");
    }, 2500);
  };

  // --- Research Papers State (Persisted) ---
  const [researchPapers, setResearchPapers] = useState([]);
  const [paperTitle, setPaperTitle] = useState("");
  const [paperJournal, setPaperJournal] = useState("");
  const [paperDate, setPaperDate] = useState("");
  const [paperStatus, setPaperStatus] = useState("published");
  const [paperSuccess, setPaperSuccess] = useState("");

  // Custom Research Paper Date states
  const [paperDay, setPaperDay] = useState("");
  const [paperMonth, setPaperMonth] = useState("");
  const [paperYear, setPaperYear] = useState("");
  const [isPaperDayOpen, setIsPaperDayOpen] = useState(false);
  const [isPaperMonthOpen, setIsPaperMonthOpen] = useState(false);
  const [isPaperYearOpen, setIsPaperYearOpen] = useState(false);

  const paperYearsList = Array.from({ length: 25 }, (_, i) => (2015 + i).toString());

  // Synchronize custom paper date values with paperDate
  useEffect(() => {
    if (paperDay && paperMonth && paperYear) {
      const formattedDay = paperDay.padStart(2, "0");
      const formattedMonth = paperMonth.padStart(2, "0");
      setPaperDate(`${paperYear}-${formattedMonth}-${formattedDay}`);
    } else {
      setPaperDate("");
    }
  }, [paperDay, paperMonth, paperYear]);

  // Paper date validation helper for numeric MM
  const getPaperMaxDays = (monthNumStr, yearString) => {
    if (!monthNumStr) return 31;
    const m = parseInt(monthNumStr, 10);
    if ([4, 6, 9, 11].includes(m)) {
      return 30;
    }
    if (m === 2) {
      const yr = parseInt(yearString, 10);
      if (!isNaN(yr) && ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0)) {
        return 29;
      }
      return 28;
    }
    return 31;
  };

  const handlePaperDayChange = (val) => {
    setIsPaperDayOpen(true);
    if (val === "") {
      setPaperDay("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    const dayNum = parseInt(val, 10);
    const maxDays = getPaperMaxDays(paperMonth, paperYear);
    if (dayNum <= maxDays) {
      setPaperDay(val);
    }
  };

  const handlePaperMonthChange = (val) => {
    setIsPaperMonthOpen(true);
    if (val === "") {
      setPaperMonth("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    const mNum = parseInt(val, 10);
    if (mNum <= 12) {
      setPaperMonth(val);
    }
  };

  const handlePaperYearChange = (val) => {
    setIsPaperYearOpen(true);
    if (val === "") {
      setPaperYear("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    if (val.length > 4) return;
    setPaperYear(val);
  };

  const handlePaperDayBlur = () => {
    setTimeout(() => {
      setIsPaperDayOpen(false);
      if (paperDay) {
        const dayNum = parseInt(paperDay, 10);
        if (isNaN(dayNum) || dayNum < 1) {
          setPaperDay("");
        } else {
          setPaperDay(dayNum.toString().padStart(2, "0"));
        }
      }
    }, 200);
  };

  const handlePaperMonthBlur = () => {
    setTimeout(() => {
      setIsPaperMonthOpen(false);
      if (paperMonth) {
        const mNum = parseInt(paperMonth, 10);
        if (isNaN(mNum) || mNum < 1 || mNum > 12) {
          setPaperMonth("");
        } else {
          const formattedMonth = mNum.toString().padStart(2, "0");
          setPaperMonth(formattedMonth);
          const maxDays = getPaperMaxDays(formattedMonth, paperYear);
          if (paperDay && parseInt(paperDay, 10) > maxDays) {
            setPaperDay(maxDays.toString().padStart(2, "0"));
          }
        }
      }
    }, 200);
  };

  const handlePaperYearBlur = () => {
    setTimeout(() => {
      setIsPaperYearOpen(false);
      if (paperYear) {
        const yrNum = parseInt(paperYear, 10);
        const currentYr = new Date().getFullYear();
        if (isNaN(yrNum) || yrNum < 1900 || yrNum > currentYr + 15) {
          setPaperYear("");
        } else {
          setPaperYear(yrNum.toString());
          if (parseInt(paperMonth, 10) === 2) {
            const maxDays = getPaperMaxDays("02", yrNum.toString());
            if (paperDay && parseInt(paperDay, 10) > maxDays) {
              setPaperDay(maxDays.toString().padStart(2, "0"));
            }
          }
        }
      }
    }, 200);
  };

  const defaultPapers = [
    { id: "p1", title: "An Optimization Algorithm for Multi-Tenant Cloud Architecture", journal: "International Journal of Cloud Computing", date: "2025-11-20", status: "published" },
    { id: "p2", title: "Machine Learning Approaches in Decentralized Network Synchronization", journal: "IEEE Transactions on Mobile Computing", date: "2026-03-14", status: "under review" },
  ];

  useEffect(() => {
    if (user?.id) {
      const savedPapers = localStorage.getItem(`unitech_faculty_papers_${user.id}`);
      if (savedPapers) {
        try {
          setResearchPapers(JSON.parse(savedPapers));
        } catch (e) {
          setResearchPapers(defaultPapers);
        }
      } else {
        setResearchPapers(defaultPapers);
        localStorage.setItem(`unitech_faculty_papers_${user.id}`, JSON.stringify(defaultPapers));
      }
    }
  }, [user]);

  const handleAddPaper = (e) => {
    e.preventDefault();
    if (!paperTitle.trim() || !paperJournal.trim()) return;

    const newPaper = {
      id: "p_" + Date.now(),
      title: paperTitle.trim(),
      journal: paperJournal.trim(),
      date: paperDate || new Date().toISOString().split("T")[0],
      status: paperStatus,
    };

    const updated = [...researchPapers, newPaper];
    setResearchPapers(updated);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_papers_${user.id}`, JSON.stringify(updated));
    }

    setPaperTitle("");
    setPaperJournal("");
    setPaperDate("");
    setPaperDay("");
    setPaperMonth("");
    setPaperYear("");
    setPaperSuccess("Research publication entry added!");
    
    setTimeout(() => {
      setPaperSuccess("");
    }, 2500);
  };

  const handleDeletePaper = (paperId) => {
    const updated = researchPapers.filter(p => p.id !== paperId);
    setResearchPapers(updated);
    if (user?.id) {
      localStorage.setItem(`unitech_faculty_papers_${user.id}`, JSON.stringify(updated));
    }
  };

  // --- Save Profile Handler ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setProfileLoading(true);

    try {
      await updateUserProfile({
        name: editName,
        phone: editPhone,
        age: Number(editAge),
        department: editDepartment,
        salary: Number(editSalary),
      });
      setProfileSuccessMsg("Profile details updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(err.message || "Failed to update profile. Updates cached for current session.");
      // Fallback local update simulation if backend server update triggers an error
      if (user) {
        user.name = editName;
        user.profile = {
          ...user.profile,
          phone: editPhone,
          age: Number(editAge),
          department: editDepartment,
          salary: Number(editSalary),
        };
      }
      setProfileSuccessMsg("Profile updated (Session simulated fallback).");
      setIsEditing(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // --- RENDER 1: Public Marketing & Landing Page (Not logged in) ---
  if (!user || user.role !== "faculty") {
    // Current stats and static lists for marketing view
    const stats = [
      { title: "Faculty Members", value: "320+", icon: <Users size={36} /> },
      { title: "Departments", value: "12", icon: <Building2 size={36} /> },
      { title: "Research Papers", value: "850+", icon: <BookOpen size={36} /> },
      { title: "Awards", value: "120+", icon: <Award size={36} /> },
    ];

    const services = [
      { icon: <ClipboardCheck size={34} />, title: "Attendance Management", description: "Manage class attendance efficiently and generate attendance reports." },
      { icon: <CalendarDays size={34} />, title: "Academic Schedule", description: "Access teaching schedules, semester calendars, and examination timetables." },
      { icon: <FileText size={34} />, title: "Assignments", description: "Create assignments, evaluate submissions, and provide student feedback." },
      { icon: <Laptop size={34} />, title: "Digital Classroom", description: "Upload lecture notes, presentations, videos, and learning resources." },
      { icon: <FlaskConical size={34} />, title: "Research Portal", description: "Manage research projects, publications, grants, and collaborations." },
      { icon: <Briefcase size={34} />, title: "Faculty Dashboard", description: "Track workload, courses, student progress, and administrative tasks." },
    ];

    const departments = [
      "Computer Science & Engineering",
      "Information Science",
      "Artificial Intelligence & ML",
      "Electronics & Communication",
      "Mechanical Engineering",
      "Civil Engineering",
    ];

    return (
      <div className="min-h-screen bg-slate-50 animate-fadeIn">
        {/* Hero */}
        <section className="bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-900 py-24 text-white">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <GraduationCap className="mx-auto mb-6 h-16 w-16 text-indigo-200" />
            <h1 className="text-5xl font-bold tracking-tight">Faculty Portal</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100 font-medium">
              Empowering educators with modern teaching tools, research opportunities, academic resources, and seamless university management.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-8 text-center shadow-md border border-slate-100 transition hover:-translate-y-1.5 hover:shadow-lg duration-200">
                <div className="mb-4 flex justify-center text-indigo-600">{item.icon}</div>
                <h2 className="text-4xl font-extrabold text-slate-800">{item.value}</h2>
                <p className="mt-2 text-slate-500 font-semibold text-sm">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Faculty Services */}
        <section className="bg-white py-20 border-y border-slate-200/50">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-12 text-center text-4xl font-extrabold text-slate-800 tracking-tight">Faculty Services</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div key={service.title} className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-8 hover:bg-white hover:border-indigo-600 hover:shadow-xl transition-all duration-300">
                  <div className="mb-5 text-indigo-600">{service.icon}</div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-800">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm">{service.description}</p>
                  <button className="mt-6 flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-800 text-sm">
                    Learn More <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Departments */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="mb-12 text-center text-4xl font-extrabold text-slate-800 tracking-tight">Academic Departments</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <div key={dept} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/60 hover:bg-indigo-600 hover:text-white group transition-all duration-200 cursor-pointer">
                <Building2 className="mb-4 text-indigo-600 group-hover:text-white transition duration-200" size={34} />
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-white transition duration-200">{dept}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-700 py-20 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight">Inspire the Next Generation</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-indigo-100 font-medium">
            Join our faculty community and contribute to world-class education, impactful research, and student success.
          </p>
          <button
            onClick={() => onOpenAuth("login", "faculty")}
            className="mt-8 rounded-2xl bg-white px-8 py-3.5 font-bold text-indigo-700 shadow-lg shadow-indigo-900/30 hover:bg-slate-50 transition duration-200 active:scale-[0.98]"
          >
            Faculty Login
          </button>
        </section>
      </div>
    );
  }

  // --- RENDER 2: Logged-in Faculty Dashboard Layout ---
  const teacherProfile = user.profile || {};
  
  // Filter courses or list objects for searches
  const filteredCourses = coursesList;

  const filteredTasks = tasks;

  const SITE_PAGES = [
    // --- HOME PAGE ---
    {
      title: "UniTech Portal Home",
      description: "Welcome to UniTech portal - smart university management.",
      path: "/",
      category: "Home Page",
      keywords: ["home", "unitech", "portal", "management", "welcome"]
    },
    {
      title: "Student Management Info",
      description: "Manage student profiles, records, and enrollments.",
      path: "/",
      category: "Home Page Features",
      keywords: ["student", "management", "record", "profile", "enrollment"]
    },
    {
      title: "Faculty Portal Info",
      description: "Faculty dashboard with attendance and course tools.",
      path: "/faculty",
      category: "Faculty Portal",
      keywords: ["faculty", "portal", "dashboard", "attendance", "course", "teacher"]
    },
    {
      title: "Course Management Desk",
      description: "Departments, semesters, and subjects management.",
      path: "/faculty",
      category: "Academics",
      keywords: ["course", "management", "subject", "semester", "department"]
    },
    {
      title: "Placement Rate & Stats",
      description: "University academic statistics and placement details.",
      path: "/institutions",
      category: "About Us",
      keywords: ["placement", "statistic", "job", "career", "rate"]
    },

    // --- INSTITUTIONS PAGE ---
    {
      title: "About Our Institution",
      description: "Commitment to academic excellence, innovation, and research.",
      path: "/institutions",
      category: "Institution Details",
      keywords: ["about", "institution", "university", "excellence", "history"]
    },
    {
      title: "Central Library",
      description: "Thousands of books, journals, and digital assets.",
      path: "/institutions",
      category: "Facilities",
      keywords: ["library", "book", "journal", "resource", "reading"]
    },
    {
      title: "Computer & Tech Labs",
      description: "High-performance computing laboratories and software.",
      path: "/institutions",
      category: "Facilities",
      keywords: ["computer", "lab", "technology", "hpc", "software"]
    },
    {
      title: "Vision & Mission",
      description: "Empowering students through quality education and ethical values.",
      path: "/institutions",
      category: "About Us",
      keywords: ["vision", "mission", "values", "ethics", "goal"]
    },

    // --- FACULTY PAGE ---
    {
      title: "Faculty Dashboard Hub",
      description: "Track course workload and student assignments.",
      path: "/faculty",
      tab: "overview",
      category: "Faculty",
      keywords: ["faculty", "dashboard", "workload", "course", "assignment"]
    },
    {
      title: "Faculty Attendance Panel",
      description: "Mark and manage student attendance.",
      path: "/faculty",
      tab: "attendance",
      category: "Faculty Portal",
      keywords: ["attendance", "present", "class", "student"]
    },
    {
      title: "Grading & Evaluation Desk",
      description: "Evaluate assignments and grade submissions.",
      path: "/faculty",
      tab: "grading",
      category: "Faculty Portal",
      keywords: ["grade", "result", "mark", "grading", "evaluation", "assignment"]
    },
    {
      title: "Research Labs & Portal",
      description: "Advanced research, publications, and grants.",
      path: "/faculty",
      tab: "research",
      category: "Research",
      keywords: ["research", "publication", "grant", "paper", "innovation"]
    },
    {
      title: "Academic Departments",
      description: "CSE, ISE, AIML, ECE, Mechanical, and Civil departments.",
      path: "/faculty",
      category: "Academics",
      keywords: ["department", "cse", "ise", "aiml", "ece", "engineering"]
    },

    // --- CONTACT PAGE ---
    {
      title: "Contact Us & Inquiry Form",
      description: "Get in touch with university admissions or administration.",
      path: "/contact",
      category: "Inquiries",
      keywords: ["contact", "email", "address", "phone", "support", "help"]
    }
  ];

  const getSearchResults = () => {
    if (!globalSearchQuery) return [];
    const query = globalSearchQuery.toLowerCase();
    const results = [];

    SITE_PAGES.forEach((item) => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesKeywords = item.keywords.some((kw) => kw.includes(query));

      if (matchesTitle || matchesDesc || matchesKeywords) {
        results.push(item);
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  const activeAssignmentObj = assignments.find(a => a.id === selectedAssignForGrading);
  const activeSubmissionsList = submissions[selectedAssignForGrading] || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row animate-fadeIn">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
        {/* User Badge */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-lg border border-indigo-100 shrink-0">
            {user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2) : "FC"}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-extrabold text-slate-800 leading-tight truncate">{user.name}</h4>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mt-1 border border-indigo-100/50">
              ID: {teacherProfile.id || "NOT SET"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Activity size={18} />
            Portal Overview
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "attendance"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ClipboardCheck size={18} />
            Record Attendance
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "resources"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Laptop size={18} />
            Digital Classroom
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "assignments"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FileText size={18} />
            Grading & Assignment Hub
          </button>

          <button
            onClick={() => setActiveTab("research")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "research"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FlaskConical size={18} />
            Research publications
          </button>

          <button
            onClick={() => setActiveTab("notices")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "notices"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            Announcements Board
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <User size={18} />
            Faculty Profile
          </button>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-200 text-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Header Block */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "attendance" && "Class Attendance Sheets"}
              {activeTab === "resources" && "Digital Classroom Workspace"}
              {activeTab === "assignments" && "Assignments & Submission Grading"}
              {activeTab === "research" && "Research Publications Registry"}
              {activeTab === "notices" && "Department Notice Desk"}
              {activeTab === "profile" && "Faculty Core Profile"}
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-semibold">
              Department: <strong className="text-slate-700">{teacherProfile.department || "Computer Science"} </strong> &bull; Employment Role: <strong className="text-slate-700">Educator & Researcher</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[280px] flex-1 sm:flex-initial" id="search-container">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search portal & website..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-2xl border border-slate-200/60 pl-10 pr-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold text-slate-800 shadow-sm placeholder:text-slate-400"
              />

              {/* Dropdown Menu */}
              {isSearchFocused && globalSearchQuery && (
                <div className="absolute left-0 right-0 mt-2 z-[60] max-h-[320px] overflow-y-auto bg-white rounded-2xl border border-slate-200/80 shadow-2xl py-2 flex flex-col divide-y divide-slate-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => {
                      let icon = <Search className="h-4 w-4 text-slate-500" />;
                      if (result.category.startsWith("Home")) icon = <LayoutDashboard className="h-4 w-4 text-indigo-500" />;
                      else if (result.category === "Institution Details" || result.category === "Facilities") icon = <Building2 className="h-4 w-4 text-sky-500" />;
                      else if (result.category === "Students" || result.category === "Student Life" || result.category === "Academics") icon = <GraduationCap className="h-4 w-4 text-emerald-500" />;
                      else if (result.category.startsWith("Faculty")) icon = <Briefcase className="h-4 w-4 text-amber-500" />;
                      else if (result.category === "Research") icon = <FlaskConical className="h-4 w-4 text-violet-500" />;
                      else if (result.category === "Notices") icon = <Bell className="h-4 w-4 text-rose-500" />;
                      else if (result.category === "Inquiries") icon = <Mail className="h-4 w-4 text-pink-500" />;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setIsSearchFocused(false);
                            if (result.path === "/faculty") {
                              if (result.tab) {
                                setActiveTab(result.tab);
                              }
                              setGlobalSearchQuery("");
                            } else {
                              navigate(result.path);
                            }
                          }}
                          className="flex items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50/80 transition-colors w-full group animate-in fade-in duration-100"
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white transition-colors shrink-0 mt-0.5 animate-in fade-in">
                            {icon}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                              {result.title}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 uppercase tracking-wide">
                              {result.category} &bull; {result.description}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-500 text-xs font-semibold">
                      No matches found for "{globalSearchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Icon */}
            <button
              onClick={() => setActiveTab("notices")}
              className="relative p-3 bg-white rounded-2xl shadow-sm border border-slate-200/50 hover:bg-slate-50 transition text-slate-500 hover:text-indigo-600 flex items-center justify-center shrink-0"
              title="Campus Notices"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-4 ring-white">
                {notices.length}
              </span>
            </button>

            {/* Date Badge */}
            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl shadow-sm border border-slate-200/50 shrink-0">
              <CalendarDays className="text-indigo-600 h-5 w-5" />
              <div className="text-left font-semibold">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Academic Date</p>
                <p className="text-xs text-slate-700">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Global Notifications Panel */}
        {profileSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            {profileSuccessMsg}
          </div>
        )}

        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Greeting Card Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
              <div className="absolute right-20 bottom-0 -mb-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-indigo-100">
                    Faculty Portal Active
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Welcome Back, {user.name}!
                  </h3>
                  <p className="text-indigo-100 text-sm md:text-base font-medium max-w-xl">
                    Educator at {teacherProfile.department || "Computer Science Department"}. You have {coursesList.length} active courses to manage today.
                  </p>
                </div>
                
                {/* Stats Summary Widget inside Banner */}
                <div className="flex gap-4 md:gap-6 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                  <div className="text-center font-bold">
                    <p className="text-[10px] uppercase font-bold text-indigo-200">📚 Courses</p>
                    <p className="text-lg md:text-xl text-white">{coursesList.length}</p>
                  </div>
                  <div className="w-[1px] bg-white/20 self-stretch"></div>
                  <div className="text-center font-bold">
                    <p className="text-[10px] uppercase font-bold text-indigo-200">👥 Total Students</p>
                    <p className="text-lg md:text-xl text-white">
                      {coursesList.reduce((acc, c) => acc + c.studentsCount, 0)}
                    </p>
                  </div>
                  <div className="w-[1px] bg-white/20 self-stretch"></div>
                  <div className="text-center font-bold">
                    <p className="text-[10px] uppercase font-bold text-indigo-200">✅ Tasks Pending</p>
                    <p className="text-lg md:text-xl text-white">
                      {tasks.filter(t => !t.completed).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Workload Stats Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Card 1: Monthly Salary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                    <DollarSign size={16} /> Monthly Salary (INR)
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">
                    ₹{teacherProfile.salary ? Number(teacherProfile.salary).toLocaleString() : "85,000"}
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                    Direct Credit Profile
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                  <DollarSign size={26} />
                </div>
              </div>

              {/* Card 2: Average Class Attendance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                    <span>📊</span> Avg Class Attendance
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">84.5%</h3>
                  <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                    Healthy engagement
                  </span>
                </div>
                <div className="relative h-14 w-14 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-indigo-600" strokeWidth="3.5" strokeDasharray="84, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">84%</div>
                </div>
              </div>

              {/* Card 3: Research Papers Pinned */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                    <span>📝</span> Research Publications
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{researchPapers.length} Entries</h3>
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                    {researchPapers.filter(p => p.status === "published").length} Published
                  </span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                  <FlaskConical size={26} />
                </div>
              </div>

              {/* Card 4: Hours per week workload */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                    <span>⏰</span> Lecture Workload
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">
                    {coursesList.length * 4} hrs/wk
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">
                    Excludes research & grading
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                  <Clock size={26} />
                </div>
              </div>

            </div>

            {/* Teaching Schedule & Academic Checklists */}
            <div className="grid gap-8 lg:grid-cols-5">
              
              {/* Teaching Classes (3 Columns) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-slate-800">Teaching Course Syllabus & Schedule</h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Active Semester
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                      No matching courses found.
                    </div>
                  ) : (
                    filteredCourses.map((course, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-200 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {course.code}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">{course.credits} Credits</span>
                          </div>
                          <h5 className="font-extrabold text-slate-800 text-base">{course.name}</h5>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} /> {course.schedule}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {course.room}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right font-semibold">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Registered</p>
                            <p className="text-xs text-slate-700">{course.studentsCount} Students</p>
                          </div>
                          <button
                            onClick={() => {
                              setAttendanceCourse(course.code);
                              setActiveTab("attendance");
                            }}
                            className="bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition"
                          >
                            Mark Attendance
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* To-Do Checklist (2 Columns) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">Academic Checklist</h4>
                  <p className="text-xs text-slate-400 font-semibold mb-5">Manage and organize your teaching, resource, and test tasks.</p>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <CheckSquare size={36} className="mx-auto text-slate-300" />
                        <p className="text-sm font-bold">No tasks left. All clean!</p>
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                        No matching items.
                      </div>
                    ) : (
                      filteredTasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition duration-150 ${
                            task.completed
                              ? "bg-slate-50/50 border-slate-100 text-slate-400 line-through"
                              : "bg-white border-slate-200/80 text-slate-700 shadow-sm hover:border-slate-300"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden pr-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 shrink-0"
                            />
                            <span className="text-xs font-bold truncate select-none">{task.text}</span>
                          </label>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <form onSubmit={handleAddTask} className="mt-5 flex gap-2 pt-4 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Add checklist item..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* --- TAB 2: RECORD ATTENDANCE --- */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/50 space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-xl font-extrabold text-slate-800">Roll Call Roster</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Select class, date and mark students present or absent.</p>
            </div>

            {attendanceSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-bold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                {attendanceSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitAttendance} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Class Course</label>
                  <select
                    value={attendanceCourse}
                    onChange={(e) => setAttendanceCourse(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {coursesList.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Attendance Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day Input & Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Day"
                        value={attDay}
                        onChange={(e) => handleAttDayChange(e.target.value)}
                        onFocus={() => setIsAttDayOpen(true)}
                        onBlur={handleAttDayBlur}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      {isAttDayOpen && (
                        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                          {Array.from({ length: getAttMaxDays(attMonth, attYear) }, (_, i) => (i + 1).toString()).map((d) => (
                            <li
                              key={d}
                              onMouseDown={() => {
                                setAttDay(d);
                                setIsAttDayOpen(false);
                              }}
                              className="px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold"
                            >
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Month Input & Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Month"
                        value={attMonth}
                        onChange={(e) => handleAttMonthChange(e.target.value)}
                        onFocus={() => setIsAttMonthOpen(true)}
                        onBlur={handleAttMonthBlur}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      {isAttMonthOpen && (
                        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                          {monthsList.map((m) => (
                            <li
                              key={m}
                              onMouseDown={() => {
                                setAttMonth(m);
                                setIsAttMonthOpen(false);
                                const maxDays = getAttMaxDays(m, attYear);
                                if (attDay && parseInt(attDay, 10) > maxDays) {
                                  setAttDay(maxDays.toString());
                                }
                              }}
                              className="px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold"
                            >
                              {m}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Year Input & Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Year"
                        value={attYear}
                        onChange={(e) => handleAttYearChange(e.target.value)}
                        onFocus={() => setIsAttYearOpen(true)}
                        onBlur={handleAttYearBlur}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      {isAttYearOpen && (
                        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                          {attYearsList.map((y) => (
                            <li
                              key={y}
                              onMouseDown={() => {
                                setAttYear(y);
                                setIsAttYearOpen(false);
                                if (attMonth.toLowerCase() === "february") {
                                  const maxDays = getAttMaxDays("february", y);
                                  if (attDay && parseInt(attDay, 10) > maxDays) {
                                    setAttDay(maxDays.toString());
                                  }
                                }
                              }}
                              className="px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold"
                            >
                              {y}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-bold">
                  Class Size: {studentRoster.length} students &bull; Present: {studentRoster.filter(s => s.present).length} &bull; Absent: {studentRoster.filter(s => !s.present).length}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAll(true)}
                    className="border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl bg-white"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll(false)}
                    className="border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl bg-white"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Student Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm font-semibold">
                  <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Student ID / USN</th>
                      <th className="px-6 py-4">Student Full Name</th>
                      <th className="px-6 py-4 text-center">Status (Toggle present)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {studentRoster.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">{student.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border duration-150 ${
                              student.present
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}
                          >
                            {student.present ? "Present" : "Absent"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition active:scale-[0.98] text-sm"
                >
                  Submit Daily Attendance
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB 3: DIGITAL CLASSROOM --- */}
        {activeTab === "resources" && (
          <div className="grid gap-8 lg:grid-cols-5 animate-fadeIn">
            {/* Upload Resource Form (2 columns) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800">Publish Study Resource</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Upload lecture notes, guides, and worksheets for students.</p>
                </div>

                {resSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    {resSuccess}
                  </div>
                )}

                <form onSubmit={handleUploadResource} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Resource Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit 2: Advanced Socket Handshakes"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Target Course</label>
                    <select
                      value={resCourse}
                      onChange={(e) => setResCourse(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    >
                      {coursesList.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Resource Link / URL</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. unitech.edu/notes/handshakes.pdf"
                      value={resLink}
                      onChange={(e) => setResLink(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                    <textarea
                      placeholder="Write brief description of study topics..."
                      rows="3"
                      value={resDesc}
                      onChange={(e) => setResDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition active:scale-[0.98] text-xs mt-2"
                  >
                    Upload study Resource
                  </button>
                </form>
              </div>
            </div>

            {/* Uploaded Resource List (3 columns) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800">Uploaded Classroom Resources</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Study assets currently published and accessible by enrolled students.</p>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {resources.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Laptop size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-bold">No digital resources uploaded yet.</p>
                      <p className="text-xs">Fill out the left form to publish materials.</p>
                    </div>
                  ) : (
                    resources.map((res) => (
                      <div key={res.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex items-start justify-between gap-4">
                        <div className="space-y-1.5 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {res.courseCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{res.date}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{res.title}</h4>
                          <p className="text-xs text-slate-500 leading-normal line-clamp-2">{res.description}</p>
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-indigo-600 hover:underline block pt-1"
                          >
                            Open Link &rarr;
                          </a>
                        </div>

                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                          title="Delete Resource"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: GRADING & ASSIGNMENT HUB --- */}
        {activeTab === "assignments" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top creation & Selection panel */}
            <div className="grid gap-8 lg:grid-cols-5">
              
              {/* Build Assignment Form (2 Columns) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-5">
                    <h3 className="text-lg font-extrabold text-slate-800">Build New Assignment</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Deploy worksheets and coding tasks with strict due dates.</p>
                  </div>

                  {assignSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      {assignSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Assignment Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Assignment 2: Database Joins"
                        value={assignTitle}
                        onChange={(e) => setAssignTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid gap-4 grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Target Course</label>
                        <select
                          value={assignCourse}
                          onChange={(e) => setAssignCourse(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                        >
                          {coursesList.map(c => (
                            <option key={c.code} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Day Input & Dropdown */}
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Day"
                              value={dueDay}
                              onChange={(e) => handleDueDayChange(e.target.value)}
                              onFocus={() => setIsDueDayOpen(true)}
                              onBlur={handleDueDayBlur}
                              className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                            />
                            {isDueDayOpen && (
                              <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {daysList
                                  .filter((d) => d.includes(dueDay))
                                  .map((d) => (
                                    <li
                                      key={d}
                                      onMouseDown={() => {
                                        setDueDay(d);
                                        setIsDueDayOpen(false);
                                      }}
                                      className="px-2 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold"
                                    >
                                      {d}
                                    </li>
                                  ))}
                                {daysList.filter((d) => d.includes(dueDay)).length === 0 && (
                                  <li className="px-2 py-1.5 text-slate-400 text-xs font-semibold">No matches</li>
                                )}
                              </ul>
                            )}
                          </div>

                          {/* Month Input & Dropdown */}
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Month"
                              list="due-months-list"
                              value={dueMonth}
                              onChange={(e) => handleDueMonthChange(e.target.value)}
                              onBlur={handleDueMonthBlur}
                              className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                            />
                            <datalist id="due-months-list">
                              {monthsList.map((m) => (
                                <option key={m} value={m} />
                              ))}
                            </datalist>
                          </div>

                          {/* Year Input & Dropdown */}
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Year"
                              list="due-years-list"
                              value={dueYear}
                              onChange={(e) => handleDueYearChange(e.target.value)}
                              onBlur={handleDueYearBlur}
                              className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                            />
                            <datalist id="due-years-list">
                              {yearsList.map((y) => (
                                <option key={y} value={y} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Task Instructions</label>
                      <textarea
                        placeholder="Write details description, submission rules, guidelines..."
                        rows="3"
                        value={assignDesc}
                        onChange={(e) => setAssignDesc(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition active:scale-[0.98] text-xs mt-2"
                    >
                      Publish Assignment Sheet
                    </button>
                  </form>
                </div>
              </div>

              {/* Grading Submission Dashboard (3 Columns) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">Student Submissions Evaluator</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Review student files and submit numerical grades.</p>
                    </div>
                    
                    <select
                      value={selectedAssignForGrading}
                      onChange={(e) => {
                        setSelectedAssignForGrading(e.target.value);
                        setGradingStudentId(null);
                      }}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      {assignments.map(a => (
                        <option key={a.id} value={a.id}>{a.title.substring(0, 25)}...</option>
                      ))}
                    </select>
                  </div>

                  {gradeSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      {gradeSuccess}
                    </div>
                  )}

                  {/* Submission Detail List */}
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {activeSubmissionsList.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="font-bold">No submissions loaded for this assignment.</p>
                      </div>
                    ) : (
                      activeSubmissionsList.map((sub) => (
                        <div key={sub.studentId} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-slate-800 text-sm">{sub.studentName}</h5>
                              <span className="text-[9px] font-bold text-slate-400 font-mono">{sub.studentId}</span>
                            </div>
                            
                            {sub.file ? (
                              <div className="space-y-0.5">
                                <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                  <span>📎</span> {sub.file}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold">Submitted: {sub.submittedAt}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-red-500 font-bold">Not submitted</p>
                            )}

                            {sub.status === "Graded" && (
                              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-2.5 mt-2 max-w-sm">
                                <p className="text-xs text-emerald-800 font-bold">Grade: {sub.marks} / 10</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 italic leading-tight">Feedback: "{sub.feedback}"</p>
                              </div>
                            )}
                          </div>

                          {sub.file && (
                            <button
                              type="button"
                              onClick={() => handleOpenGradingModal(sub)}
                              className="bg-white border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition"
                            >
                              {sub.status === "Graded" ? "Re-Grade Task" : "Evaluate / Grade"}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Grade Input Overlay panel (if student selected) */}
            {gradingStudentId && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <h4 className="text-sm font-extrabold text-slate-800">
                    Grading Submission for: <strong className="text-indigo-600">
                      {activeSubmissionsList.find(s => s.studentId === gradingStudentId)?.studentName}
                    </strong>
                  </h4>
                  <button onClick={() => setGradingStudentId(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmitGrade} className="grid gap-4 md:grid-cols-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Score (Marks out of 10)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="e.g. 9.5"
                      value={gradingMarks}
                      onChange={(e) => setGradingMarks(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Evaluation Feedback</label>
                    <input
                      type="text"
                      placeholder="e.g. Clean multithreading logic, excellent comments."
                      value={gradingFeedback}
                      onChange={(e) => setGradingFeedback(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="md:col-span-1 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md text-xs transition"
                    >
                      Post Grade
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradingStudentId(null)}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-3 rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: RESEARCH PUBLICATIONS --- */}
        {activeTab === "research" && (
          <div className="grid gap-8 lg:grid-cols-5 animate-fadeIn">
            {/* Add Publication Form (2 columns) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800">Add Publication Record</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Log research papers, journals, and status in the university database.</p>
                </div>

                {paperSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    {paperSuccess}
                  </div>
                )}

                <form onSubmit={handleAddPaper} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Paper Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Consensus in IoT Systems"
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Journal / Conference Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IEEE Internet of Things Journal"
                      value={paperJournal}
                      onChange={(e) => setPaperJournal(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Publication Date (DD / MM / YYYY)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Day Input & Dropdown */}
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="DD"
                            value={paperDay}
                            onChange={(e) => handlePaperDayChange(e.target.value)}
                            onFocus={() => setIsPaperDayOpen(true)}
                            onBlur={handlePaperDayBlur}
                            className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-center"
                          />
                          {isPaperDayOpen && (
                            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                              {Array.from({ length: getPaperMaxDays(paperMonth, paperYear) }, (_, i) => (i + 1).toString().padStart(2, "0")).map((d) => (
                                <li
                                  key={d}
                                  onMouseDown={() => {
                                    setPaperDay(d);
                                    setIsPaperDayOpen(false);
                                  }}
                                  className="px-2 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold text-center"
                                >
                                  {d}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Month Input & Dropdown */}
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="MM"
                            value={paperMonth}
                            onChange={(e) => handlePaperMonthChange(e.target.value)}
                            onFocus={() => setIsPaperMonthOpen(true)}
                            onBlur={handlePaperMonthBlur}
                            className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-center"
                          />
                          {isPaperMonthOpen && (
                            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                              {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((m) => (
                                <li
                                  key={m}
                                  onMouseDown={() => {
                                    setPaperMonth(m);
                                    setIsPaperMonthOpen(false);
                                    const maxDays = getPaperMaxDays(m, paperYear);
                                    if (paperDay && parseInt(paperDay, 10) > maxDays) {
                                      setPaperDay(maxDays.toString().padStart(2, "0"));
                                    }
                                  }}
                                  className="px-2 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold text-center"
                                >
                                  {m}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Year Input & Dropdown */}
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="YYYY"
                            value={paperYear}
                            onChange={(e) => handlePaperYearChange(e.target.value)}
                            onFocus={() => setIsPaperYearOpen(true)}
                            onBlur={handlePaperYearBlur}
                            className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-center"
                          />
                          {isPaperYearOpen && (
                            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                              {paperYearsList.map((y) => (
                                <li
                                  key={y}
                                  onMouseDown={() => {
                                    setPaperYear(y);
                                    setIsPaperYearOpen(false);
                                    if (parseInt(paperMonth, 10) === 2) {
                                      const maxDays = getPaperMaxDays("02", y);
                                      if (paperDay && parseInt(paperDay, 10) > maxDays) {
                                        setPaperDay(maxDays.toString().padStart(2, "0"));
                                      }
                                    }
                                  }}
                                  className="px-2 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-xs font-semibold text-center"
                                >
                                  {y}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                      <select
                        value={paperStatus}
                        onChange={(e) => setPaperStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                      >
                        <option value="published">Published</option>
                        <option value="under review">Under Review</option>
                        <option value="accepted">Accepted (Preprint)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition active:scale-[0.98] text-xs mt-2"
                  >
                    Log Publication Details
                  </button>
                </form>
              </div>
            </div>

            {/* Publication List (3 columns) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800">Logged Research Papers</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Research works logged in your official university faculty profile.</p>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {researchPapers.map((paper) => (
                    <div key={paper.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex items-start justify-between gap-4">
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            paper.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {paper.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{paper.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{paper.title}</h4>
                        <p className="text-xs text-indigo-600 font-bold">{paper.journal}</p>
                      </div>

                      <button
                        onClick={() => handleDeletePaper(paper.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                        title="Remove Publication"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: NOTICE BOARD --- */}
        {activeTab === "notices" && (
          <div className="grid gap-8 lg:grid-cols-5 animate-fadeIn">
            {/* Create Announcement Form (2 columns) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800">Publish Campus Notice</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Broadcast notifications directly to students on their dashboards.</p>
                </div>

                {noticeSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    {noticeSuccess}
                  </div>
                )}

                <form onSubmit={handlePostNotice} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Notice Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mid-term timetable released"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                      <select
                        value={newNoticeCategory}
                        onChange={(e) => setNewNoticeCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                      >
                        <option value="academic">Academic</option>
                        <option value="exams">Exams</option>
                        <option value="events">Events / Hackfests</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNoticeImportant}
                          onChange={(e) => setNewNoticeImportant(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                        />
                        <span className="text-xs font-bold text-slate-600">Mark Important</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Notice Content</label>
                    <textarea
                      placeholder="Write brief detailed broadcast announcement content here..."
                      rows="4"
                      required
                      value={newNoticeContent}
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition active:scale-[0.98] text-xs mt-2"
                  >
                    Broadcast Announcement notice
                  </button>
                </form>
              </div>
            </div>

            {/* Notices feed (3 columns) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-800">Published Notice Feed</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Campus broadcast notice desk announcements.</p>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {notices.map((notice) => (
                    <div key={notice.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex items-start justify-between gap-4">
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            notice.category === "exams"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : notice.category === "events"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>
                            {notice.category}
                          </span>
                          {notice.important && (
                            <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 animate-pulse">
                              Urgent
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">{notice.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{notice.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">{notice.content}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Author: {notice.author}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                        title="Delete Notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 7: FACULTY PROFILE --- */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/50 space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Faculty Core Profile</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Manage and edit your employment profile information.</p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <Edit size={14} />
                  Edit Profile Info
                </button>
              )}
            </div>

            {profileErrorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold">
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 disabled:text-slate-500 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                {/* Email (Read Only always) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full rounded-xl border border-slate-100 px-4 py-2.5 text-sm bg-slate-50 text-slate-400 font-bold select-none"
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Employee / Teacher ID</label>
                  <input
                    type="text"
                    disabled
                    value={teacherProfile.id || "NOT SET"}
                    className="w-full rounded-xl border border-slate-100 px-4 py-2.5 text-sm bg-slate-50 text-slate-400 font-bold select-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 disabled:text-slate-500 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                  <input
                    type="number"
                    required
                    disabled={!isEditing}
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 disabled:text-slate-500 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  {isEditing ? (
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Science">Information Science</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={teacherProfile.department || "NOT SET"}
                      className="w-full rounded-xl border border-slate-100 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 font-bold select-none"
                    />
                  )}
                </div>

                {/* Date of Birth (Always Read Only after registration) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="text"
                    disabled
                    value={teacherProfile.dob ? new Date(teacherProfile.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "NOT SET"}
                    className="w-full rounded-xl border border-slate-100 px-4 py-2.5 text-sm bg-slate-50 text-slate-400 font-bold select-none"
                  />
                </div>

                {/* Monthly Salary */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Monthly Salary (INR)</label>
                  <input
                    type="number"
                    required
                    disabled={!isEditing}
                    value={editSalary}
                    onChange={(e) => setEditSalary(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 disabled:text-slate-500 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm"
                  >
                    {profileLoading ? "Saving Changes..." : "Save Profile Details"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}