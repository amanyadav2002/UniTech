import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Bookmark,
  Building2,
  Briefcase,
  FlaskConical,
} from "lucide-react";

import studentService from "../services/studentService";

export default function Students({ onOpenAuth }) {
  const { user, logout, updateUserProfile, addBookmark, removeBookmark } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState("overview");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [bookmarkFilter, setBookmarkFilter] = useState("all");
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [selectedResourceCourse, setSelectedResourceCourse] = useState(null);
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

  // Year and Semester synchronization helpers for profile edit
  const getAvailableSemesters = (selectedYear) => {
    switch (selectedYear) {
      case "1st Year":
        return ["1st Sem", "2nd Sem"];
      case "2nd Year":
        return ["3rd Sem", "4th Sem"];
      case "3rd Year":
        return ["5th Sem", "6th Sem"];
      case "4th Year":
        return ["7th Sem", "8th Sem"];
      default:
        return ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];
    }
  };

  const handleEditYearSelection = (selectedYear) => {
    setEditYear(selectedYear);
    // Clear semester if it is incompatible with the newly selected year
    if (selectedYear === "1st Year" && !["1st Sem", "2nd Sem"].includes(editSemester)) {
      setEditSemester("");
    } else if (selectedYear === "2nd Year" && !["3rd Sem", "4th Sem"].includes(editSemester)) {
      setEditSemester("");
    } else if (selectedYear === "3rd Year" && !["5th Sem", "6th Sem"].includes(editSemester)) {
      setEditSemester("");
    } else if (selectedYear === "4th Year" && !["7th Sem", "8th Sem"].includes(editSemester)) {
      setEditSemester("");
    }
  };

  const handleEditSemesterSelection = (selectedSemester) => {
    setEditSemester(selectedSemester);
    // Automatically select the corresponding year
    if (["1st Sem", "2nd Sem"].includes(selectedSemester)) {
      setEditYear("1st Year");
    } else if (["3rd Sem", "4th Sem"].includes(selectedSemester)) {
      setEditYear("2nd Year");
    } else if (["5th Sem", "6th Sem"].includes(selectedSemester)) {
      setEditYear("3rd Year");
    } else if (["7th Sem", "8th Sem"].includes(selectedSemester)) {
      setEditYear("4th Year");
    }
  };

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

  // --- Real-time MongoDB Portal States ---
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [coursesDetails, setCoursesDetails] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    overallPercent: 88,
    totalHeld: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
  });
  const [gradesRecord, setGradesRecord] = useState([]);
  const [cgpa, setCgpa] = useState(3.82);
  const [totalEarnedCredits, setTotalEarnedCredits] = useState(74);
  const [gpaHistory, setGpaHistory] = useState([]);
  const [noticesList, setNoticesList] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [scheduleTimeline, setScheduleTimeline] = useState([]);
  const [loadingPortal, setLoadingPortal] = useState(true);
  const [errorPortal, setErrorPortal] = useState(null);

  const loadAllData = async () => {
    if (!user || user.role !== "student") return;
    setLoadingPortal(true);
    setErrorPortal(null);
    try {
      // Fetch resources
      const resources = await studentService.getResources();
      const notes = resources.filter(r => r.type === "note").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        teacher: r.uploadedBy,
        link: r.fileUrl,
        content: r.description
      }));
      const assigns = resources.filter(r => r.type === "assignment").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        dueDate: r.dueDate || r.uploadedDate,
        status: "Pending",
        content: r.description
      }));
      setNotesList(notes);
      setAssignmentsList(assigns);

      // Fetch attendance
      const att = await studentService.getAttendance();
      setAttendanceStats(att);
      setCoursesDetails(att.coursesDetails || []);

      // Fetch grades
      const gr = await studentService.getGrades();
      setGradesRecord(gr.gradesRecord || []);
      setCgpa(gr.cgpa || 3.82);
      setTotalEarnedCredits(gr.totalEarnedCredits || 74);
      setGpaHistory(gr.gpaHistory || []);

      // Fetch notices
      const nt = await studentService.getNotices();
      setNoticesList(nt);

      // Fetch tasks
      const tk = await studentService.getTasks();
      setTasks(tk);

      // Fetch schedule
      const sc = await studentService.getSchedule();
      setScheduleTimeline(sc);

    } catch (err) {
      console.error("Error loading student portal data:", err);
      setErrorPortal(err.message || "Failed to load portal data.");
    } finally {
      setLoadingPortal(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const updatedTasks = await studentService.createTask(newTaskText.trim());
      setTasks(updatedTasks);
      setNewTaskText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const updatedTasks = await studentService.toggleTask(id, !task.completed);
      setTasks(updatedTasks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const updatedTasks = await studentService.deleteTask(id);
      setTasks(updatedTasks);
    } catch (err) {
      console.error(err);
    }
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

  const filteredNotices = (noticesList || []).filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || 
                          n.content.toLowerCase().includes(noticeSearch.toLowerCase());
    const matchesCategory = noticeCategory === "all" || n.category === noticeCategory;
    return matchesSearch && matchesCategory;
  });

  // Notes and assignments are fetched dynamically from studentService

  // --- Bookmarking Helper Logic ---
  const studentProfile = user?.profile || {};
  const bookmarkedItems = studentProfile.bookmarks || [];

  const isBookmarked = (itemId) => {
    return bookmarkedItems.some((b) => b.itemId === itemId.toString());
  };

  const handleToggleBookmark = async (item, type) => {
    const itemIdStr = (item.id || item.itemId).toString();
    const isSaved = isBookmarked(itemIdStr);
    try {
      if (isSaved) {
        await removeBookmark(itemIdStr);
      } else {
        const bookmarkObj = {
          itemId: itemIdStr,
          type: type,
          title: item.title,
          courseCode: item.courseCode || "",
          courseName: item.courseName || item.title || "",
          dueDate: item.dueDate || "",
          category: item.category || "",
          link: item.link || "",
          content: item.content || "",
        };
        await addBookmark(bookmarkObj);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

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

  // Courses details, grades record and schedule timeline are loaded dynamically from studentService

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

    // Filtered lists for in-tab searches across all student portal modules
    const filteredCourses = coursesDetails.filter((c) =>
      c.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      c.teacher.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredGrades = gradesRecord.filter((g) =>
      g.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      g.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      g.type.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      g.marks.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredNotes = notesList.filter((n) =>
      n.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      n.courseCode.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      n.courseName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      n.teacher.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredAssignments = assignmentsList.filter((a) =>
      a.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      a.courseCode.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      a.courseName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredTasks = tasks.filter((t) =>
      t.text.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredSchedule = scheduleTimeline.filter((s) =>
      s.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      s.room.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );

    const filteredBookmarks = bookmarkedItems.filter((b) => {
      const matchesGlobal = !globalSearchQuery ||
        (b.title && b.title.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        (b.courseCode && b.courseCode.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        (b.content && b.content.toLowerCase().includes(globalSearchQuery.toLowerCase()));
      const matchesSearch = !bookmarkSearch ||
        (b.title && b.title.toLowerCase().includes(bookmarkSearch.toLowerCase())) ||
        (b.courseCode && b.courseCode.toLowerCase().includes(bookmarkSearch.toLowerCase()));
      const matchesCategory = bookmarkFilter === "all" || b.type === bookmarkFilter;
      return matchesGlobal && matchesSearch && matchesCategory;
    });

    // --- Dynamic Student Portal Search Engine ---
    const getStudentSearchResults = () => {
      if (!globalSearchQuery || !globalSearchQuery.trim()) return [];
      const q = globalSearchQuery.toLowerCase().trim();
      const results = [];

      // 1. Enrolled Courses & Attendance
      coursesDetails.forEach((c) => {
        if (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Course",
            category: "Enrolled Courses",
            title: `${c.code} - ${c.name}`,
            description: `Teacher: ${c.teacher} | Attendance: ${c.attendance}% (${c.attended}/${c.held} Classes)`,
            action: () => {
              setActiveTab("courses");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 2. Examination Grades & Marks
      gradesRecord.forEach((g) => {
        if (
          g.name.toLowerCase().includes(q) ||
          g.code.toLowerCase().includes(q) ||
          g.type.toLowerCase().includes(q) ||
          g.marks.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Grade",
            category: "Grades & Results",
            title: `${g.code} ${g.name} (${g.type})`,
            description: `Marks Obtained: ${g.marks} | Status: ${g.status}`,
            action: () => {
              setActiveTab("grades");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 3. Study Notes & E-Resources
      notesList.forEach((n) => {
        if (
          n.title.toLowerCase().includes(q) ||
          n.courseCode.toLowerCase().includes(q) ||
          n.courseName.toLowerCase().includes(q) ||
          n.teacher.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Note",
            category: "Study Materials",
            title: n.title,
            description: `Course: ${n.courseCode} | Faculty: ${n.teacher}`,
            action: () => {
              const courseObj = coursesDetails.find(c => c.code === n.courseCode);
              if (courseObj) setSelectedResourceCourse(courseObj);
              setActiveTab("resources");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 4. Subject Assignments
      assignmentsList.forEach((a) => {
        if (
          a.title.toLowerCase().includes(q) ||
          a.courseCode.toLowerCase().includes(q) ||
          a.courseName.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Assignment",
            category: "Subject Assignments",
            title: a.title,
            description: `Course: ${a.courseCode} | Due: ${a.dueDate} | Status: ${a.status}`,
            action: () => {
              const courseObj = coursesDetails.find(c => c.code === a.courseCode);
              if (courseObj) setSelectedResourceCourse(courseObj);
              setActiveTab("resources");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 5. Campus Notices
      noticesList.forEach((n) => {
        if (
          n.title.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Notice",
            category: "Campus Notices",
            title: n.title,
            description: `Category: ${n.category} | Date: ${n.date}`,
            action: () => {
              setSelectedNotice(n);
              setActiveTab("notices");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 6. Class Schedule Timeline
      scheduleTimeline.forEach((s) => {
        if (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Schedule",
            category: "Class Schedule",
            title: `${s.code} ${s.name}`,
            description: `Time: ${s.time} | Room: ${s.room}`,
            action: () => {
              setActiveTab("overview");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 7. Academic Checklist Tasks
      tasks.forEach((t) => {
        if (t.text.toLowerCase().includes(q)) {
          results.push({
            type: "Task",
            category: "Academic Checklist",
            title: t.text,
            description: `Status: ${t.completed ? "Completed" : "Pending"}`,
            action: () => {
              setActiveTab("overview");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 8. Bookmarks
      bookmarkedItems.forEach((b) => {
        if (
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.courseCode && b.courseCode.toLowerCase().includes(q))
        ) {
          results.push({
            type: "Bookmark",
            category: "Saved Bookmarks",
            title: b.title,
            description: `Type: ${b.type} | Course: ${b.courseCode || 'N/A'}`,
            action: () => {
              setActiveTab("bookmarks");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });

      // 9. Student Profile
      if (
        "profile".includes(q) ||
        "usn".includes(q) ||
        (studentProfile.usn && studentProfile.usn.toLowerCase().includes(q)) ||
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Profile",
          category: "Student Profile",
          title: `${user.name} Profile`,
          description: `USN: ${studentProfile.usn || "N/A"} | Year: ${studentProfile.year || "3rd"} | Sem: ${studentProfile.semester || "6th"}`,
          action: () => {
            setActiveTab("profile");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }

      return results;
    };

    const searchResults = getStudentSearchResults();
    
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
              onClick={() => setActiveTab("resources")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "resources"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Laptop size={20} />
              Study Resources
            </button>

            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "bookmarks"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Bookmark size={20} />
                {bookmarkedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </div>
              My Bookmarks
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
                {activeTab === "resources" && "Study Materials & Resources"}
                {activeTab === "bookmarks" && "My Saved Bookmarks"}
                {activeTab === "profile" && "Student Core Profile"}
              </h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Academic year: <strong className="text-slate-700">{studentProfile.year} </strong> &bull; Semester: <strong className="text-slate-700">{studentProfile.semester}</strong>
              </p>
            </div>
            
            {/* Header Right Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[280px] flex-1 sm:flex-initial" id="search-container">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search portal & dashboard details..."
                  value={globalSearchQuery}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full rounded-2xl border border-slate-200/60 pl-10 pr-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold text-slate-800 shadow-sm placeholder:text-slate-400"
                />

                {/* Dropdown Menu for Student Portal Search Results */}
                {isSearchFocused && globalSearchQuery && (
                  <div className="absolute left-0 right-0 sm:min-w-[340px] mt-2 z-[60] max-h-[380px] overflow-y-auto bg-white rounded-2xl border border-slate-200/80 shadow-2xl py-2 flex flex-col divide-y divide-slate-50">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, idx) => {
                        let icon = <Search className="h-4 w-4 text-indigo-500" />;
                        if (result.category === "Enrolled Courses") icon = <BookOpen className="h-4 w-4 text-indigo-500" />;
                        else if (result.category === "Grades & Results") icon = <Award className="h-4 w-4 text-emerald-500" />;
                        else if (result.category === "Study Materials") icon = <Laptop className="h-4 w-4 text-sky-500" />;
                        else if (result.category === "Subject Assignments") icon = <FileText className="h-4 w-4 text-amber-500" />;
                        else if (result.category === "Campus Notices") icon = <Bell className="h-4 w-4 text-rose-500" />;
                        else if (result.category === "Class Schedule") icon = <Clock className="h-4 w-4 text-purple-500" />;
                        else if (result.category === "Academic Checklist") icon = <CheckSquare className="h-4 w-4 text-teal-500" />;
                        else if (result.category === "Saved Bookmarks") icon = <Bookmark className="h-4 w-4 text-indigo-500" />;
                        else if (result.category === "Student Profile") icon = <User className="h-4 w-4 text-blue-500" />;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={result.action}
                            className="flex items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors w-full group animate-in fade-in duration-100"
                          >
                            <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors shrink-0 mt-0.5">
                              {icon}
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
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
                        No student portal results found for "{globalSearchQuery}"
                      </div>
                    )}
                  </div>
                )}
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
                      <p className="text-[10px] uppercase font-bold text-indigo-200 flex items-center justify-center gap-1"><span>🎯</span> CGPA</p>
                      <p className="text-lg md:text-xl font-black text-white">{cgpa}</p>
                    </div>
                    <div className="w-[1px] bg-white/20 self-stretch"></div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-200 flex items-center justify-center gap-1"><span>📊</span> Attendance</p>
                      <p className="text-lg md:text-xl font-black text-white">{attendanceStats.overallPercent}%</p>
                    </div>
                    <div className="w-[1px] bg-white/20 self-stretch"></div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-200 flex items-center justify-center gap-1"><span>📚</span> Tasks left</p>
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
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                      <span>📊</span> Overall Attendance
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-800">{attendanceStats.overallPercent}%</h3>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      {attendanceStats.overallPercent >= 75 ? "Eligible • Excellent" : "Not Eligible • Shortage"}
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
                        strokeDasharray={`${attendanceStats.overallPercent}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                      {attendanceStats.overallPercent}%
                    </div>
                  </div>
                </div>

                {/* Card 2: GPA */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                      <span>🎯</span> Current GPA
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-800">{cgpa} / 4.0</h3>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                      Grade {cgpa >= 3.6 ? "A" : "B"} &bull; Top {cgpa >= 3.8 ? "5%" : "15%"}
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <TrendingUp size={28} />
                  </div>
                </div>

                {/* Card 3: Semester Credit Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex flex-col justify-between">
                  <div className="space-y-2 w-full">
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                      <span>📚</span> Graduation Credits
                    </p>
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-3xl font-extrabold text-slate-800">{totalEarnedCredits}</h3>
                      <span className="text-xs text-slate-500 font-medium">Goal: 120 credits</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((totalEarnedCredits / 120) * 100))}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 mt-2 inline-block">
                      {Math.min(100, Math.round((totalEarnedCredits / 120) * 100))}% completed
                    </span>
                  </div>
                </div>

                {/* Card 4: Subject count */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                      <span>📖</span> Registered Courses
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-800">{coursesDetails.length} Courses</h3>
                    <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                      {coursesDetails.reduce((acc, c) => acc + c.credits, 0)} Credit Hours
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

              {/* Quick Access Bookmarks Desk & Resource Hub */}
              <div className="grid gap-8 lg:grid-cols-5 mt-8">
                
                {/* Bookmarks Desk (3 columns) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 lg:col-span-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>📌</span> Quick Bookmarks Desk
                      </h4>
                      <button 
                        onClick={() => setActiveTab("bookmarks")}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Manage All ({bookmarkedItems.length})
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mb-5">Your pinned announcements, notes, and tasks for immediate reference.</p>

                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {bookmarkedItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 space-y-2">
                          <Bookmark size={36} className="mx-auto text-slate-300" />
                          <p className="text-sm font-medium">No bookmarks pinned yet.</p>
                          <p className="text-[11px]">Pin notes, assignments, or notices to see them here.</p>
                        </div>
                      ) : (
                        bookmarkedItems.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                            <div className="flex items-center gap-3 overflow-hidden mr-3">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                item.type === "note"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : item.type === "assignment"
                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                              }`}>
                                {item.type}
                              </span>
                              <p className="text-sm font-semibold text-slate-700 truncate">{item.title}</p>
                            </div>
                            <button
                              onClick={() => {
                                if (item.type === "announcement") {
                                  const noticeObj = noticesList.find(n => n.id.toString() === item.itemId);
                                  if (noticeObj) setSelectedNotice(noticeObj);
                                  else setSelectedNotice(item);
                                } else {
                                  alert(`Quick view for ${item.type}: ${item.title}\n\nDetail: ${item.content || "No details available."}`);
                                }
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0"
                            >
                              Open &rarr;
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {bookmarkedItems.length > 4 && (
                    <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
                      Showing 4 of {bookmarkedItems.length} bookmarked items.
                    </div>
                  )}
                </div>

                {/* Quick Navigation Hub (2 columns) */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-6 shadow-sm border border-slate-800 lg:col-span-2 text-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold flex items-center gap-2 mb-2">
                      <span>⚡</span> Resources Registry
                    </h4>
                    <p className="text-xs text-indigo-200 font-semibold mb-6">Instantly navigate to the e-learning workspace or search catalog.</p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab("resources")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">Lecture Notes Library</p>
                          <p className="text-[10px] text-indigo-200 font-semibold">Download class presentations & docs</p>
                        </div>
                        <ChevronRight size={16} className="text-indigo-300" />
                      </button>
                      <button
                        onClick={() => setActiveTab("resources")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">Assignments Desk</p>
                          <p className="text-[10px] text-indigo-200 font-semibold">Track submission due dates & grades</p>
                        </div>
                        <ChevronRight size={16} className="text-indigo-300" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 text-[10px] font-bold text-indigo-200 text-center uppercase tracking-wider">
                    Powered by UniTech LMS v3.2
                  </div>
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
                  <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <span>🎯</span> Cumulative GPA (CGPA)
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{cgpa} / 4.00</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">Class Rank: 14 / 280 students</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <span>📈</span> Previous Semester GPA
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">
                    {gpaHistory.length > 0 ? gpaHistory[gpaHistory.length - 1].gpa : "3.91"}
                  </h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    Semester {gpaHistory.length > 0 ? gpaHistory[gpaHistory.length - 1].semester : "5"} &bull; Outstanding Performance
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <span>📚</span> Total Earned Credits
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{totalEarnedCredits} Units</h3>
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
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase font-extrabold text-slate-400">Simulated GPA</p>
                        <p className="text-xs text-slate-400 font-semibold">Based on target grades above</p>
                      </div>
                      <span className="text-3xl font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl">
                        {calculateSimulatedGpa()}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        const simGpa = calculateSimulatedGpa();
                        try {
                          const updated = await studentService.saveGPA({
                            semester: studentProfile.semester || "6th Sem",
                            gpa: Number(simGpa),
                            earnedCredits: 18,
                            remarks: "Simulated & Saved",
                          });
                          setCgpa(updated.cgpa);
                          setTotalEarnedCredits(updated.totalEarnedCredits);
                          setGpaHistory(updated.gpaHistory);
                          alert("Simulated GPA saved successfully!");
                        } catch (err) {
                          alert("Failed to save GPA: " + err.message);
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-md transition"
                    >
                      Save GPA to History
                    </button>
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
                        {filteredGrades.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 text-sm font-semibold">
                              No matching examination marks found for "{globalSearchQuery}".
                            </td>
                          </tr>
                        ) : (
                          filteredGrades.map((record, index) => (
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
                          ))
                        )}
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

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                            <Calendar size={12} />
                            {notice.date}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(notice, "announcement");
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isBookmarked(notice.id)
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                            }`}
                            title={isBookmarked(notice.id) ? "Remove Bookmark" : "Bookmark Notice"}
                          >
                            <Bookmark size={14} fill={isBookmarked(notice.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
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

          {/* TAB: STUDY RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-6 animate-fadeIn">
              
              {!selectedResourceCourse ? (
                // Subject List Grid View
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-2xl tracking-tight">Registered Subjects Catalog</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Select any subject below to access lecture notes uploaded by faculty and assignments.</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2 rounded-2xl">
                      {coursesDetails.length} Subjects Registered
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {coursesDetails.map((course) => {
                      const noteCount = notesList.filter(n => n.courseCode === course.code).length;
                      const assignCount = assignmentsList.filter(a => a.courseCode === course.code).length;
                      
                      return (
                        <div 
                          key={course.code}
                          onClick={() => setSelectedResourceCourse(course)}
                          className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl uppercase">
                                {course.code}
                              </span>
                              <span className="text-xs text-slate-400 font-semibold">{course.credits} Credits</span>
                            </div>

                            <h4 className="font-extrabold text-slate-800 text-lg mb-1 leading-snug group-hover:text-indigo-600 transition">
                              {course.name}
                            </h4>
                            <p className="text-xs text-slate-400 font-semibold mb-6">Faculty: {course.teacher}</p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1">
                              📂 <strong className="text-slate-700">{noteCount}</strong> Notes
                            </span>
                            <span className="flex items-center gap-1">
                              📝 <strong className="text-slate-700">{assignCount}</strong> Assignments
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Subject Dashboard Detail View
                <div className="space-y-6">
                  {/* Subject Detail Header */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedResourceCourse(null)}
                        className="p-2.5 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200/60 font-bold"
                        title="Back to Subjects"
                      >
                        &larr; Back
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg uppercase">
                            {selectedResourceCourse.code}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">Instructor: {selectedResourceCourse.teacher}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-xl tracking-tight mt-1">{selectedResourceCourse.name}</h3>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                      Year {studentProfile.year || "3rd"} &bull; Sem {studentProfile.semester || "6th"}
                    </div>
                  </div>

                  {/* Redesigned two column layout: Left for notes uploaded, Right for assignments */}
                  <div className="grid gap-8 lg:grid-cols-2">
                    
                    {/* Faculty Uploaded Notes */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/60 pb-3 flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><BookOpen size={16} /></span>
                          Faculty Uploaded Resources
                        </h4>
                        <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                          {notesList.filter(n => n.courseCode === selectedResourceCourse.code).length} Items
                        </span>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {notesList.filter(n => n.courseCode === selectedResourceCourse.code).length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-200/40 p-8 text-center text-slate-400 font-medium text-xs">
                            No resources uploaded by the faculty yet.
                          </div>
                        ) : (
                          notesList.filter(n => n.courseCode === selectedResourceCourse.code).map((note) => (
                            <div key={note.id} className="bg-white rounded-2xl border border-slate-200/50 p-5 hover:shadow-md transition shadow-sm flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <span>📄</span> Lecture Material
                                  </span>
                                  <button
                                    onClick={() => handleToggleBookmark(note, "note")}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isBookmarked(note.id)
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                        : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                                    }`}
                                    title={isBookmarked(note.id) ? "Remove Bookmark" : "Bookmark Note"}
                                  >
                                    <Bookmark size={14} fill={isBookmarked(note.id) ? "currentColor" : "none"} />
                                  </button>
                                </div>
                                <h5 className="font-bold text-slate-800 text-base mb-1.5">{note.title}</h5>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">{note.content}</p>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">PDF Handout</span>
                                <button
                                  onClick={() => alert(`Downloading: ${note.title}`)}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                  Download Material &rarr;
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Course Assignments */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/60 pb-3 flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><FileText size={16} /></span>
                          Subject Assignments
                        </h4>
                        <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                          {assignmentsList.filter(a => a.courseCode === selectedResourceCourse.code).length} Items
                        </span>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {assignmentsList.filter(a => a.courseCode === selectedResourceCourse.code).length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-200/40 p-8 text-center text-slate-400 font-medium text-xs">
                            No assignments listed for this subject.
                          </div>
                        ) : (
                          assignmentsList.filter(a => a.courseCode === selectedResourceCourse.code).map((assign) => (
                            <div key={assign.id} className="bg-white rounded-2xl border border-slate-200/50 p-5 hover:shadow-md transition shadow-sm flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                    assign.status === "Submitted"
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                      : "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>
                                    {assign.status}
                                  </span>
                                  <button
                                    onClick={() => handleToggleBookmark(assign, "assignment")}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isBookmarked(assign.id)
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                        : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                                    }`}
                                    title={isBookmarked(assign.id) ? "Remove Bookmark" : "Bookmark Assignment"}
                                  >
                                    <Bookmark size={14} fill={isBookmarked(assign.id) ? "currentColor" : "none"} />
                                  </button>
                                </div>
                                <h5 className="font-bold text-slate-800 text-base mb-1">{assign.title}</h5>
                                <p className="text-[10px] text-rose-500 font-bold mb-3 flex items-center gap-1">
                                  <Clock size={11} /> Due Date: {assign.dueDate}
                                </p>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">{assign.content}</p>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">LMS Submit Portal</span>
                                <button
                                  onClick={() => alert(`Opening submission console: ${assign.title}`)}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                  Submit Assignment &rarr;
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: MY BOOKMARKS */}
          {activeTab === "bookmarks" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Controls bar */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search bookmarked titles */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-2.5 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search saved bookmarks..."
                    value={bookmarkSearch}
                    onChange={(e) => setBookmarkSearch(e.target.value)}
                    className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
                  {[
                    { key: "all", label: "All" },
                    { key: "note", label: "Notes" },
                    { key: "assignment", label: "Assignments" },
                    { key: "announcement", label: "Announcements" }
                  ].map((cat) => {
                    const count = cat.key === "all" 
                      ? bookmarkedItems.length 
                      : bookmarkedItems.filter(b => b.type === cat.key).length;
                    
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setBookmarkFilter(cat.key)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide transition flex items-center gap-1.5 ${
                          bookmarkFilter === cat.key
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {cat.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          bookmarkFilter === cat.key ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-600"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Bookmarked Items Grid */}
              {filteredBookmarks.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200/50 text-center text-slate-400">
                  <Bookmark size={48} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-base font-bold">No bookmarks found matching the criteria.</p>
                  <p className="text-sm mt-1">Items you bookmark across the Portal will show up here.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBookmarks.map((item) => (
                    <div 
                      key={item.itemId} 
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                            item.type === "note" 
                              ? "bg-blue-50 text-blue-600 border-blue-100" 
                              : item.type === "assignment" 
                                ? "bg-amber-50 text-amber-600 border-amber-100" 
                                : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {item.type}
                          </span>
                          
                          <button
                            onClick={() => handleToggleBookmark(item, item.type)}
                            className="p-1.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition"
                            title="Remove Bookmark"
                          >
                            <Bookmark size={14} fill="currentColor" />
                          </button>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-base mb-2 leading-snug">
                          {item.title}
                        </h4>
                        
                        {item.courseCode && (
                          <p className="text-[10px] text-slate-400 font-semibold mb-3">
                            Course: {item.courseCode} {item.courseName ? `(${item.courseName})` : ""}
                          </p>
                        )}

                        {item.dueDate && (
                          <p className="text-[10px] text-rose-500 font-bold mb-3 flex items-center gap-1">
                            <Clock size={12} /> Due: {item.dueDate}
                          </p>
                        )}

                        {item.category && (
                          <p className="text-[10px] text-slate-400 font-semibold mb-3">
                            Category: <span className="capitalize">{item.category}</span>
                          </p>
                        )}

                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 line-clamp-3">
                          {item.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex justify-end">
                        <button
                          onClick={() => {
                            if (item.type === "announcement") {
                              const noticeObj = noticesList.find(n => n.id.toString() === item.itemId);
                              if (noticeObj) setSelectedNotice(noticeObj);
                              else setSelectedNotice(item);
                            } else {
                              alert(`Quick view for ${item.type}: ${item.title}\n\nDetail: ${item.content || "No details available."}`);
                            }
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                          View Details &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                          onChange={(e) => handleEditYearSelection(e.target.value)}
                          className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
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
                          onChange={(e) => handleEditSemesterSelection(e.target.value)}
                          className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                          <option value="" disabled>Select Semester</option>
                          {getAvailableSemesters(editYear).map((sem) => (
                            <option key={sem} value={sem}>{sem.replace("Sem", "Semester")}</option>
                          ))}
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