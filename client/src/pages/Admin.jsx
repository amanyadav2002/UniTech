import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, Briefcase, Shield, BookOpen, Building, Calendar,
  Clock, CheckSquare, FileText, BookMarked, MessageSquare, AlertTriangle, BarChart3,
  Download, Bell, Settings, LogOut, ChevronDown, ChevronRight, ChevronLeft, Menu, X, Plus, Edit,
  Trash2, UserCheck, UserX, Search, ShieldAlert, Sparkles, Filter, Check, RefreshCw,
  Info, Eye, HelpCircle, FileSpreadsheet, Lock, ArrowLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

// Helper fetcher
const apiFetch = async (path, options = {}) => {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`http://localhost:5000/api/admin${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }
  return res.json();
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar controls
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState({
    userManagement: true,
    academics: true,
  });

  // Global loading/error
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Restructured Notice States
  const [noticeTargetAudience, setNoticeTargetAudience] = useState("everyone");
  const [noticeSelectedDepts, setNoticeSelectedDepts] = useState([]);
  const [noticeSelectedSems, setNoticeSelectedSems] = useState([]);
  const [noticeVisibleTo, setNoticeVisibleTo] = useState("Both");

  // Stats & Charts data
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Collections lists
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [securityStaff, setSecurityStaff] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState({ attendanceLogs: [], studentList: [], defaulters: [] });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [settingsData, setSettingsData] = useState({});

  // Pagination & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourseSemFilter, setSelectedCourseSemFilter] = useState("All");
  const [selectedCourseDeptFilter, setSelectedCourseDeptFilter] = useState("All");

  // CRUD Modals
  const [crudModal, setCrudModal] = useState(null); // { type: 'student'|'faculty'|'security'|'admin'|'dept'|'course'|'subject'|'notice'|'event'|'visitor'|'material'|'assignment', mode: 'add'|'edit', data: {} }
  const [resetPassModal, setResetPassModal] = useState(null); // { userId, name }

  // Custom Event Date states
  const [evDay, setEvDay] = useState("");
  const [evMonth, setEvMonth] = useState("");
  const [evYear, setEvYear] = useState("");
  const [isEvDayOpen, setIsEvDayOpen] = useState(false);
  const [isEvMonthOpen, setIsEvMonthOpen] = useState(false);
  const [isEvYearOpen, setIsEvYearOpen] = useState(false);
  const [evDateFormatted, setEvDateFormatted] = useState("");
  const [evDateRaw, setEvDateRaw] = useState("");
  const calendarInputRef = useRef(null);

  const [calViewDate, setCalViewDate] = useState(new Date());

  const evYearsList = ["2026", "2027", "2028", "2029", "2030"];

  const getEvMaxDays = (monthNumStr, yearString) => {
    const monthNum = parseInt(monthNumStr, 10);
    const yrNum = parseInt(yearString, 10);
    if (!monthNum || isNaN(monthNum)) return 31;
    if ([4, 6, 9, 11].includes(monthNum)) return 30;
    if (monthNum === 2) {
      if (!yrNum || isNaN(yrNum)) return 28;
      const isLeap = (yrNum % 4 === 0 && yrNum % 100 !== 0) || (yrNum % 400 === 0);
      return isLeap ? 29 : 28;
    }
    return 31;
  };

  const handleEvDayChange = (val) => {
    setIsEvDayOpen(true);
    if (val === "") {
      setEvDay("");
      return;
    }
    const clean = val.replace(/\D/g, "");
    const maxDays = getEvMaxDays(evMonth, evYear);
    if (clean === "" || parseInt(clean, 10) <= maxDays) {
      setEvDay(clean);
    }
  };

  const handleEvMonthChange = (val) => {
    setIsEvMonthOpen(true);
    if (val === "") {
      setEvMonth("");
      return;
    }
    const clean = val.replace(/\D/g, "");
    if (clean === "" || parseInt(clean, 10) <= 12) {
      setEvMonth(clean);
    }
  };

  const handleEvYearChange = (val) => {
    setIsEvYearOpen(true);
    const clean = val.replace(/\D/g, "");
    setEvYear(clean);
  };

  const handleEvDayBlur = () => {
    setTimeout(() => {
      setIsEvDayOpen(false);
      if (evDay) {
        const dayNum = parseInt(evDay, 10);
        if (dayNum < 1) {
          setEvDay("");
        } else {
          setEvDay(dayNum.toString().padStart(2, "0"));
        }
      }
    }, 200);
  };

  const handleEvMonthBlur = () => {
    setTimeout(() => {
      setIsEvMonthOpen(false);
      if (evMonth) {
        const mNum = parseInt(evMonth, 10);
        if (mNum < 1) {
          setEvMonth("");
        } else {
          const formattedMonth = mNum.toString().padStart(2, "0");
          setEvMonth(formattedMonth);
          const maxDays = getEvMaxDays(formattedMonth, evYear);
          if (evDay && parseInt(evDay, 10) > maxDays) {
            setEvDay(maxDays.toString().padStart(2, "0"));
          }
        }
      }
    }, 200);
  };

  const handleEvYearBlur = () => {
    setTimeout(() => {
      setIsEvYearOpen(false);
      if (evYear) {
        const yrNum = parseInt(evYear, 10);
        if (yrNum < 1900 || yrNum > 2100) {
          const defaultYr = new Date().getFullYear().toString();
          setEvYear(defaultYr);
          if (parseInt(evMonth, 10) === 2) {
            const maxDays = getEvMaxDays("02", defaultYr);
            if (evDay && parseInt(evDay, 10) > maxDays) {
              setEvDay(maxDays.toString().padStart(2, "0"));
            }
          }
        } else {
          if (parseInt(evMonth, 10) === 2) {
            const maxDays = getEvMaxDays("02", yrNum.toString());
            if (evDay && parseInt(evDay, 10) > maxDays) {
              setEvDay(maxDays.toString().padStart(2, "0"));
            }
          }
        }
      }
    }, 200);
  };

  useEffect(() => {
    if (evDay && evMonth && evYear) {
      const formattedDay = evDay.padStart(2, "0");
      const formattedMonth = evMonth.padStart(2, "0");
      setEvDateFormatted(`${formattedDay}-${formattedMonth}-${evYear}`);
      setEvDateRaw(`${evYear}-${formattedMonth}-${formattedDay}`);
    } else {
      setEvDateFormatted("");
      setEvDateRaw("");
    }
  }, [evDay, evMonth, evYear]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle sub-menus
  const toggleSubMenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Fetch Dashboard data
  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await apiFetch("/stats");
      setStats(data.stats);
      setCharts(data.charts);
      setTimeline(data.timeline);
      setRecentNotifications(data.recentNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch lists based on section
  const fetchSectionData = async (silent = false) => {
    try {
      setError(null);
      if (activeSection === "dashboard") {
        await fetchDashboardData(silent);
      } else if (activeSection === "students") {
        const data = await apiFetch(`/students?search=${searchTerm}&department=${deptFilter}&semester=${semFilter}&page=${currentPage}`);
        setStudents(data.students);
        setTotalPages(data.totalPages);
      } else if (activeSection === "faculty") {
        const data = await apiFetch(`/faculty?search=${searchTerm}&department=${deptFilter}&page=${currentPage}`);
        setFaculty(data.faculty);
        setTotalPages(data.totalPages);
      } else if (activeSection === "security") {
        const data = await apiFetch(`/security?search=${searchTerm}`);
        setSecurityStaff(data.securityStaff);
      } else if (activeSection === "admins") {
        const data = await apiFetch("/admins");
        setAdminsList(data.admins);
      } else if (activeSection === "departments") {
        const data = await apiFetch("/departments");
        setDepartments(data.departments);
      } else if (activeSection === "courses") {
        const coursesData = await apiFetch("/courses");
        setCourses(coursesData.courses);
        const semData = await apiFetch("/semesters");
        setSemesters(semData.semesters);
        const deptData = await apiFetch("/departments");
        setDepartments(deptData.departments);
      } else if (activeSection === "subjects") {
        const data = await apiFetch("/subjects");
        setSubjects(data.subjects);
      } else if (activeSection === "semester") {
        const data = await apiFetch("/semesters");
        setSemesters(data.semesters);
      } else if (activeSection === "timetable") {
        const data = await apiFetch("/classes");
        setClasses(data.classes);
      } else if (activeSection === "attendance") {
        const data = await apiFetch("/attendance/report");
        setAttendanceReport(data);
      } else if (activeSection === "leaves") {
        const data = await apiFetch("/leaves");
        setLeaveRequests(data.requests);
      } else if (activeSection === "notifications") {
        const data = await apiFetch("/notices");
        setNotices(data.notices);
      } else if (activeSection === "events" || activeSection === "calendar") {
        const data = await apiFetch("/events");
        setEvents(data.events);
      } else if (activeSection === "monitoring") {
        const data = await apiFetch("/security-logs");
        setVisitorLogs(data.logs);
      } else if (activeSection === "reports") {
        const data = await apiFetch("/reports");
        setReportsList(data.reports);
      } else if (activeSection === "settings") {
        const data = await apiFetch("/settings");
        setSettingsData(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSectionData(true);
      showToast("Dashboard data refreshed!");
    } catch (err) {
      showToast("Refresh failed: " + err.message, "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCardClick = (sectionId) => {
    if (!sectionId) return;
    setActiveSection(sectionId);
    // Auto-expand menus based on target section
    if (["students", "faculty", "security", "admins"].includes(sectionId)) {
      setExpandedMenus(prev => ({ ...prev, userManagement: true }));
    } else if (["departments", "courses", "timetable", "semester"].includes(sectionId)) {
      setExpandedMenus(prev => ({ ...prev, academics: true }));
    }
  };

  // Reset notice states on modal toggle
  useEffect(() => {
    if (crudModal?.type === "notice") {
      setNoticeTargetAudience("everyone");
      setNoticeSelectedDepts([]);
      setNoticeSelectedSems([]);
      setNoticeVisibleTo("Both");
    }
    if (crudModal?.type === "event" || crudModal?.type === "calendar_event") {
      const today = new Date();
      setEvDay(today.getDate().toString().padStart(2, "0"));
      setEvMonth((today.getMonth() + 1).toString().padStart(2, "0"));
      setEvYear(today.getFullYear().toString());
      setIsEvDayOpen(false);
      setIsEvMonthOpen(false);
      setIsEvYearOpen(false);
    }
  }, [crudModal]);

  // Load lookup values (departments, semesters) once on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const deptRes = await apiFetch("/departments");
        setDepartments(deptRes.departments || []);
        const semRes = await apiFetch("/semesters");
        setSemesters(semRes.semesters || []);
      } catch (err) {
        console.error("Failed to load lookups:", err);
      }
    };
    loadLookups();
  }, []);

  useEffect(() => {
    fetchSectionData();
  }, [activeSection, currentPage, searchTerm, deptFilter, semFilter]);

  const getApiPath = (type) => {
    switch (type) {
      case "student": return "/students";
      case "faculty": return "/faculty";
      case "security": return "/security";
      case "admin": return "/admins";
      case "department": return "/departments";
      case "course": return "/courses";
      case "subject": return "/subjects";
      case "semester": return "/semesters";
      case "class": return "/classes";
      case "notice": return "/notices";
      case "event":
      case "calendar_event": return "/events";
      case "visitor": return "/security-logs";
      case "report": return "/reports";
      default: return `/${type}s`;
    }
  };

  // Handle CRUD Save (Add/Edit)
  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    // Format nested arrays for fields like Course (branches, semesters)
    if (crudModal.type === "course") {
      body.branches = crudModal.mode === "edit" ? (crudModal.data.branches || []) : [];
      body.semesters = body.semesters ? body.semesters.split(",").map(s => s.trim()) : [];
    }

    if (crudModal.type === "notice") {
      body.targetAudience = noticeTargetAudience;
      body.targetDepartments = noticeTargetAudience === "everyone" ? ["All"] : (noticeTargetAudience === "semesters" ? [] : noticeSelectedDepts);
      body.targetSemesters = noticeTargetAudience === "everyone" ? ["All"] : (noticeTargetAudience === "departments" ? [] : noticeSelectedSems);
      body.visibleTo = noticeVisibleTo;
    }

    try {
      const apiPath = getApiPath(crudModal.type);
      let path = apiPath;
      let method = "POST";

      if (crudModal.mode === "edit") {
        path = `${apiPath}/${crudModal.data._id}`;
        method = "PUT";
      }

      await apiFetch(path, {
        method,
        body: JSON.stringify(body),
      });

      showToast(`Record ${crudModal.mode === "add" ? "created" : "updated"} successfully!`);
      setCrudModal(null);
      fetchSectionData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const apiPath = getApiPath(type);
      await apiFetch(`${apiPath}/${id}`, { method: "DELETE" });
      showToast("Record deleted successfully!");
      fetchSectionData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Handle Password Reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { newPassword } = Object.fromEntries(fd.entries());
    
    try {
      await apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify({ userId: resetPassModal.userId, newPassword }),
      });
      showToast("Password reset successfully!");
      setResetPassModal(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Leave approval
  const handleReviewLeave = async (id, status) => {
    const comments = window.prompt(`Provide comments for this ${status.toLowerCase()} decision:`);
    if (comments === null) return; // cancelled
    try {
      await apiFetch(`/leaves/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, comments })
      });
      showToast(`Leave request ${status.toLowerCase()} successfully`);
      fetchSectionData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Checkout visitor
  const handleVisitorCheckout = async (id) => {
    try {
      await apiFetch(`/security-logs/${id}/checkout`, { method: "PUT" });
      showToast("Visitor checked out successfully");
      fetchSectionData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Generate Report
  const handleGenerateReportSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      await apiFetch("/reports/generate", {
        method: "POST",
        body: JSON.stringify(body)
      });
      showToast("Report generated successfully!");
      setCrudModal(null);
      fetchSectionData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Broadcast announcement
  const handleSendNotification = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      await apiFetch("/notifications/send", {
        method: "POST",
        body: JSON.stringify(body)
      });
      showToast("Announcement broadcasted successfully!");
      e.target.reset();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updates = {
      collegeName: fd.get("collegeName"),
      academicYear: fd.get("academicYear"),
      semesterDates: {
        start: fd.get("semStart"),
        end: fd.get("semEnd")
      }
    };
    try {
      await apiFetch("/settings", {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      showToast("Settings updated successfully!");
      fetchSectionData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Trigger Mock Report Download
  const handleDownloadFile = (title, format) => {
    showToast(`Downloading ${title} in ${format} format...`);
    // Create and trigger actual local CSV mock file download for demonstration
    const headers = "Data,Record,Details,Status\nMock Line,University System,Verified,Success";
    const blob = new Blob([headers], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${title.replace(/\s+/g, "_")}.${format === "Excel" ? "csv" : "pdf"}`);
    a.click();
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border font-semibold ${
              toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLLAPSIBLE SIDEBAR */}
      <aside className={`bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}>
        {/* Header Branding */}
        <div className={`p-6 border-b border-slate-800 flex items-center ${
          sidebarOpen ? "justify-between" : "justify-center"
        }`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                  U
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none tracking-tight">UniTech</span>
                  <span className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold mt-0.5">Admin Portal</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg hidden lg:block"
                title="Collapse Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg flex items-center justify-center transition-all duration-200"
              title="Expand Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {/* Dashboard */}
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeSection === "dashboard"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {/* Collapsible User Management */}
          <div>
            <button
              onClick={() => sidebarOpen ? toggleSubMenu("userManagement") : setActiveSection("students")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-all`}
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                {sidebarOpen && <span>User Management</span>}
              </div>
              {sidebarOpen && (expandedMenus.userManagement ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            </button>
            {sidebarOpen && expandedMenus.userManagement && (
              <div className="pl-8 pr-2 py-1 space-y-1 bg-slate-950/40 rounded-lg">
                {[
                  { id: "students", label: "Students", icon: <GraduationCap className="h-4 w-4" /> },
                  { id: "faculty", label: "Faculty", icon: <Briefcase className="h-4 w-4" /> },
                  { id: "security", label: "Security Staff", icon: <Shield className="h-4 w-4" /> },
                  { id: "admins", label: "Admins", icon: <ShieldAlert className="h-4 w-4" /> },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSection(sub.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === sub.id
                        ? "text-blue-400 bg-blue-500/5 font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                    }`}
                  >
                    {sub.icon}
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Academics */}
          <div>
            <button
              onClick={() => sidebarOpen ? toggleSubMenu("academics") : setActiveSection("departments")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-all`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                {sidebarOpen && <span>Academics</span>}
              </div>
              {sidebarOpen && (expandedMenus.academics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            </button>
            {sidebarOpen && expandedMenus.academics && (
              <div className="pl-8 pr-2 py-1 space-y-1 bg-slate-950/40 rounded-lg">
                {[
                  { id: "departments", label: "Departments", icon: <Building className="h-4 w-4" /> },
                  { id: "courses", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
                  { id: "timetable", label: "Timetable", icon: <Clock className="h-4 w-4" /> },
                  { id: "semester", label: "Semester", icon: <Calendar className="h-4 w-4" /> },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSection(sub.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === sub.id
                        ? "text-blue-400 bg-blue-500/5 font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                    }`}
                  >
                    {sub.icon}
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Simple items */}
          {[
            { id: "attendance", label: "Attendance", icon: <CheckSquare className="h-5 w-5" /> },
            { id: "leaves", label: "Leave Requests", icon: <MessageSquare className="h-5 w-5" /> },
            { id: "events", label: "Event Management", icon: <Calendar className="h-5 w-5" /> },
            { id: "calendar", label: "Event Calendar", icon: <Calendar className="h-5 w-5" /> },
            { id: "monitoring", label: "Security Monitoring", icon: <ShieldAlert className="h-5 w-5" /> },
            { id: "reports", label: "Reports", icon: <FileText className="h-5 w-5" /> },
            { id: "notifications", label: "Notice Broadcast", icon: <Bell className="h-5 w-5" /> },
            { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeSection === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize leading-none">
              {activeSection === "calendar" ? "Event Calendar" : activeSection.replace(/([A-Z])/g, " $1")}
            </h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full font-semibold">
              ACADEMIC YEAR: 2026-27
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all duration-300 flex items-center justify-center group relative shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`h-[18px] w-[18px] text-slate-400 group-hover:text-white transition-colors ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                A
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-white leading-tight">Admin System</span>
                <span className="text-xs text-slate-400">admin@unitech.edu</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Panels container */}
        <div className="flex-1 p-8 overflow-y-auto max-w-[1600px] w-full mx-auto space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <span className="font-bold">Error loading section: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && activeSection === "dashboard" ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400 font-semibold animate-pulse">Loading analytics engines...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {/* -------------------- 1. DASHBOARD PANEL -------------------- */}
                {activeSection === "dashboard" && (
                  <div className="space-y-8">
                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                      {[
                        { title: "Total Students", value: stats.totalStudents, icon: <GraduationCap className="h-6 w-6 text-blue-400" />, desc: "Registered undergraduates", sectionId: "students" },
                        { title: "Total Faculty", value: stats.totalFaculty, icon: <Briefcase className="h-6 w-6 text-emerald-400" />, desc: "Teaching & professors", sectionId: "faculty" },
                        { title: "Departments", value: stats.totalDepartments, icon: <Building className="h-6 w-6 text-amber-400" />, desc: "Academics wings", sectionId: "departments" },
                        { title: "Courses", value: stats.totalCourses, icon: <BookOpen className="h-6 w-6 text-indigo-400" />, desc: "Degree streams", sectionId: "courses" },
                        { title: "Present Today", value: stats.presentToday, icon: <Check className="h-6 w-6 text-teal-400" />, desc: "Active in classes", sectionId: "attendance" },
                        { title: "Absent Today", value: stats.absentToday, icon: <X className="h-6 w-6 text-rose-400" />, desc: "Unexcused absences", sectionId: "attendance" },
                        { title: "Visitors Today", value: stats.visitorsToday, icon: <Users className="h-6 w-6 text-sky-400" />, desc: "Gate log entries", sectionId: "monitoring" },
                        { title: "Active Notices", value: stats.activeNotices, icon: <Bell className="h-6 w-6 text-purple-400" />, desc: "Published alerts", sectionId: "notifications" },
                        { title: "Pending Leaves", value: stats.pendingLeaves, icon: <MessageSquare className="h-6 w-6 text-pink-400" />, desc: "Requires admin sign", sectionId: "leaves" },
                        { title: "Security Alerts", value: stats.securityAlerts, icon: <ShieldAlert className="h-6 w-6 text-red-400 animate-bounce" />, desc: "Requires gate attention", sectionId: "monitoring" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleCardClick(item.sectionId)}
                          className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-start gap-4 hover:border-slate-700 hover:bg-slate-900/40 transition-all hover:-translate-y-1 duration-200 cursor-pointer select-none group/card"
                        >
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 group-hover/card:border-slate-700 transition-colors">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider group-hover/card:text-slate-400 transition-colors">{item.title}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{item.value ?? 0}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CHART GRAPHS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Attendance line trend */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-white">Attendance Trend Rate</h4>
                          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">Active Tracker</span>
                        </div>
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.attendanceTrend}>
                              <defs>
                                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                              <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }} />
                              <Area type="monotone" dataKey="percentage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPercentage)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Department Distribution Bar */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h4 className="font-bold text-white">Student Enrollment Distribution</h4>
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.deptWiseStudents}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickFormatter={(v) => v.split(" ")[0]} />
                              <YAxis stroke="#94a3b8" fontSize={11} />
                              <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }} />
                              <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]}>
                                {charts.deptWiseStudents?.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#6366f1"][index % 4]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* TIMELINE & ACTIVITY WIDGETS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Timeline Feed */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h4 className="font-bold text-white">Recent Activity Timeline</h4>
                        <div className="space-y-4">
                          {timeline.map((t, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                              <div className={`p-2 rounded-lg ${
                                t.type === "notice" ? "bg-purple-500/10 text-purple-400" :
                                t.type === "visitor" ? "bg-sky-500/10 text-sky-400" : "bg-pink-500/10 text-pink-400"
                              }`}>
                                {t.type === "notice" ? <Bell className="h-4 w-4" /> :
                                 t.type === "visitor" ? <Users className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{t.title}</p>
                                <span className="text-[10px] text-slate-500">{new Date(t.time).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                          {timeline.length === 0 && <p className="text-slate-500 text-xs">No recent activities.</p>}
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h4 className="font-bold text-white">Administrative Actions</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => { setActiveSection("students"); setCrudModal({ type: "student", mode: "add" }); }}
                            className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-xl text-left transition-all hover:bg-slate-900/50 group"
                          >
                            <GraduationCap className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-white mt-2">Add Student</p>
                            <p className="text-[9px] text-slate-500">Register new USN</p>
                          </button>
                          <button
                            onClick={() => { setActiveSection("notifications"); setCrudModal({ type: "notice", mode: "add" }); }}
                            className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-xl text-left transition-all hover:bg-slate-900/50 group"
                          >
                            <Bell className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-white mt-2">Post Notice</p>
                            <p className="text-[9px] text-slate-500">Target announcements</p>
                          </button>
                          <button
                            onClick={() => { setActiveSection("monitoring"); setCrudModal({ type: "visitor", mode: "add" }); }}
                            className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl text-left transition-all hover:bg-slate-900/50 group"
                          >
                            <ShieldAlert className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-white mt-2">Log Visitor</p>
                            <p className="text-[9px] text-slate-500">Verify gate logs</p>
                          </button>
                          <button
                            onClick={() => { setActiveSection("reports"); setCrudModal({ type: "report", mode: "add" }); }}
                            className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-left transition-all hover:bg-slate-900/50 group"
                          >
                            <FileText className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-white mt-2">Run Report</p>
                            <p className="text-[9px] text-slate-500">Download statistics</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- EVENT CALENDAR PANEL -------------------- */}
                {activeSection === "calendar" && (
                  <div className="grid gap-8 lg:grid-cols-5 animate-fadeIn">
                    {/* Calendar Widget (3 columns) */}
                    <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 lg:col-span-3 flex flex-col justify-between space-y-6">
                      <div>
                        <div className="border-b border-slate-800 pb-4 mb-6">
                          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" /> Academic & Event Calendar
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-1">Monthly calendar view showing academic schedules, holidays, and events.</p>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Month</span>
                          <div className="flex items-center justify-between mt-1 max-w-[280px] mx-auto">
                            <button
                              type="button"
                              onClick={() => setCalViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                              title="Previous Month"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h3 className="text-2xl font-extrabold text-white">
                              {calViewDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                            </h3>
                            <button
                              type="button"
                              onClick={() => setCalViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                              title="Next Month"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-3 mt-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                          </div>
                          <div className="grid grid-cols-7 gap-3 mt-3 text-sm font-semibold text-slate-300">
                            {(() => {
                              const todayObj = new Date();
                              const year = calViewDate.getFullYear();
                              const month = calViewDate.getMonth();
                              const firstDay = new Date(year, month, 1).getDay();
                              const totalDays = new Date(year, month + 1, 0).getDate();
                              
                               const getParsedDate = (dateStr) => {
                                if (!dateStr) return null;
                                let match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
                                if (match) {
                                  return {
                                    day: parseInt(match[1], 10),
                                    month: parseInt(match[2], 10),
                                    year: parseInt(match[3], 10)
                                  };
                                }
                                match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                                if (match) {
                                  return {
                                    day: parseInt(match[3], 10),
                                    month: parseInt(match[2], 10),
                                    year: parseInt(match[1], 10)
                                  };
                                }
                                const d = new Date(dateStr);
                                if (!isNaN(d.getTime())) {
                                  return {
                                    day: d.getDate(),
                                    month: d.getMonth() + 1,
                                    year: d.getFullYear()
                                  };
                                }
                                return null;
                              };

                              const daySlots = [];
                              for (let i = 0; i < firstDay; i++) {
                                daySlots.push(<div key={`empty-${i}`} className="w-8 h-11" />);
                              }
                              for (let day = 1; day <= totalDays; day++) {
                                const isToday = day === todayObj.getDate() && month === todayObj.getMonth() && year === todayObj.getFullYear();
                                const dayEvents = events.filter(evt => {
                                  const parsed = getParsedDate(evt.date);
                                  if (!parsed) return false;
                                  return parsed.day === day && parsed.month === (month + 1) && parsed.year === year;
                                });

                                const isHoliday = dayEvents.some(evt => evt.type?.toLowerCase().includes("holiday"));

                                let eventClass = "";
                                if (dayEvents.length > 0) {
                                  const primaryEvent = dayEvents[0];
                                  const type = primaryEvent.type?.toLowerCase() || "";
                                  if (type.includes("holiday")) {
                                    eventClass = "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30";
                                  } else if (type.includes("exam") || type.includes("test") || type.includes("ia") || type.includes("practical")) {
                                    eventClass = "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30";
                                  } else if (type.includes("workshop") || type.includes("visit")) {
                                    eventClass = "bg-amber-600 text-white font-bold shadow-lg shadow-amber-600/30";
                                  } else {
                                    eventClass = "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30";
                                  }
                                }

                                let dayStyle = "text-slate-300 hover:bg-slate-800 cursor-pointer";
                                if (isToday) {
                                  dayStyle = "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30";
                                } else if (eventClass) {
                                  dayStyle = eventClass;
                                }

                                daySlots.push(
                                  <div
                                    key={`day-${day}`}
                                    className="flex flex-col items-center justify-center gap-0.5 mx-auto"
                                  >
                                    <span
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${dayStyle}`}
                                    >
                                      {day}
                                    </span>
                                    <span className="h-3 text-[9px] font-extrabold tracking-wider leading-none flex items-center justify-center">
                                      {isHoliday ? (
                                        <span className="text-emerald-500 dark:text-emerald-400">H</span>
                                      ) : (
                                        <span className="opacity-0">H</span>
                                      )}
                                    </span>
                                  </div>
                                );
                              }
                              return daySlots;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Campus Events list (2 columns) */}
                    <div className="bg-slate-950 rounded-2xl p-6 md:p-8 border border-slate-800 lg:col-span-2 flex flex-col justify-between">
                      <div>
                        <div className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                              <span>📅</span> Campus Events & Deadlines
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">Schedules managed by university administration.</p>
                          </div>
                          <button
                            onClick={() => setCrudModal({ type: "calendar_event", mode: "add" })}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-blue-600/15"
                            title="Schedule Event"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add
                          </button>
                        </div>

                        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                          {events.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                              No campus events created yet.
                            </div>
                          ) : (
                            events.map((evt, idx) => (
                              <div key={evt._id || idx} className="flex gap-4 items-start p-3 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900/40 transition-colors relative group">
                                <div className={`h-7 w-24 flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-lg shrink-0 ${
                                  evt.type?.toLowerCase().includes("exam") || evt.type?.toLowerCase().includes("test") || evt.type?.toLowerCase().includes("ia") || evt.type?.toLowerCase().includes("practical")
                                    ? "bg-rose-950/40 text-rose-400 border border-rose-900" :
                                  evt.type?.toLowerCase().includes("holiday")
                                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900" :
                                  evt.type?.toLowerCase().includes("workshop") || evt.type?.toLowerCase().includes("visit")
                                    ? "bg-amber-950/40 text-amber-400 border border-amber-900" :
                                  "bg-blue-950/40 text-blue-400 border border-blue-900"
                                }`}>
                                  {evt.type}
                                </div>
                                <div className="space-y-1 pr-6">
                                  <p className="text-xs font-bold text-slate-500">{evt.time ? `${evt.date} • ${evt.time}` : evt.date}</p>
                                  <h4 className="text-sm font-bold text-white leading-tight">{evt.title}</h4>
                                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{evt.description}</p>
                                  {evt.location && <p className="text-[10px] text-slate-500 font-bold">Venue: {evt.location}</p>}
                                </div>
                                <button
                                  onClick={() => handleDelete("event", evt._id)}
                                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-opacity p-1 bg-slate-900/80 rounded border border-slate-800"
                                  title="Delete Event"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- 2. STUDENTS CRUD PANEL -------------------- */}
                {activeSection === "students" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    {/* Header Action / Search */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search by student name, USN, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Department filter..."
                          value={deptFilter}
                          onChange={(e) => setDeptFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none max-w-xs"
                        />
                      </div>
                      <button
                        onClick={() => setCrudModal({ type: "student", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Register Student</span>
                      </button>
                    </div>

                    {/* Table grid */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                          <tr>
                            <th className="px-6 py-4">Student Name / USN</th>
                            <th className="px-6 py-4">Academic Details</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Age / DOB</th>
                            <th className="px-6 py-4">CGPA</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {students.map((student) => (
                            <tr key={student._id} className="hover:bg-slate-900/30">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{student.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{student.usn}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-white text-xs">{student.department}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{student.semester} ({student.year})</div>
                              </td>
                              <td className="px-6 py-4">
                                <div>{student.mail}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{student.phone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div>{student.age} yrs</div>
                                <div className="text-xs text-slate-500 mt-0.5">{new Date(student.dob).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 font-bold text-amber-400">{student.cgpa || "0.00"}</td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => setCrudModal({ type: "student", mode: "edit", data: student })}
                                  className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setResetPassModal({ userId: student.user?._id || student.user, name: student.name })}
                                  className="text-amber-500 hover:text-amber-400 p-1.5 hover:bg-slate-800 rounded"
                                  title="Reset Password"
                                >
                                  <Lock className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete("student", student._id)}
                                  className="text-rose-500 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Showing page {currentPage} of {totalPages}</span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          Previous
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- 3. FACULTY CRUD PANEL -------------------- */}
                {activeSection === "faculty" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    {/* Header Action / Search */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search by faculty name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setCrudModal({ type: "faculty", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Register Faculty</span>
                      </button>
                    </div>

                    {/* Table grid */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                          <tr>
                            <th className="px-6 py-4">Faculty Name / ID</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Salary</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Age / DOB</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {faculty.map((f) => (
                            <tr key={f._id} className="hover:bg-slate-900/30">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{f.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{f.id}</div>
                              </td>
                              <td className="px-6 py-4 text-white text-xs">{f.department}</td>
                              <td className="px-6 py-4 text-emerald-400 font-bold">${f.salary?.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <div>{f.mail}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{f.phone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div>{f.age} yrs</div>
                                <div className="text-xs text-slate-500 mt-0.5">{f.dob ? new Date(f.dob).toLocaleDateString() : ""}</div>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => setCrudModal({ type: "faculty", mode: "edit", data: f })}
                                  className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setResetPassModal({ userId: f.user?._id || f.user, name: f.name })}
                                  className="text-amber-500 hover:text-amber-400 p-1.5 hover:bg-slate-800 rounded"
                                  title="Reset Password"
                                >
                                  <Lock className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete("faculty", f._id)}
                                  className="text-rose-500 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* -------------------- 4. SECURITY CRUD PANEL -------------------- */}
                {activeSection === "security" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Security Staff Directory</h4>
                      <button
                        onClick={() => setCrudModal({ type: "security", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Hire Security</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {securityStaff.map((staff) => (
                        <div key={staff._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-white text-lg">{staff.name}</h5>
                              <span className="text-xs text-slate-500">{staff.id}</span>
                            </div>
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase">{staff.shift} Shift</span>
                          </div>

                          <div className="space-y-1 text-sm text-slate-300">
                            <div><span className="text-slate-500 font-semibold">Assigned Gate: </span>{staff.gateNumber}</div>
                            <div><span className="text-slate-500 font-semibold">Phone: </span>{staff.phone}</div>
                            <div><span className="text-slate-500 font-semibold">Email: </span>{staff.mail}</div>
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                            <button
                              onClick={() => setCrudModal({ type: "security", mode: "edit", data: staff })}
                              className="text-slate-400 hover:text-white px-2.5 py-1 hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => setResetPassModal({ userId: staff.user?._id || staff.user, name: staff.name })}
                              className="text-amber-500 hover:text-amber-400 px-2.5 py-1 hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Lock className="h-3.5 w-3.5" /> Reset
                            </button>
                            <button
                              onClick={() => handleDelete("security", staff._id)}
                              className="text-rose-500 hover:text-rose-400 px-2.5 py-1 hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------- 5. ADMINS CRUD PANEL -------------------- */}
                {activeSection === "admins" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">System Administrators</h4>
                      <button
                        onClick={() => setCrudModal({ type: "admin", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Admin</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {adminsList.map((adm) => (
                        <div key={adm._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all">
                          <div>
                            <h5 className="font-bold text-white text-lg">{adm.name}</h5>
                            <span className="text-xs text-slate-500">{adm.id}</span>
                          </div>

                          <div className="space-y-1 text-sm text-slate-300">
                            <div><span className="text-slate-500 font-semibold">Department: </span>{adm.department}</div>
                            <div><span className="text-slate-500 font-semibold">Phone: </span>{adm.phone}</div>
                            <div><span className="text-slate-500 font-semibold">Email: </span>{adm.mail}</div>
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                            <button
                              onClick={() => setCrudModal({ type: "admin", mode: "edit", data: adm })}
                              className="text-slate-400 hover:text-white px-2.5 py-1 hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => setResetPassModal({ userId: adm.user?._id || adm.user, name: adm.name })}
                              className="text-amber-500 hover:text-amber-400 px-2.5 py-1 hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Lock className="h-3.5 w-3.5" /> Reset
                            </button>
                            <button
                              onClick={() => handleDelete("admin", adm._id)}
                              className="text-rose-500 hover:text-rose-400 px-2.5 py-1 hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------- 6. ACADEMICS PANELS -------------------- */}
                {activeSection === "departments" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">University Departments</h4>
                      <button
                        onClick={() => setCrudModal({ type: "department", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Department</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {departments.map((dept) => (
                        <div key={dept._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center hover:border-slate-700 transition-all">
                          <div>
                            <h5 className="font-bold text-white text-lg">{dept.name}</h5>
                            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">{dept.code}</span>
                          </div>
                          <button
                            onClick={() => handleDelete("department", dept._id)}
                            className="text-rose-500 hover:text-rose-400 p-2 hover:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "courses" && (() => {
                  const activeSemestersList = semesters.length > 0 
                    ? semesters.map(s => s.name) 
                    : ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];

                  activeSemestersList.sort((a, b) => {
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return a.localeCompare(b);
                  });

                  // Courses belonging to the selected department
                  const deptCourses = selectedCourseDeptFilter === "All"
                    ? courses
                    : courses.filter(c => c.department.toLowerCase() === selectedCourseDeptFilter.toLowerCase());

                  const semesterGroups = activeSemestersList.map(sem => {
                    const coursesInSem = deptCourses.filter(c => 
                      c.semesters && c.semesters.some(s => s.toLowerCase() === sem.toLowerCase())
                    );
                    return { semesterName: sem, coursesList: coursesInSem };
                  }).filter(g => g.coursesList.length > 0);

                  const filteredGroups = semesterGroups.filter(g => 
                    selectedCourseSemFilter === "All" || g.semesterName.toLowerCase() === selectedCourseSemFilter.toLowerCase()
                  );

                  return (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-8">
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-slate-800 pb-4 flex-wrap gap-4">
                        <div>
                          <h4 className="font-bold text-white text-lg">Courses & Streams</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Explore courses grouped by department and semester curriculum.</p>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Department dropdown filter */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-semibold uppercase">Department:</span>
                            <select
                              value={selectedCourseDeptFilter}
                              onChange={(e) => {
                                setSelectedCourseDeptFilter(e.target.value);
                                if (e.target.value === "All") {
                                  setSelectedCourseSemFilter("All");
                                }
                              }}
                              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                            >
                              <option value="All">All Departments</option>
                              {departments.map(dept => (
                                <option key={dept._id} value={dept.name}>{dept.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Semester dropdown filter */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-semibold uppercase">Semester:</span>
                            <select
                              value={selectedCourseSemFilter}
                              onChange={(e) => setSelectedCourseSemFilter(e.target.value)}
                              disabled={selectedCourseDeptFilter === "All"}
                              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="All">All Semesters</option>
                              {activeSemestersList.map(semName => (
                                <option key={semName} value={semName}>{semName}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => setCrudModal({ type: "course", mode: "add" })}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                          >
                            <Plus className="h-4.5 w-4.5" />
                            <span>Add Course</span>
                          </button>
                        </div>
                      </div>

                      {/* Tier 1: Select a Department */}
                      {selectedCourseDeptFilter === "All" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                          <div className="text-center max-w-md mx-auto space-y-2">
                            <h5 className="font-bold text-white text-lg">Select a Department</h5>
                            <p className="text-sm text-slate-400">Click on a department below to view its semester-wise course layout.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments.map((dept) => {
                              const deptCoursesCount = courses.filter(c => c.department.toLowerCase() === dept.name.toLowerCase()).length;
                              return (
                                <button
                                  key={dept._id}
                                  onClick={() => {
                                    setSelectedCourseDeptFilter(dept.name);
                                    setSelectedCourseSemFilter("All");
                                  }}
                                  className="bg-slate-950 hover:bg-slate-800/40 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl text-left space-y-4 transition-all group active:scale-95 cursor-pointer flex flex-col justify-between"
                                >
                                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-all">
                                    <Building className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-bold text-base text-slate-100 group-hover:text-blue-400 transition-colors">
                                      {dept.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {deptCoursesCount} {deptCoursesCount === 1 ? "Course" : "Courses"}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {departments.length === 0 && (
                            <p className="text-slate-500 text-sm italic text-center py-8">No departments registered. Add departments in academics first.</p>
                          )}
                        </div>
                      )}

                      {/* Tier 2: Select a Semester */}
                      {selectedCourseDeptFilter !== "All" && selectedCourseSemFilter === "All" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                          <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
                            <button
                              onClick={() => setSelectedCourseDeptFilter("All")}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>Back</span>
                            </button>
                            <span className="h-4 w-[1px] bg-slate-800 mx-1"></span>
                            <div className="text-left">
                              <h5 className="font-bold text-white text-md uppercase tracking-wider">{selectedCourseDeptFilter}</h5>
                              <p className="text-xs text-slate-500">Select a semester below to view its curriculum.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {activeSemestersList.map((semName) => {
                              const coursesCount = courses.filter(c => 
                                c.department.toLowerCase() === selectedCourseDeptFilter.toLowerCase() &&
                                c.semesters && c.semesters.some(s => s.toLowerCase() === semName.toLowerCase())
                              ).length;

                              return (
                                <button
                                  key={semName}
                                  onClick={() => setSelectedCourseSemFilter(semName)}
                                  className="bg-slate-950 hover:bg-slate-800/40 border border-slate-800 hover:border-blue-500/55 p-5 rounded-2xl text-center space-y-3 transition-all group active:scale-95 cursor-pointer relative"
                                >
                                  <div className="h-10 w-10 mx-auto rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-all">
                                    <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors">
                                      {semName}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {coursesCount} {coursesCount === 1 ? "Course" : "Courses"}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tier 3: Show Respective Course Cards */}
                      {selectedCourseDeptFilter !== "All" && selectedCourseSemFilter !== "All" && (
                        <>
                          {filteredGroups.map((group) => (
                            <div key={group.semesterName} className="space-y-4">
                               <div className="flex items-center gap-3 border-b border-slate-800/50 pb-2 flex-wrap">
                                <button
                                  onClick={() => setSelectedCourseSemFilter("All")}
                                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-855 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                  title="Go back to semesters grid"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                  <span>Back to Semesters</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCourseSemFilter("All");
                                    setSelectedCourseDeptFilter("All");
                                  }}
                                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-855 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                  title="Go back to departments grid"
                                >
                                  <Building className="h-3.5 w-3.5" />
                                  <span>Back to Departments</span>
                                </button>
                                <span className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:inline"></span>
                                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></span>
                                <h5 className="font-bold text-white text-sm uppercase tracking-wider">{selectedCourseDeptFilter} - {group.semesterName}</h5>
                                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold">
                                  {group.coursesList.length} {group.coursesList.length === 1 ? "Course" : "Courses"}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {group.coursesList.map((course) => (
                                  <div key={course._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-bold text-white text-lg">{course.name}</h5>
                                        <span className="text-xs text-blue-400 font-bold uppercase">{course.code}</span>
                                      </div>
                                      <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">{course.credits} Credits</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-300">
                                      <div><span className="text-slate-500 font-semibold">Department: </span>{course.department}</div>
                                      <div><span className="text-slate-500 font-semibold">Semesters: </span>{course.semesters?.join(", ") || "All"}</div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                                      <button
                                        onClick={() => handleDelete("course", course._id)}
                                        className="text-rose-500 hover:text-rose-400 p-2 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
                                      >
                                        <Trash2 className="h-4 w-4" /> Delete Course
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {filteredGroups.length === 0 && (
                            <p className="text-slate-500 text-sm italic text-center py-12">No courses registered in this semester for {selectedCourseDeptFilter}.</p>
                          )}
                        </>
                      )}

                      {courses.length === 0 && (
                        <p className="text-slate-500 text-sm italic text-center py-12">No courses registered in system. Click "Add Course" to create one.</p>
                      )}
                    </div>
                  );
                })()}



                {activeSection === "semester" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Active Semesters</h4>
                      <button
                        onClick={() => setCrudModal({ type: "semester", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Semester</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {semesters.map((sem) => (
                        <div key={sem._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                          <span className="font-bold text-white">{sem.name}</span>
                          <button
                            onClick={() => handleDelete("semester", sem._id)}
                            className="text-rose-500 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "timetable" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Academic Timetable Schedule</h4>
                      <button
                        onClick={() => setCrudModal({ type: "class", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Class Schedule</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                          <tr>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Assigned Faculty</th>
                            <th className="px-6 py-4">Target Group</th>
                            <th className="px-6 py-4">Schedule Time</th>
                            <th className="px-6 py-4">Room No.</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {classes.map((cls) => (
                            <tr key={cls._id} className="hover:bg-slate-900/30">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{cls.subjectName}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{cls.subjectCode}</div>
                              </td>
                              <td className="px-6 py-4 text-white font-medium">{cls.faculty ? cls.faculty.name : "Unassigned"}</td>
                              <td className="px-6 py-4">
                                <div>{cls.department}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{cls.semester} ({cls.studentsCount} students)</div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">{cls.schedule}</td>
                              <td className="px-6 py-4 text-white font-semibold">{cls.room}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDelete("class", cls._id)}
                                  className="text-rose-500 hover:text-rose-400 p-2 hover:bg-slate-800 rounded-lg"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* -------------------- 7. ATTENDANCE ANALYTICS -------------------- */}
                {activeSection === "attendance" && (
                  <div className="space-y-8">
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">Defaulter Students List</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Students with attendance less than 75% require counseling warning.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadFile("Attendance_Report", "PDF")}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" /> Export PDF
                          </button>
                          <button
                            onClick={() => handleDownloadFile("Attendance_Report", "Excel")}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                          >
                            <FileSpreadsheet className="h-4 w-4" /> Export Excel
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full border-collapse text-left text-sm text-slate-300">
                          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                              <th className="px-6 py-4">Student</th>
                              <th className="px-6 py-4">USN</th>
                              <th className="px-6 py-4">Department</th>
                              <th className="px-6 py-4">Classes Held</th>
                              <th className="px-6 py-4">Classes Attended</th>
                              <th className="px-6 py-4 font-bold text-rose-400">Attendance Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {attendanceReport.defaulters?.map((def, idx) => (
                              <tr key={idx} className="bg-rose-500/5 hover:bg-rose-500/10">
                                <td className="px-6 py-4 font-semibold text-white">{def.name}</td>
                                <td className="px-6 py-4 font-mono text-xs">{def.usn}</td>
                                <td className="px-6 py-4">{def.department}</td>
                                <td className="px-6 py-4">{def.held}</td>
                                <td className="px-6 py-4">{def.attended}</td>
                                <td className="px-6 py-4 font-bold text-rose-400">{def.percentage}%</td>
                              </tr>
                            ))}
                            {attendanceReport.defaulters?.length === 0 && (
                              <tr>
                                <td colSpan="6" className="text-center py-6 text-slate-500 text-xs font-medium">Excellent! No attendance defaulters in the logs.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                      <h4 className="font-bold text-white">Daily Attendance Log Feed (Recent)</h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full border-collapse text-left text-sm text-slate-300">
                          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Student ID (USN)</th>
                              <th className="px-6 py-4">Subject</th>
                              <th className="px-6 py-4 font-bold">Status</th>
                              <th className="px-6 py-4">Hours</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {attendanceReport.attendanceLogs?.slice(0, 10).map((log) => (
                              <tr key={log._id} className="hover:bg-slate-900/30">
                                <td className="px-6 py-4 font-mono text-xs">{log.date}</td>
                                <td className="px-6 py-4 text-white font-medium">{log.student ? log.student.usn : "Unknown Student"}</td>
                                <td className="px-6 py-4">{log.subjectName} ({log.subjectCode})</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    log.status === "Present" ? "bg-emerald-500/10 text-emerald-400" :
                                    log.status === "Late" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                                  }`}>{log.status}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{log.hours} hr</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- 8. LEAVE MANAGEMENT PANEL -------------------- */}
                {activeSection === "leaves" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <h4 className="font-bold text-white">Student & Faculty Leave Requests</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                          <tr>
                            <th className="px-6 py-4">Requester</th>
                            <th className="px-6 py-4">Department / Role</th>
                            <th className="px-6 py-4">Dates Requested</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Comments</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {leaveRequests.map((req) => (
                            <tr key={req._id} className="hover:bg-slate-900/30">
                              <td className="px-6 py-4 font-semibold text-white">{req.name}</td>
                              <td className="px-6 py-4">
                                <div>{req.department}</div>
                                <span className="text-[10px] text-slate-500 capitalize bg-slate-800 px-2 py-0.5 rounded-full font-bold">{req.role}</span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">{req.startDate} to {req.endDate}</td>
                              <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" :
                                  req.status === "Rejected" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                                }`}>{req.status}</span>
                              </td>
                              <td className="px-6 py-4 text-xs italic text-slate-400">{req.comments || "No comments"}</td>
                              <td className="px-6 py-4 text-right space-x-2">
                                {req.status === "Pending" && (
                                  <>
                                    <button
                                      onClick={() => handleReviewLeave(req._id, "Approved")}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewLeave(req._id, "Rejected")}
                                      className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                          {leaveRequests.length === 0 && (
                            <tr>
                              <td colSpan="7" className="text-center py-6 text-slate-500 text-xs font-medium">No leave requests found in system database.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}



                {/* -------------------- 10. EVENT MANAGEMENT PANEL -------------------- */}
                {activeSection === "events" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">Event Scheduling</h4>
                      <button
                        onClick={() => setCrudModal({ type: "event", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Schedule Event</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {events.map((ev) => (
                        <div key={ev._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-bold">{ev.type}</span>
                              <span className="text-slate-400 text-xs font-semibold">{ev.registrations?.length || 0} / {ev.capacity} RSVP</span>
                            </div>
                            <h5 className="font-bold text-white text-lg">{ev.title}</h5>
                            <p className="text-sm text-slate-400">{ev.description}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-800 space-y-2">
                            <div className="flex gap-4 text-xs text-slate-300">
                              <div><span className="text-slate-500 font-semibold">Date: </span>{ev.date}</div>
                              <div><span className="text-slate-500 font-semibold">Time: </span>{ev.time}</div>
                              <div><span className="text-slate-500 font-semibold">Venue: </span>{ev.location}</div>
                            </div>
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => handleDelete("event", ev._id)}
                                className="text-rose-500 hover:text-rose-400 p-1 hover:bg-slate-800 rounded flex items-center gap-1 text-xs font-semibold"
                              >
                                <Trash2 className="h-4 w-4" /> Cancel Event
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------- 11. SECURITY MONITORING PANEL -------------------- */}
                {activeSection === "monitoring" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white">Live Gate Entrance Activity Log</h4>
                        <p className="text-xs text-slate-500">Real-time recording of visitors, vehicles, emergency incidents, and pass validation.</p>
                      </div>
                      <button
                        onClick={() => setCrudModal({ type: "visitor", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Log Entrance</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                          <tr>
                            <th className="px-6 py-4">Visitor Details</th>
                            <th className="px-6 py-4">Purpose</th>
                            <th className="px-6 py-4">Vehicle</th>
                            <th className="px-6 py-4">In / Out Time</th>
                            <th className="px-6 py-4">Flag / Pass Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {visitorLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-900/30">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{log.name}</div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  log.status === "Active" ? "bg-amber-500/10 text-amber-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                                }`}>{log.status}</span>
                              </td>
                              <td className="px-6 py-4">{log.purpose}</td>
                              <td className="px-6 py-4 font-mono text-xs">{log.vehicleNo || "N/A"}</td>
                              <td className="px-6 py-4 text-xs font-mono">
                                <div>In: {new Date(log.entryTime).toLocaleString()}</div>
                                <div className="text-slate-500">Out: {log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still Inside"}</div>
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                {log.emergencyAlert?.isEmergency && (
                                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-extrabold px-2 py-0.5 rounded animate-pulse inline-block">EMERGENCY: {log.emergencyAlert.description}</div>
                                )}
                                {log.lostFound?.status !== "None" && (
                                  <div className="bg-purple-500/10 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded inline-block">{log.lostFound.status}: {log.lostFound.item}</div>
                                )}
                                {log.studentGatePass?.isPass && (
                                  <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded inline-block">PASS: {log.studentGatePass.studentUsn}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {log.status === "Active" && (
                                  <button
                                    onClick={() => handleVisitorCheckout(log._id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                                  >
                                    Checkout
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* -------------------- 12. REPORTS GENERATOR PANEL -------------------- */}
                {activeSection === "reports" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white">Reports Center</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Generate printable PDF and Excel data worksheets for archiving.</p>
                      </div>
                      <button
                        onClick={() => setCrudModal({ type: "report", mode: "add" })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Generate Report</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full border-collapse text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                          <tr>
                            <th className="px-6 py-4">Report Description</th>
                            <th className="px-6 py-4">Category Type</th>
                            <th className="px-6 py-4">File Format</th>
                            <th className="px-6 py-4">Date Generated</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {reportsList.map((rep) => (
                            <tr key={rep._id} className="hover:bg-slate-900/30">
                              <td className="px-6 py-4 font-semibold text-white">{rep.title}</td>
                              <td className="px-6 py-4 text-white text-xs">{rep.type}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  rep.format === "PDF" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                                }`}>{rep.format}</span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">{new Date(rep.generatedDate).toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDownloadFile(rep.title, rep.format)}
                                  className="text-blue-400 hover:text-blue-300 p-2 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 text-xs font-semibold ml-auto"
                                >
                                  <Download className="h-4 w-4" /> Download File
                                </button>
                              </td>
                            </tr>
                          ))}
                          {reportsList.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-6 text-slate-500 text-xs font-medium">No reports generated yet. Click Generate Report to create one.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* -------------------- 13. NOTICE BROADCAST PANEL -------------------- */}
                {activeSection === "notifications" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-5 flex-wrap gap-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-white text-xl tracking-tight">Notice Broadcast Announcements</h4>
                        <p className="text-xs text-slate-400">Target announcements and track portal status across departments and semesters.</p>
                      </div>
                      <button
                        onClick={() => setCrudModal({ type: "notice", mode: "add" })}
                        className="bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 active:scale-95 border border-blue-400/25 shrink-0"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Publish Announcement</span>
                      </button>
                    </div>

                    {notices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 backdrop-blur-sm space-y-4">
                        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 animate-pulse">
                          <Bell className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-white font-bold text-lg">No Announcements Broadcasted</h5>
                          <p className="text-slate-400 text-sm max-w-sm">Publish your first campus announcement, department update, or exam alert to get started.</p>
                        </div>
                        <button
                          onClick={() => setCrudModal({ type: "notice", mode: "add" })}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                        >
                          Publish Notice Now
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {notices.map((notice) => (
                          <div key={notice._id} className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between group">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                    notice.category === "exams" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                    notice.category === "events" ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                  }`}>{notice.category}</span>
                                  <h5 className="font-bold text-white text-lg mt-2 group-hover:text-blue-400 transition-colors duration-200">{notice.title}</h5>
                                </div>
                                {notice.important && (
                                  <span className="bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-md shadow-red-600/30 uppercase tracking-wider animate-pulse shrink-0">URGENT</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed font-normal">{notice.content}</p>
                            </div>

                            <div className="space-y-3">
                              {/* Metadata tags */}
                              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider w-16">Audience</span>
                                  <div className="flex flex-wrap gap-1">
                                    {notice.targetAudience === "everyone" && (
                                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-medium">Everyone</span>
                                    )}
                                    {notice.targetAudience === "departments" && (
                                      notice.targetDepartments?.map(d => (
                                        <span key={d} className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">{d}</span>
                                      ))
                                    )}
                                    {notice.targetAudience === "semesters" && (
                                      notice.targetSemesters?.map(s => (
                                        <span key={s} className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20 font-medium">{s}</span>
                                      ))
                                    )}
                                    {notice.targetAudience === "both" && (
                                      <>
                                        {notice.targetDepartments?.map(d => (
                                          <span key={d} className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">{d}</span>
                                        ))}
                                        {notice.targetSemesters?.map(s => (
                                          <span key={s} className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20 font-medium">{s}</span>
                                        ))}
                                      </>
                                    )}
                                    {!notice.targetAudience && (
                                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">{notice.department} ({notice.semester})</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider w-16">Portal</span>
                                  <span className="text-slate-300 font-semibold">
                                    {notice.visibleTo === "Both" ? "Teachers & Students" : (notice.visibleTo === "Teacher" ? "Teachers Only" : "Students Only")}
                                  </span>
                                </div>
                              </div>

                              {/* Footer metrics & actions */}
                              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] uppercase border border-slate-700">
                                    {notice.author ? notice.author[0] : "A"}
                                  </div>
                                  <span>{notice.author}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{notice.date}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDelete("notice", notice._id)}
                                    className="text-rose-400 hover:text-white p-1.5 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 rounded-lg transition-all"
                                    title="Delete Announcement"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------- 14. SETTINGS PANEL -------------------- */}
                {activeSection === "settings" && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <h4 className="font-bold text-white">System Settings Configuration</h4>
                    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">College / Institution Name</label>
                          <input
                            type="text"
                            name="collegeName"
                            defaultValue={settingsData.collegeName}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Calendar Year</label>
                          <input
                            type="text"
                            name="academicYear"
                            defaultValue={settingsData.academicYear}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Semester Start Date</label>
                            <input
                              type="date"
                              name="semStart"
                              defaultValue={settingsData.semesterDates?.start}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Semester End Date</label>
                            <input
                              type="date"
                              name="semEnd"
                              defaultValue={settingsData.semesterDates?.end}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => {
                            showToast("Database backup initiated...");
                            handleDownloadFile("Database_Backup", "Excel");
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" /> Trigger Database Backup
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
                        >
                          Save Settings
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* ==========================================
          MODALS COMPONENT
      ========================================== */}
      {/* CRUD Form Modal */}
      {crudModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-white capitalize text-lg">
                {crudModal.mode === "add" ? "Register" : "Edit"} {crudModal.type}
              </h3>
              <button
                onClick={() => setCrudModal(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
              {/* STUDENT FIELDS */}
              {crudModal.type === "student" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Student Name</label>
                    <input type="text" name="name" required defaultValue={crudModal.data?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">USN</label>
                      <input type="text" name="usn" required defaultValue={crudModal.data?.usn} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Student ID</label>
                      <input type="text" name="id" defaultValue={crudModal.data?.id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                    <input type="email" name="email" required defaultValue={crudModal.data?.mail} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  {crudModal.mode === "add" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Password</label>
                      <input type="password" name="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Department</label>
                      <select
                        name="department"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data?.department : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Semester</label>
                      <select
                        name="semester"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data?.semester : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Semester</option>
                        {(semesters.length > 0 ? semesters.map(s => s.name) : ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"]).map(semName => (
                          <option key={semName} value={semName}>{semName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Phone</label>
                      <input type="text" name="phone" defaultValue={crudModal.data?.phone} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Age</label>
                      <input type="number" name="age" defaultValue={crudModal.data?.age || 20} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Blood</label>
                      <input type="text" name="blood" defaultValue={crudModal.data?.blood || "O+"} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* FACULTY FIELDS */}
              {crudModal.type === "faculty" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Faculty Name</label>
                    <input type="text" name="name" required defaultValue={crudModal.data?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Employee ID</label>
                      <input type="text" name="id" required defaultValue={crudModal.data?.id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Salary</label>
                      <input type="number" name="salary" defaultValue={crudModal.data?.salary || 80000} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                    <input type="email" name="email" required defaultValue={crudModal.data?.mail} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  {crudModal.mode === "add" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Password</label>
                      <input type="password" name="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Department</label>
                      <select
                        name="department"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data?.department : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Phone</label>
                      <input type="text" name="phone" defaultValue={crudModal.data?.phone} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* SECURITY FIELDS */}
              {crudModal.type === "security" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Name</label>
                    <input type="text" name="name" required defaultValue={crudModal.data?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Staff ID</label>
                    <input type="text" name="id" required defaultValue={crudModal.data?.id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                    <input type="email" name="email" required defaultValue={crudModal.data?.mail} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  {crudModal.mode === "add" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Password</label>
                      <input type="password" name="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Gate Assignment</label>
                      <input type="text" name="gateNumber" defaultValue={crudModal.data?.gateNumber || "Gate 1"} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Shift</label>
                      <select name="shift" defaultValue={crudModal.data?.shift || "Day"} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none">
                        <option value="Day">Day</option>
                        <option value="Night">Night</option>
                        <option value="Rotating">Rotating</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ADMIN FIELDS */}
              {crudModal.type === "admin" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Admin Name</label>
                    <input type="text" name="name" required defaultValue={crudModal.data?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Admin ID</label>
                    <input type="text" name="id" required defaultValue={crudModal.data?.id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                    <input type="email" name="email" required defaultValue={crudModal.data?.mail} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  {crudModal.mode === "add" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Password</label>
                      <input type="password" name="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Department</label>
                      <select
                        name="department"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data?.department : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Phone</label>
                      <input type="text" name="phone" defaultValue={crudModal.data?.phone} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* DEPARTMENT FIELDS */}
              {crudModal.type === "department" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Department Name</label>
                    <input type="text" name="name" required placeholder="e.g. Electronics Department" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Code</label>
                    <input type="text" name="code" required placeholder="e.g. EC" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                </>
              )}

              {/* COURSE FIELDS */}
              {crudModal.type === "course" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Course Code</label>
                    <input type="text" name="code" required defaultValue={crudModal.mode === "edit" ? crudModal.data.code : ""} placeholder="e.g. CS-301" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Course Name</label>
                    <input type="text" name="name" required defaultValue={crudModal.mode === "edit" ? crudModal.data.name : ""} placeholder="e.g. Computer Networks" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Department</label>
                      <select
                        name="department"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data.department : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Credits</label>
                      <input type="number" name="credits" required defaultValue={crudModal.mode === "edit" ? crudModal.data.credits : ""} placeholder="e.g. 4" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Semester</label>
                    <select
                      name="semesters"
                      required
                      defaultValue={crudModal.mode === "edit" ? (crudModal.data.semesters?.[0] || "") : ""}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="" disabled>Select Semester</option>
                      {(semesters.length > 0 ? semesters.map(s => s.name) : ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"]).map(semName => (
                        <option key={semName} value={semName}>{semName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}



              {/* SEMESTER FIELDS */}
              {crudModal.type === "semester" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Semester Name</label>
                  <input type="text" name="name" required placeholder="e.g. 6th Sem" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                </div>
              )}

              {/* TIMETABLE CLASS FIELDS */}
              {crudModal.type === "class" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Subject Code</label>
                      <input type="text" name="subjectCode" required placeholder="CS-301" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Subject Name</label>
                      <input type="text" name="subjectName" required placeholder="Computer Networks" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Faculty Reference ID</label>
                    <input type="text" name="faculty" required placeholder="Database Faculty _id" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Department</label>
                      <select
                        name="department"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data?.department : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Semester</label>
                      <select
                        name="semester"
                        required
                        defaultValue={crudModal.mode === "edit" ? crudModal.data?.semester : ""}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Semester</option>
                        {(semesters.length > 0 ? semesters.map(s => s.name) : ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"]).map(semName => (
                          <option key={semName} value={semName}>{semName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Schedule Time</label>
                      <input type="text" name="schedule" required placeholder="Mon, Wed 09:00 AM" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Room No.</label>
                      <input type="text" name="room" required placeholder="Room 402, Block C" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Students Count</label>
                      <input type="number" name="studentsCount" defaultValue={30} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* NOTICE FIELDS */}
              {crudModal.type === "notice" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Notice Title</label>
                    <input type="text" name="title" required placeholder="Announcement Title" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                      <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none">
                        <option value="academic">Academic</option>
                        <option value="events">Events</option>
                        <option value="exams">Exams</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Author</label>
                      <input type="text" name="author" defaultValue="Dr. Robert Vance" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Target Audience</label>
                      <select
                        value={noticeTargetAudience}
                        onChange={(e) => {
                          setNoticeTargetAudience(e.target.value);
                          setNoticeSelectedDepts([]);
                          setNoticeSelectedSems([]);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="departments">Departments</option>
                        <option value="semesters">Specific Semesters</option>
                        <option value="both">Both (Departments & Semesters)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Portal Visibility</label>
                      <select
                        value={noticeVisibleTo}
                        onChange={(e) => setNoticeVisibleTo(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Both">Both (Teachers & Students)</option>
                        <option value="Teacher">Teachers Only</option>
                        <option value="Student">Students Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Departments Checklist */}
                  {(noticeTargetAudience === "departments" || noticeTargetAudience === "both") && (
                    <div className="space-y-2 border border-slate-800 p-4 rounded-xl bg-slate-950/50">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-slate-400">Target Departments</label>
                        <button
                          type="button"
                          onClick={() => {
                            const allDeptNames = departments.map(d => d.name);
                            if (noticeSelectedDepts.length === allDeptNames.length) {
                              setNoticeSelectedDepts([]);
                            } else {
                              setNoticeSelectedDepts(allDeptNames);
                            }
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          {noticeSelectedDepts.length === departments.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                        {departments.map((dept) => {
                          const isChecked = noticeSelectedDepts.includes(dept.name);
                          return (
                            <label key={dept._id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setNoticeSelectedDepts(noticeSelectedDepts.filter(name => name !== dept.name));
                                  } else {
                                    setNoticeSelectedDepts([...noticeSelectedDepts, dept.name]);
                                  }
                                }}
                                className="rounded bg-slate-950 border border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                              />
                              <span className="truncate">{dept.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Semesters Checklist */}
                  {(noticeTargetAudience === "semesters" || noticeTargetAudience === "both") && (
                    <div className="space-y-2 border border-slate-800 p-4 rounded-xl bg-slate-950/50">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-slate-400">Target Semesters</label>
                        <button
                          type="button"
                          onClick={() => {
                            const allSems = semesters.length > 0 ? semesters.map(s => s.name) : ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];
                            if (noticeSelectedSems.length === allSems.length) {
                              setNoticeSelectedSems([]);
                            } else {
                              setNoticeSelectedSems(allSems);
                            }
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          {noticeSelectedSems.length === (semesters.length > 0 ? semesters.length : 8) ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                        {(semesters.length > 0 ? semesters.map(s => s.name) : ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"]).map((semName) => {
                          const isChecked = noticeSelectedSems.includes(semName);
                          return (
                            <label key={semName} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setNoticeSelectedSems(noticeSelectedSems.filter(name => name !== semName));
                                  } else {
                                    setNoticeSelectedSems([...noticeSelectedSems, semName]);
                                  }
                                }}
                                className="rounded bg-slate-950 border border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                              />
                              <span>{semName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="important" value="true" className="h-4 w-4 rounded bg-slate-950 border border-slate-800 text-blue-600" />
                    <label className="text-xs font-bold uppercase text-slate-400">Mark as Important (Urgent)</label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Notice Body Content</label>
                    <textarea name="content" required rows="4" placeholder="Enter notice details..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"></textarea>
                  </div>
                </>
              )}

              {/* CALENDAR EVENT FIELDS */}
              {crudModal.type === "calendar_event" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Event Title</label>
                    <input type="text" name="title" required placeholder="e.g. Independence Day Holiday, IA1 Exams..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Event Type</label>
                      <select name="type" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                        <option value="Holiday">Holiday</option>
                        <option value="Test">Test</option>
                        <option value="Practicals">Practicals</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Industrial Visit">Industrial Visit</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Guest Lecture">Guest Lecture</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Date (DD-MM-YYYY)</label>
                      <div className="flex items-center gap-2">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          {/* Day Input & Dropdown */}
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="DD"
                              value={evDay}
                              onChange={(e) => handleEvDayChange(e.target.value)}
                              onFocus={() => setIsEvDayOpen(true)}
                              onBlur={handleEvDayBlur}
                              className="w-full rounded-xl border border-slate-800 px-2 py-2 text-xs bg-slate-950 focus:border-blue-500 focus:outline-none font-bold text-white text-center"
                            />
                            {isEvDayOpen && (
                              <ul className="absolute z-50 w-full bg-slate-900 border border-slate-800 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {Array.from({ length: getEvMaxDays(evMonth, evYear) }, (_, i) => (i + 1).toString().padStart(2, "0")).map((d) => (
                                  <li
                                    key={d}
                                    onMouseDown={() => {
                                      setEvDay(d);
                                      setIsEvDayOpen(false);
                                    }}
                                    className="px-2 py-1.5 hover:bg-slate-800 hover:text-white cursor-pointer text-xs font-semibold text-center text-slate-300"
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
                              value={evMonth}
                              onChange={(e) => handleEvMonthChange(e.target.value)}
                              onFocus={() => setIsEvMonthOpen(true)}
                              onBlur={handleEvMonthBlur}
                              className="w-full rounded-xl border border-slate-800 px-2 py-2 text-xs bg-slate-950 focus:border-blue-500 focus:outline-none font-bold text-white text-center"
                            />
                            {isEvMonthOpen && (
                              <ul className="absolute z-50 w-full bg-slate-900 border border-slate-800 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((m) => (
                                  <li
                                    key={m}
                                    onMouseDown={() => {
                                      setEvMonth(m);
                                      setIsEvMonthOpen(false);
                                      const maxDays = getEvMaxDays(m, evYear);
                                      if (evDay && parseInt(evDay, 10) > maxDays) {
                                        setEvDay(maxDays.toString().padStart(2, "0"));
                                      }
                                    }}
                                    className="px-2 py-1.5 hover:bg-slate-800 hover:text-white cursor-pointer text-xs font-semibold text-center text-slate-300"
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
                              value={evYear}
                              onChange={(e) => handleEvYearChange(e.target.value)}
                              onFocus={() => setIsEvYearOpen(true)}
                              onBlur={handleEvYearBlur}
                              className="w-full rounded-xl border border-slate-800 px-2 py-2 text-xs bg-slate-950 focus:border-blue-500 focus:outline-none font-bold text-white text-center"
                            />
                            {isEvYearOpen && (
                              <ul className="absolute z-50 w-full bg-slate-900 border border-slate-800 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {evYearsList.map((y) => (
                                  <li
                                    key={y}
                                    onMouseDown={() => {
                                      setEvYear(y);
                                      setIsEvYearOpen(false);
                                      const maxDays = getEvMaxDays(evMonth, y);
                                      if (evDay && parseInt(evDay, 10) > maxDays) {
                                        setEvDay(maxDays.toString().padStart(2, "0"));
                                      }
                                    }}
                                    className="px-2 py-1.5 hover:bg-slate-800 hover:text-white cursor-pointer text-xs font-semibold text-center text-slate-300"
                                  >
                                    {y}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Calendar Icon trigger */}
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (calendarInputRef.current) {
                                try {
                                  calendarInputRef.current.showPicker();
                                } catch (err) {
                                  calendarInputRef.current.click();
                                }
                              }
                            }}
                            className="w-9 h-[34px] rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-blue-500 flex items-center justify-center shadow-md transition cursor-pointer"
                            title="Pick date from calendar"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                          <input
                            ref={calendarInputRef}
                            type="date"
                            value={evDateRaw}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const [y, m, d] = val.split("-");
                                setEvYear(y);
                                setEvMonth(m);
                                setEvDay(d);
                              }
                            }}
                            className="absolute invisible w-0 h-0"
                          />
                        </div>
                      </div>
                      <input type="hidden" name="date" value={evDateFormatted} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Event Description</label>
                    <textarea name="description" rows="3" placeholder="Enter event summary..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"></textarea>
                  </div>
                  <input type="hidden" name="time" value="" />
                  <input type="hidden" name="location" value="" />
                  <input type="hidden" name="capacity" value="100" />
                </>
              )}
 
              {/* EVENT FIELDS */}
              {crudModal.type === "event" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Event Title</label>
                    <input type="text" name="title" required placeholder="Event name..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Event Type</label>
                      <select name="type" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                        <option value="Holiday">Holiday</option>
                        <option value="Test">Test</option>
                        <option value="Practicals">Practicals</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Industrial Visit">Industrial Visit</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Guest Lecture">Guest Lecture</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Capacity</label>
                      <input type="number" name="capacity" defaultValue={100} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Date (DD-MM-YYYY)</label>
                      <div className="flex items-center gap-1.5">
                        <div className="grid grid-cols-3 gap-1 flex-1">
                          {/* Day Input & Dropdown */}
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="DD"
                              value={evDay}
                              onChange={(e) => handleEvDayChange(e.target.value)}
                              onFocus={() => setIsEvDayOpen(true)}
                              onBlur={handleEvDayBlur}
                              className="w-full rounded-xl border border-slate-800 px-1 py-2 text-xs bg-slate-950 focus:border-blue-500 focus:outline-none font-bold text-white text-center"
                            />
                            {isEvDayOpen && (
                              <ul className="absolute z-50 w-full bg-slate-900 border border-slate-800 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {Array.from({ length: getEvMaxDays(evMonth, evYear) }, (_, i) => (i + 1).toString().padStart(2, "0")).map((d) => (
                                  <li
                                    key={d}
                                    onMouseDown={() => {
                                      setEvDay(d);
                                      setIsEvDayOpen(false);
                                    }}
                                    className="px-2 py-1.5 hover:bg-slate-800 hover:text-white cursor-pointer text-[10px] font-semibold text-center text-slate-300"
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
                              value={evMonth}
                              onChange={(e) => handleEvMonthChange(e.target.value)}
                              onFocus={() => setIsEvMonthOpen(true)}
                              onBlur={handleEvMonthBlur}
                              className="w-full rounded-xl border border-slate-800 px-1 py-2 text-xs bg-slate-950 focus:border-blue-500 focus:outline-none font-bold text-white text-center"
                            />
                            {isEvMonthOpen && (
                              <ul className="absolute z-50 w-full bg-slate-900 border border-slate-800 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((m) => (
                                  <li
                                    key={m}
                                    onMouseDown={() => {
                                      setEvMonth(m);
                                      setIsEvMonthOpen(false);
                                      const maxDays = getEvMaxDays(m, evYear);
                                      if (evDay && parseInt(evDay, 10) > maxDays) {
                                        setEvDay(maxDays.toString().padStart(2, "0"));
                                      }
                                    }}
                                    className="px-2 py-1.5 hover:bg-slate-800 hover:text-white cursor-pointer text-[10px] font-semibold text-center text-slate-300"
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
                              value={evYear}
                              onChange={(e) => handleEvYearChange(e.target.value)}
                              onFocus={() => setIsEvYearOpen(true)}
                              onBlur={handleEvYearBlur}
                              className="w-full rounded-xl border border-slate-800 px-1 py-2 text-xs bg-slate-950 focus:border-blue-500 focus:outline-none font-bold text-white text-center"
                            />
                            {isEvYearOpen && (
                              <ul className="absolute z-50 w-full bg-slate-900 border border-slate-800 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                {evYearsList.map((y) => (
                                  <li
                                    key={y}
                                    onMouseDown={() => {
                                      setEvYear(y);
                                      setIsEvYearOpen(false);
                                      const maxDays = getEvMaxDays(evMonth, y);
                                      if (evDay && parseInt(evDay, 10) > maxDays) {
                                        setEvDay(maxDays.toString().padStart(2, "0"));
                                      }
                                    }}
                                    className="px-2 py-1.5 hover:bg-slate-800 hover:text-white cursor-pointer text-[10px] font-semibold text-center text-slate-300"
                                  >
                                    {y}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Calendar Icon trigger */}
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (calendarInputRef.current) {
                                try {
                                  calendarInputRef.current.showPicker();
                                } catch (err) {
                                  calendarInputRef.current.click();
                                }
                              }
                            }}
                            className="w-8 h-[32px] rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-blue-500 flex items-center justify-center shadow-md transition cursor-pointer"
                            title="Pick date from calendar"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </button>
                          <input
                            ref={calendarInputRef}
                            type="date"
                            value={evDateRaw}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const [y, m, d] = val.split("-");
                                setEvYear(y);
                                setEvMonth(m);
                                setEvDay(d);
                              }
                            }}
                            className="absolute invisible w-0 h-0"
                          />
                        </div>
                      </div>
                      <input type="hidden" name="date" value={evDateFormatted} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Time</label>
                      <input type="text" name="time" required placeholder="10:00 AM" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Location / Venue</label>
                      <input type="text" name="location" required placeholder="Seminar Hall A" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Event Description</label>
                    <textarea name="description" rows="3" placeholder="Enter event summary..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"></textarea>
                  </div>
                </>
              )}

              {/* VISITOR FIELDS */}
              {crudModal.type === "visitor" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Visitor Name</label>
                    <input type="text" name="name" required placeholder="e.g. Johnathan Harker" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Purpose</label>
                      <input type="text" name="purpose" required placeholder="e.g. Meeting HOD" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Vehicle No.</label>
                      <input type="text" name="vehicleNo" placeholder="e.g. KA-03-MB-4567" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  </div>
                  <div className="border border-slate-800 p-4 rounded-xl space-y-2 bg-slate-950/20">
                    <span className="text-xs font-bold uppercase text-slate-500">Student Gate Pass Validation</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Student Name</label>
                        <input type="text" name="studentGatePass.studentName" placeholder="Aman Yadav" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Student USN</label>
                        <input type="text" name="studentGatePass.studentUsn" placeholder="1RV21CS001" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* REPORT GENERATION FIELDS */}
              {crudModal.type === "report" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Report Worksheet Name</label>
                    <input type="text" name="title" required placeholder="e.g. CS Semester 6 Roster Log" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Report Category</label>
                      <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none">
                        <option value="Attendance">Attendance Rates</option>
                        <option value="Students">Student Directories</option>
                        <option value="Faculty">Faculty Salaries</option>
                        <option value="Assignments">Assignments Statistics</option>
                        <option value="Visitors">Visitor Logs</option>
                        <option value="Events">Events Registry</option>
                        <option value="Departments">Departments Distribution</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">File Output Format</label>
                      <select name="format" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none">
                        <option value="PDF">Downloadable PDF</option>
                        <option value="Excel">Downloadable Excel (.csv)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Form buttons */}
              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCrudModal(null)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                {crudModal.type === "report" ? (
                  <button
                    type="button"
                    onClick={handleGenerateReportSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold"
                  >
                    Generate Report File
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {actionLoading ? "Saving record..." : "Confirm & Save"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Reset Password</h3>
            <p className="text-xs text-slate-400">Configure new password credentials for <span className="text-white font-semibold">{resetPassModal.name}</span>.</p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">New Password</label>
                <input type="password" name="newPassword" required placeholder="Minimum 6 characters" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetPassModal(null)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
