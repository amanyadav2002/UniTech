import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  Library,
  Laptop,
  FileText,
  Bell,
  ArrowRight,
  LayoutDashboard,
  CheckSquare,
  Plus,
  Trash2,
  Edit,
  Phone,
  User,
  LogOut,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Save,
  CheckCircle,
  Search,
  ChevronRight,
  Mail,
  Heart,
  CalendarDays,
  Hash,
} from "lucide-react";

export default function Students({ onOpenAuth }) {
  const { user, logout, updateUserProfile } = useAuth();
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState("overview");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // --- Profile Edit State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editBlood, setEditBlood] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editSemester, setEditSemester] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile details into inputs when edit state changes
  useEffect(() => {
    if (user?.profile) {
      setEditPhone(user.profile.phone || "");
      setEditAge(user.profile.age || "");
      setEditBlood(user.profile.blood || "");
      setEditYear(user.profile.year || "");
      setEditSemester(user.profile.semester || "");
    }
  }, [user, isEditing]);

  // --- Task Manager State (Persisted) ---
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (user?.id) {
      const savedTasks = localStorage.getItem(`unitech_tasks_${user.id}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Default tasks for new student
        const defaultTasks = [
          { id: "1", text: "Submit Physics Lab Report", completed: false },
          { id: "2", text: "Register for semester electives", completed: true },
          { id: "3", text: "Return 'Operating Systems' book to library", completed: false },
        ];
        setTasks(defaultTasks);
        localStorage.setItem(`unitech_tasks_${user.id}`, JSON.stringify(defaultTasks));
      }
    }
  }, [user]);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    if (user?.id) {
      localStorage.setItem(`unitech_tasks_${user.id}`, JSON.stringify(updatedTasks));
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

  // --- Attendance request details ---
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceSubject, setAttendanceSubject] = useState("");
  const [attendanceSuccess, setAttendanceSuccess] = useState("");

  const handleAttendanceRequest = (e) => {
    e.preventDefault();
    setAttendanceSuccess("Attendance correction query submitted to the registrar's office.");
    setTimeout(() => {
      setAttendanceSuccess("");
      setIsAttendanceModalOpen(false);
    }, 2500);
  };

  // --- GPA Calculator Simulator ---
  const [simulatedGrades, setSimulatedGrades] = useState({
    cn: "A+",
    os: "A",
    dbms: "O",
    la: "B+",
    pe: "A+",
  });

  const gradePoints = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    F: 0,
  };

  const simulatedCourses = [
    { key: "cn", name: "Computer Networks (CS-301)", credits: 4 },
    { key: "os", name: "Operating Systems (CS-302)", credits: 4 },
    { key: "dbms", name: "Database Management (CS-303)", credits: 4 },
    { key: "la", name: "Linear Algebra (MA-202)", credits: 3 },
    { key: "pe", name: "Professional Ethics (HU-201)", credits: 2 },
  ];

  const calculateSimulatedGpa = () => {
    let totalCredits = 0;
    let weightedPoints = 0;
    simulatedCourses.forEach((c) => {
      totalCredits += c.credits;
      weightedPoints += gradePoints[simulatedGrades[c.key]] * c.credits;
    });
    return (weightedPoints / totalCredits).toFixed(2);
  };

  // --- Notice Board filtering ---
  const [noticeSearch, setNoticeSearch] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("all");
  const [selectedNotice, setSelectedNotice] = useState(null);

  const noticesList = [
    {
      id: 1,
      title: "Mid-Term Examination Timetable Released",
      date: "2026-07-14",
      category: "exams",
      content: "The mid-term examinations for the 6th semester are scheduled to start from August 3rd, 2026. The detailed subject-wise timetable is uploaded on the official university examination branch website. Students must fetch their hall tickets before July 30th.",
      important: true,
    },
    {
      id: 2,
      title: "Annual Hackfest Registration Deadline Extended",
      date: "2026-07-12",
      category: "events",
      content: "Excellent news for innovators! Registration for the UniTech Annual Hackfest has been extended until July 22nd. Assemble teams of 2 to 4 members. Prizes worth $10,000 up for grabs. Mentorship from global tech industry leaders will be provided.",
      important: false,
    },
    {
      id: 3,
      title: "New Digital Library Credentials Emailed",
      date: "2026-07-10",
      category: "academic",
      content: "We have upgraded our e-resources portal subscriptions to IEEE, Springer, and ACM digital library assets. All students have been sent automated access credentials on their official student emails (@student.unitech.edu).",
      important: false,
    },
    {
      id: 4,
      title: "Declaration of Re-evaluation Results",
      date: "2026-07-08",
      category: "exams",
      content: "Re-evaluation results for the 5th semester examinations held in Dec 2025/Jan 2026 are declared. Check the student dashboard database or view the physical list posted on the department lobby notices boards.",
      important: true,
    },
  ];

  const filteredNotices = noticesList.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || 
                          n.content.toLowerCase().includes(noticeSearch.toLowerCase());
    const matchesCategory = noticeCategory === "all" || n.category === noticeCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Mock Data ---
  const stats = [
    { title: "Total Students", value: "5,240+", icon: <Users size={36} /> },
    { title: "Departments", value: "12", icon: <GraduationCap size={36} /> },
    { title: "Courses", value: "48+", icon: <BookOpen size={36} /> },
    { title: "Placement Rate", value: "95%", icon: <Award size={36} /> },
  ];

  const services = [
    {
      icon: <CalendarCheck size={34} />,
      title: "Attendance",
      description: "Monitor attendance records and maintain eligibility for examinations.",
    },
    {
      icon: <ClipboardList size={34} />,
      title: "Results",
      description: "Access semester results, internal marks, and academic performance.",
    },
    {
      icon: <BookOpen size={34} />,
      title: "Course Registration",
      description: "Register electives and manage semester course selections.",
    },
    {
      icon: <Library size={34} />,
      title: "Digital Library",
      description: "Explore books, journals, research papers, and online resources.",
    },
    {
      icon: <Laptop size={34} />,
      title: "E-Learning",
      description: "Attend online lectures, access notes, and submit assignments.",
    },
    {
      icon: <Bell size={34} />,
      title: "Notices",
      description: "Stay informed with university announcements and upcoming events.",
    },
  ];

  const coursesDetails = [
    { code: "CS-301", name: "Computer Networks", credits: 4, teacher: "Dr. Robert Vance", attended: 32, held: 35, attendance: 91 },
    { code: "CS-302", name: "Operating Systems", credits: 4, teacher: "Dr. Sarah Jenkins", attended: 29, held: 36, attendance: 80 },
    { code: "CS-303", name: "Database Management Systems", credits: 4, teacher: "Prof. Alan Turing", attended: 34, held: 34, attendance: 100 },
    { code: "MA-202", name: "Linear Algebra", credits: 3, teacher: "Dr. Katherine Johnson", attended: 21, held: 28, attendance: 75 },
    { code: "HU-201", name: "Professional Ethics", credits: 2, teacher: "Prof. Marcus Aurelius", attended: 11, held: 17, attendance: 64 },
  ];

  const gradesRecord = [
    { code: "CS-301", name: "Computer Networks", type: "Internal IA-1", marks: "45/50", status: "Pass" },
    { code: "CS-302", name: "Operating Systems", type: "Internal IA-1", marks: "38/50", status: "Pass" },
    { code: "CS-303", name: "Database Management Systems", type: "Internal IA-1", marks: "48/50", status: "Pass" },
    { code: "CS-301", name: "Computer Networks", type: "Mid-Term", marks: "88/100", status: "Pass" },
    { code: "CS-302", name: "Operating Systems", type: "Mid-Term", marks: "76/100", status: "Pass" },
    { code: "CS-303", name: "Database Management Systems", type: "Mid-Term", marks: "94/100", status: "Pass" },
  ];

  const scheduleTimeline = [
    { time: "09:00 AM - 10:30 AM", code: "CS-301", name: "Computer Networks", room: "Room 402, Block C", active: false, completed: true },
    { time: "11:00 AM - 12:30 PM", code: "CS-302", name: "Operating Systems", room: "Room 405, Block C", active: true, completed: false },
    { time: "02:00 PM - 03:30 PM", code: "MA-202", name: "Linear Algebra", room: "Room 201, Block A", active: false, completed: false },
  ];

  // Handle profile edit submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setProfileLoading(true);

    try {
      await updateUserProfile({
        phone: editPhone,
        age: Number(editAge),
        blood: editBlood,
        year: editYear,
        semester: editSemester,
      });
      setProfileSuccessMsg("Profile details updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(err.message || "Failed to save profile. Saving changes locally for this session.");
      
      // Fallback local update simulation if backend server update triggers an error
      if (user) {
        user.profile = {
          ...user.profile,
          phone: editPhone,
          age: Number(editAge),
          blood: editBlood,
          year: editYear,
          semester: editSemester,
        };
      }
      setProfileSuccessMsg("Profile updated (Session simulated fallback).");
      setIsEditing(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // --- RENDER 1: Deny access if logged in as Faculty ---
  if (user && user.role !== "student") {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          <AlertTriangle className="mx-auto text-amber-500 h-16 w-16 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            You are logged in as a <strong>{user.role}</strong>. Please sign in with a student account to view the student portal.
          </p>
          <div className="flex gap-4">
            <button
              onClick={logout}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition duration-200"
            >
              Sign Out
            </button>
            <a
              href="/"
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition duration-200 block text-center"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: Logged-in Student Dashboard Layout ---
  if (user && user.role === "student") {
    const studentProfile = user.profile || {};

    const filteredCourses = coursesDetails.filter((course) => {
      const query = globalSearchQuery.toLowerCase();
      return (
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.teacher.toLowerCase().includes(query)
      );
    });

    const filteredTasks = tasks.filter((task) =>
      task.text.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredSchedule = scheduleTimeline.filter((item) =>
      item.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );
    
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
        
        {/* Dashboard Sidebar Navigation */}
        <aside className="w-full lg:w-72 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
          
          {/* Dashboard User Head */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100">
              {user.name ? user.name.split(" ").map(w=>w[0]).join("").toUpperCase().substring(0, 2) : "ST"}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 leading-tight truncate max-w-[170px]">{user.name}</h4>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                USN: {studentProfile.usn || "NOT SET"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard size={20} />
              Portal Overview
            </button>

            <button
              onClick={() => setActiveTab("courses")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "courses"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen size={20} />
              Classes & Attendance
            </button>

            <button
              onClick={() => setActiveTab("grades")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "grades"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Award size={20} />
              Grades & GPA Simulator
            </button>

            <button
              onClick={() => setActiveTab("notices")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "notices"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
              Campus Notices
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <User size={20} />
              Student Profile
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50/60 hover:text-red-700 transition duration-200"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Dashboard Content Panel */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header Area */}
          <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "courses" && "Academics & Attendance"}
                {activeTab === "grades" && "Academics Performance"}
                {activeTab === "notices" && "Campus Notification Desk"}
                {activeTab === "profile" && "Student Core Profile"}
              </h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Academic year: <strong className="text-slate-700">{studentProfile.year || "3rd"} Year</strong> &bull; Semester: <strong className="text-slate-700">{studentProfile.semester || "6th"}</strong>
              </p>
            </div>
            
            {/* Header Right Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search dashboard data..."
                  value={globalSearchQuery}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                    setNoticeSearch(e.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-200/60 pl-10 pr-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold text-slate-800 shadow-sm placeholder:text-slate-400"
                />
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setActiveTab("notices")}
                className="relative p-3 bg-white rounded-2xl shadow-sm border border-slate-200/50 hover:bg-slate-50 transition text-slate-500 hover:text-indigo-600 flex items-center justify-center shrink-0"
                title="Campus Notices"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-4 ring-white">
                  {noticesList.length}
                </span>
              </button>

              {/* Quick Live stats badge */}
              <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl shadow-sm border border-slate-200/50 shrink-0">
                <CalendarDays className="text-indigo-600 h-5 w-5" />
                <div className="text-left">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Date & Time</p>
                  <p className="text-xs font-bold text-slate-700">
                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Notification bar for alerts */}
          {profileSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              {profileSuccessMsg}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Welcome Greeting Card */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden animate-fadeIn">
                {/* Decorative background shapes */}
                <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                <div className="absolute right-20 bottom-0 -mb-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-indigo-100">
                      Welcome Back
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      {getGreeting()}, {user.name}!
                    </h3>
                    <p className="text-indigo-100 text-sm md:text-base font-medium max-w-xl">
                      It is great to see you today. Here is a quick overview of your academic performance, schedule, and checklist items.
                    </p>
                  </div>
                  
                  {/* Quick stats in card */}
                  <div className="flex gap-4 md:gap-6 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-200">CGPA</p>
                      <p className="text-lg md:text-xl font-black text-white">3.82</p>
                    </div>
                    <div className="w-[1px] bg-white/20 self-stretch"></div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-200">Attendance</p>
                      <p className="text-lg md:text-xl font-black text-white">88.3%</p>
                    </div>
                    <div className="w-[1px] bg-white/20 self-stretch"></div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-200">Tasks left</p>
                      <p className="text-lg md:text-xl font-black text-white">
                        {tasks.filter(t => !t.completed).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Card 1: Attendance Progress */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500">Overall Attendance</p>
                    <h3 className="text-3xl font-extrabold text-slate-800">88.3%</h3>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      Eligible &bull; Excellent
                    </span>
                  </div>
                  
                  {/* Attendance Ring */}
                  <div className="relative h-16 w-16 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600"
                        strokeWidth="3.5"
                        strokeDasharray="88, 100"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                      88%
                    </div>
                  </div>
                </div>

                {/* Card 2: GPA */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500">Current GPA</p>
                    <h3 className="text-3xl font-extrabold text-slate-800">3.82 / 4.0</h3>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                      Grade A &bull; Top 5%
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <TrendingUp size={28} />
                  </div>
                </div>

                {/* Card 3: Semester Credit Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <p className="text-sm font-semibold text-slate-500 mb-2">Graduation Credits</p>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-3xl font-extrabold text-slate-800">74</h3>
                    <span className="text-xs text-slate-500 font-medium">Goal: 120 credits</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "61%" }}></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-2 inline-block">61% completed</span>
                </div>

                {/* Card 4: Subject count */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500">Registered Subjects</p>
                    <h3 className="text-3xl font-extrabold text-slate-800">5 Courses</h3>
                    <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                      17 Credit Hours
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                    <BookOpen size={28} />
                  </div>
                </div>

              </div>

              {/* Today's Schedule & Interactive To-Do List */}
              <div className="grid gap-8 lg:grid-cols-5">
                
                {/* Today's Schedule Timeline (3 columns) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-slate-800">Today's Class Schedule</h4>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Today
                    </span>
                  </div>

                  <div className="space-y-5 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {filteredSchedule.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                        No matching classes found.
                      </div>
                    ) : (
                      filteredSchedule.map((item, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          {/* Bullet symbol */}
                          <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                            item.active 
                              ? "bg-indigo-600 text-white ring-4 ring-indigo-50" 
                              : item.completed 
                                ? "bg-slate-200 text-slate-500" 
                                : "bg-white border-2 border-slate-200 text-slate-400"
                          }`}>
                            {item.completed ? (
                              <CheckCircle size={14} className="text-slate-500" />
                            ) : (
                              <Clock size={14} className={item.active ? "text-white" : "text-slate-400"} />
                            )}
                          </div>

                          {/* Schedule Content */}
                          <div className={`flex-1 rounded-2xl p-4 border transition duration-200 ${
                            item.active 
                              ? "bg-indigo-50/50 border-indigo-100 hover:border-indigo-200" 
                              : "bg-white border-slate-100 hover:border-slate-200"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {item.code}
                              </span>
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                <Clock size={12} />
                                {item.time}
                              </span>
                            </div>
                            
                            <h5 className="font-bold text-slate-800 mt-2 text-base">{item.name}</h5>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <MapPin size={12} />
                                {item.room}
                              </span>
                              {item.active && (
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100 px-2 py-0.5 rounded animate-pulse">
                                  Live Now
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* To-Do persistent list (2 columns) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Academic Checklists</h4>
                  <p className="text-xs text-slate-400 font-medium mb-5">Manage and organize your homework, lab files, and book returns.</p>
                  
                  {/* Task list container */}
                  <div className="flex-1 space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <CheckSquare size={36} className="mx-auto text-slate-300" />
                        <p className="text-sm font-medium">All caught up! No tasks left.</p>
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                        No matching checklist items found.
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                            task.completed
                              ? "bg-slate-50/50 border-slate-100 text-slate-400 line-through"
                              : "bg-white border-slate-200/80 text-slate-700 shadow-sm hover:border-slate-300"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                            />
                            <span className="text-sm font-semibold select-none break-all pr-2">
                              {task.text}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add task form */}
                  <form onSubmit={handleAddTask} className="mt-5 flex gap-2 pt-4 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Add homework or goal..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.96] transition shrink-0 shadow-sm shadow-indigo-600/10"
                    >
                      <Plus size={18} />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CLASSES & ATTENDANCE */}
          {activeTab === "courses" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Informative alert banner */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
                <AlertTriangle className="text-indigo-600 h-6 w-6 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">Attendance Policies</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    The university requires a minimum of <strong className="text-slate-800">75% attendance</strong> per registered subject to remain eligible for term-end assessments. Subjects with attendance below 75% are colored <span className="text-red-500 font-semibold">red</span>. Contact your academic advisor or submit a correction query below if there is a discrepancy.
                  </p>
                  <button
                    onClick={() => setIsAttendanceModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Raise Attendance Discrepancy Query
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Course attendance grid */}
              {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200/50 text-center text-slate-400 font-semibold text-sm">
                  No courses match your search.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course, index) => {
                    // Determine status color
                    let statusColor = "bg-emerald-500";
                    let textColor = "text-emerald-700";
                    let bgColor = "bg-emerald-50";
                    let borderClass = "border-emerald-100";
                    let textMsg = "Attendance Safe";

                    if (course.attendance < 75) {
                      statusColor = "bg-rose-500";
                      textColor = "text-rose-700";
                      bgColor = "bg-rose-50";
                      borderClass = "border-rose-100";
                      textMsg = "Critically Low - Attendance Warning";
                    } else if (course.attendance >= 75 && course.attendance <= 82) {
                      statusColor = "bg-amber-500";
                      textColor = "text-amber-700";
                      bgColor = "bg-amber-50";
                      borderClass = "border-amber-100";
                      textMsg = "Close to Limit - Warning";
                    }

                    return (
                      <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 flex flex-col justify-between">
                        <div>
                          {/* Course code & Credits */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                              {course.code}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              {course.credits} Credits
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-extrabold text-slate-800 text-lg mb-1 leading-snug">{course.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold mb-4">Instructor: {course.teacher}</p>

                          {/* Progress display */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm font-semibold text-slate-500">Attendance Ratio</span>
                              <span className="text-sm font-extrabold text-slate-700">
                                {course.attended} / {course.held} lectures
                              </span>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${statusColor}`}
                                style={{ width: `${course.attendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Status pill & Actions */}
                        <div className={`mt-4 rounded-xl p-3 border ${bgColor} ${borderClass} flex items-center justify-between`}>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Eligibility Status</p>
                            <p className={`text-xs font-bold ${textColor}`}>{textMsg}</p>
                          </div>
                          <span className={`text-lg font-extrabold ${textColor}`}>{course.attendance}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: GRADES & GPA SIMULATOR */}
          {activeTab === "grades" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header metrics */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">Cumulative GPA (CGPA)</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">3.82 / 4.00</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">Class Rank: 14 / 280 students</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">Previous Semester GPA</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">3.91</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Semester 5 &bull; Outstanding Performance</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">Total Earned Credits</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">74 Units</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Satisfies Year 3 milestones</p>
                </div>
              </div>

              {/* GPA Simulator Panel & Grades breakdown */}
              <div className="grid gap-8 lg:grid-cols-5">
                
                {/* GPA Simulator (2 columns) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-indigo-600" size={24} />
                    <h4 className="text-lg font-bold text-slate-800">GPA Target Simulator</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-6">
                    Adjust the simulated letter grades below to calculate what GPA you can secure this semester.
                  </p>

                  <div className="space-y-4">
                    {simulatedCourses.map((course) => (
                      <div key={course.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex-1 pr-3">
                          <p className="text-sm font-bold text-slate-700 leading-snug">{course.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Credits: {course.credits}</p>
                        </div>
                        <select
                          value={simulatedGrades[course.key]}
                          onChange={(e) => setSimulatedGrades({
                            ...simulatedGrades,
                            [course.key]: e.target.value
                          })}
                          className="rounded-lg border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                          <option value="O">O (Outstanding)</option>
                          <option value="A+">A+ (Excellent)</option>
                          <option value="A">A (Very Good)</option>
                          <option value="B+">B+ (Good)</option>
                          <option value="B">B (Above Average)</option>
                          <option value="C">C (Average)</option>
                          <option value="F">F (Fail)</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Simulator Result */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-extrabold text-slate-400">Simulated GPA</p>
                      <p className="text-xs text-slate-400 font-semibold">Based on target grades above</p>
                    </div>
                    <span className="text-3xl font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl">
                      {calculateSimulatedGpa()}
                    </span>
                  </div>
                </div>

                {/* Internal marks / Grade history (3 columns) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3">
                  <h4 className="text-lg font-bold text-slate-800 mb-5">Latest Examination Marks</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 pl-2">Subject Code</th>
                          <th className="pb-3">Subject Name</th>
                          <th className="pb-3">Exam Term</th>
                          <th className="pb-3">Marks Obtained</th>
                          <th className="pb-3 pr-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-100">
                        {gradesRecord.map((record, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 pl-2">
                              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-bold">
                                {record.code}
                              </span>
                            </td>
                            <td className="py-3.5">{record.name}</td>
                            <td className="py-3.5 text-slate-500 font-medium">{record.type}</td>
                            <td className="py-3.5 text-slate-800 font-extrabold">{record.marks}</td>
                            <td className="py-3.5 pr-2">
                              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block font-bold">
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: CAMPUS NOTICES */}
          {activeTab === "notices" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Notice Controls */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                
                {/* Search Notice */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-2.5 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search notice titles..."
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
                  />
                </div>

                {/* Filter tab */}
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
                  {["all", "academic", "exams", "events"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNoticeCategory(cat)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide transition ${
                        noticeCategory === cat
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              </div>

              {/* Notices List */}
              <div className="space-y-4">
                {filteredNotices.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200/50 text-center text-slate-400">
                    <Bell size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-base font-bold">No announcements found matching the criteria.</p>
                  </div>
                ) : (
                  filteredNotices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        notice.important ? "border-l-4 border-l-red-500 border-slate-200/50" : "border-slate-200/50"
                      }`}
                      onClick={() => setSelectedNotice(notice)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          notice.category === "exams" 
                            ? "bg-rose-50 text-rose-600 border border-rose-100" 
                            : notice.category === "events" 
                              ? "bg-amber-50 text-amber-600 border border-amber-100" 
                              : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        }`}>
                          {notice.category}
                        </span>

                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar size={12} />
                          {notice.date}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-800 text-lg mb-2 flex items-center gap-2">
                        {notice.title}
                        {notice.important && (
                          <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase tracking-widest shrink-0 animate-pulse">
                            Urgent
                          </span>
                        )}
                      </h4>
                      
                      <p className="text-sm text-slate-500 font-semibold leading-relaxed line-clamp-2">
                        {notice.content}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end text-xs font-bold text-indigo-600 group items-center gap-0.5">
                        Read Announcement Detail
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 5: PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Validation alert banner */}
              {profileErrorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                  {profileErrorMsg}
                </div>
              )}

              {/* Profile Card Container */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                
                {/* Visual Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 h-28 relative">
                  <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-2xl bg-indigo-50 border-4 border-white shadow-md flex items-center justify-center text-indigo-600 font-extrabold text-2xl">
                    {user.name ? user.name[0].toUpperCase() : "S"}
                  </div>
                </div>

                {/* Sub details block */}
                <div className="pt-14 px-6 pb-6 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">{user.name}</h3>
                      <p className="text-sm font-medium text-slate-400">Registered Student Email: {user.email}</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white rounded-xl text-sm font-bold shadow-sm transition active:scale-[0.98]"
                      >
                        <Edit size={16} />
                        Modify Profile Details
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Fields Grid */}
                <form onSubmit={handleSaveProfile} className="p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Unique ID */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Hash size={12} />
                        Student Database ID
                      </label>
                      <p className="text-sm font-extrabold text-slate-800">{studentProfile.id || "N/A"}</p>
                    </div>

                    {/* USN */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Award size={12} />
                        University USN Code
                      </label>
                      <p className="text-sm font-extrabold text-indigo-600 tracking-wide uppercase">{studentProfile.usn || "N/A"}</p>
                    </div>

                    {/* DOB */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Calendar size={12} />
                        Date of Birth
                      </label>
                      <p className="text-sm font-extrabold text-slate-800">
                        {studentProfile.dob ? new Date(studentProfile.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                      </p>
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <User size={12} />
                        Age (Years)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          required
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-slate-800">{studentProfile.age || "N/A"}</p>
                      )}
                    </div>

                    {/* Blood Group */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Heart size={12} className="text-rose-500" />
                        Blood Group
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editBlood}
                          onChange={(e) => setEditBlood(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          required
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-slate-800">{studentProfile.blood || "N/A"}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Phone size={12} />
                        Emergency Mobile Contact
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          required
                        />
                      ) : (
                        <p className="text-sm font-extrabold text-slate-800">{studentProfile.phone || "N/A"}</p>
                      )}
                    </div>

                    {/* Year */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <GraduationCap size={12} />
                        Academic Class Year
                      </label>
                      {isEditing ? (
                        <select
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                      ) : (
                        <p className="text-sm font-extrabold text-slate-800">{studentProfile.year || "N/A"}</p>
                      )}
                    </div>

                    {/* Semester */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <BookOpen size={12} />
                        Registered Semester
                      </label>
                      {isEditing ? (
                        <select
                          value={editSemester}
                          onChange={(e) => setEditSemester(e.target.value)}
                          className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                          <option value="1st">1st Semester</option>
                          <option value="2nd">2nd Semester</option>
                          <option value="3rd">3rd Semester</option>
                          <option value="4th">4th Semester</option>
                          <option value="5th">5th Semester</option>
                          <option value="6th">6th Semester</option>
                          <option value="7th">7th Semester</option>
                          <option value="8th">8th Semester</option>
                        </select>
                      ) : (
                        <p className="text-sm font-extrabold text-slate-800">{studentProfile.semester || "N/A"}</p>
                      )}
                    </div>

                    {/* Institution official Mail */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Mail size={12} />
                        Registered Email
                      </label>
                      <p className="text-sm font-extrabold text-slate-800 truncate">{studentProfile.mail || "N/A"}</p>
                    </div>

                  </div>

                  {/* Edit Actions buttons */}
                  {isEditing && (
                    <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-50"
                      >
                        <Save size={16} />
                        {profileLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </form>

              </div>

            </div>
          )}

        </main>

        {/* --- MODAL 1: Notice Detail overlay --- */}
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {selectedNotice.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-2">{selectedNotice.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedNotice.content}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-50 font-semibold">
                  <span>Issued Date: {selectedNotice.date}</span>
                  <span>Office of Academic Registry</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 2: Attendance correction query --- */}
        {isAttendanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-slate-800">Attendance Discrepancy Form</h3>
                <button 
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAttendanceRequest} className="p-6 space-y-4">
                {attendanceSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-emerald-600" />
                    {attendanceSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Subject Name</label>
                  <select
                    value={attendanceSubject}
                    onChange={(e) => setAttendanceSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  >
                    <option value="">Choose Subject...</option>
                    {coursesDetails.map((c, i) => (
                      <option key={i} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Details of Missing Lectures</label>
                  <textarea
                    rows={3}
                    placeholder="E.g., I was present on July 5th and 7th (2 classes), but marked absent..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold px-4 py-2 shadow-sm transition active:scale-[0.98]"
                  >
                    Submit Query
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- RENDER 3: General Guest student landing page ---
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">

          <GraduationCap className="mx-auto mb-6 h-16 w-16" />

          <h1 className="text-5xl font-bold">
            Student Portal
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100">
            Access academic resources, attendance, examination results,
            course registration, digital learning, and university services
            from one place.
          </p>

        </div>
      </section>

      {/* Statistics */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-8 text-center shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-4 flex justify-center text-blue-600">
                {item.icon}
              </div>

              <h2 className="text-4xl font-bold text-slate-800">
                {item.value}
              </h2>

              <p className="mt-2 text-gray-600">
                {item.title}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* Student Services */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-6">

          <h2 className="mb-12 text-center text-4xl font-bold">
            Student Services
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border bg-slate-50 p-8 transition hover:border-blue-600 hover:shadow-xl"
              >
                <div className="mb-5 text-blue-600">
                  {service.icon}
                </div>

                <h3 className="mb-3 text-2xl font-semibold">
                  {service.title}
                </h3>

                <p className="text-gray-600 leading-7">
                  {service.description}
                </p>

                <button 
                  onClick={() => onOpenAuth("login", "student")}
                  className="mt-6 flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
                >
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* Student Life */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h2 className="mb-12 text-center text-4xl font-bold">
          Student Life
        </h2>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <FileText className="mb-4 text-blue-600" size={40} />
            <h3 className="text-2xl font-bold">
              Clubs & Activities
            </h3>
            <p className="mt-4 text-gray-600">
              Participate in technical clubs, cultural events,
              sports, and innovation programs.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <Award className="mb-4 text-blue-600" size={40} />
            <h3 className="text-2xl font-bold">
              Scholarships
            </h3>
            <p className="mt-4 text-gray-600">
              Merit-based and need-based scholarship opportunities
              for deserving students.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <Users className="mb-4 text-blue-600" size={40} />
            <h3 className="text-2xl font-bold">
              Career Support
            </h3>
            <p className="mt-4 text-gray-600">
              Internship assistance, placement training,
              resume reviews, and mock interviews.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="bg-blue-700 py-20 text-center text-white">

        <h2 className="text-4xl font-bold">
          Ready to Begin Your Academic Journey?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
          Explore student resources, manage academics, and stay connected
          with everything happening at UniTech.
        </p>

        <button
          onClick={() => onOpenAuth("login", "student")}
          className="mt-8 rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 transition hover:bg-slate-100 duration-200 active:scale-[0.98]"
        >
          Student Login
        </button>

      </section>

    </div>
  );
}