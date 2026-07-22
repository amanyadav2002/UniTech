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
  Bookmark,
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

import facultyService from "../services/facultyService";
import studentService from "../services/studentService";

export default function Faculty({ onOpenAuth }) {
  const { user, logout, updateUserProfile, addBookmark, removeBookmark } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard active tab navigation
  const [activeTab, setActiveTab] = useState("overview");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [noticeSearch, setNoticeSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- Bookmark Tab State ---
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [bookmarkFilter, setBookmarkFilter] = useState("all");

  // --- Notice Form State ---
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState("academic");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState("");

  // Click outside search container to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById("search-container");
      if (container && !container.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // --- Real-time MongoDB Faculty States ---
  const [coursesList, setCoursesList] = useState([]);
  const [scheduleTimeline, setScheduleTimeline] = useState([]);
  const [notices, setNotices] = useState([]);
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [loadingPortal, setLoadingPortal] = useState(true);
  const [errorPortal, setErrorPortal] = useState(null);

  // Active student roster for attendance/grading
  const [studentRoster, setStudentRoster] = useState([]);
  const [attendanceCourse, setAttendanceCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceSuccess, setAttendanceSuccess] = useState("");
  const [showAttendanceConfirmModal, setShowAttendanceConfirmModal] = useState(false);

  const loadAllFacultyData = async () => {
    if (!user || user.role !== "faculty") return;
    setLoadingPortal(true);
    setErrorPortal(null);
    try {
      // Fetch classes
      const cl = await facultyService.getClasses();
      const mappedClasses = cl.map(c => ({
        code: c.subjectCode,
        name: c.subjectName,
        schedule: c.schedule,
        room: c.room,
        studentsCount: c.studentsCount,
        department: c.department,
        semester: c.semester,
      }));
      setCoursesList(mappedClasses);

      if (mappedClasses.length > 0) {
        setAttendanceCourse(mappedClasses[0].code);
      }

      // Fetch schedule
      const sc = await facultyService.getSchedule();
      setScheduleTimeline(sc);

      // Fetch notices
      const nt = await facultyService.getNotices();
      setNotices(nt);

      // Fetch tasks
      const tk = await studentService.getTasks(); // Tasks collection is shared
      setTasks(tk);

      // Fetch resources
      const res = await facultyService.getResources();
      const notes = res.filter(r => r.type === "note").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        link: r.fileUrl,
        content: r.description
      }));
      const assigns = res.filter(r => r.type === "assignment").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        dueDate: r.dueDate,
        content: r.description
      }));
      setResources(notes);
      setAssignments(assigns);

    } catch (err) {
      console.error("Error loading faculty dashboard data:", err);
      setErrorPortal(err.message || "Failed to load portal data.");
    } finally {
      setLoadingPortal(false);
    }
  };

  useEffect(() => {
    loadAllFacultyData();
  }, [user]);

  // Load attendance roster dynamically when class or date changes
  const loadAttendanceRoster = async () => {
    if (!attendanceCourse || !attendanceDate || coursesList.length === 0) return;
    try {
      const activeClass = coursesList.find(c => c.code === attendanceCourse);
      if (!activeClass) return;

      const roster = await facultyService.getAttendanceRoster({
        department: activeClass.department,
        semester: activeClass.semester,
        subjectCode: attendanceCourse,
        date: attendanceDate,
      });
      setStudentRoster(roster);
    } catch (err) {
      console.error("Error loading attendance roster:", err);
    }
  };

  useEffect(() => {
    loadAttendanceRoster();
  }, [attendanceCourse, attendanceDate, coursesList]);

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

  // Custom Attendance Date states initialized dynamically to today's date
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

  const currentYearNum = new Date().getFullYear();
  const attYearsList = Array.from({ length: Math.max(1, currentYearNum - 2026 + 1) }, (_, i) => (2026 + i).toString());

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
        const today = new Date();
        const currYear = today.getFullYear();
        const mIdx = monthsList.indexOf(attMonth);
        let maxLimit = getAttMaxDays(attMonth, attYear);
        if (parseInt(attYear, 10) === currYear && mIdx === today.getMonth()) {
          maxLimit = Math.min(maxLimit, today.getDate());
        }
        if (isNaN(dayNum) || dayNum < 1 || dayNum > maxLimit) {
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
        const matchedMonth = monthsList.find(
          (m) => m.toLowerCase() === attMonth.toLowerCase()
        );
        const today = new Date();
        const currYear = today.getFullYear();
        if (matchedMonth) {
          const mIdx = monthsList.indexOf(matchedMonth);
          if (parseInt(attYear, 10) === currYear && mIdx > today.getMonth()) {
            setAttMonth("");
            return;
          }
          setAttMonth(matchedMonth);
          let maxDays = getAttMaxDays(matchedMonth, attYear);
          if (parseInt(attYear, 10) === currYear && mIdx === today.getMonth()) {
            maxDays = Math.min(maxDays, today.getDate());
          }
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
        const currYear = new Date().getFullYear();
        if (isNaN(yrNum) || yrNum < 2026 || yrNum > currYear) {
          setAttYear("");
        } else {
          setAttYear(yrNum.toString());
          const today = new Date();
          const mIdx = monthsList.indexOf(attMonth);
          if (yrNum === currYear && mIdx > today.getMonth()) {
            setAttMonth("");
            setAttDay("");
          } else if (attMonth.toLowerCase() === "february") {
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

  const handleToggleAttendance = (studentId) => {
    setStudentRoster(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          const newPresent = !student.present;
          return {
            ...student,
            present: newPresent,
            status: newPresent ? "Present" : "Absent",
          };
        }
        return student;
      })
    );
  };

  const handleMarkAll = (status) => {
    setStudentRoster(prev => prev.map(s => ({
      ...s,
      present: status,
      status: status ? "Present" : "Absent",
    })));
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    if (attendanceDate > todayStr) {
      setAttendanceSuccess("Error: Future attendance dates cannot be submitted!");
      setTimeout(() => {
        setAttendanceSuccess("");
      }, 3500);
      return;
    }
    setShowAttendanceConfirmModal(true);
  };

  const handleFinalSubmitAttendance = async () => {
    setShowAttendanceConfirmModal(false);
    try {
      const activeClass = coursesList.find(c => c.code === attendanceCourse);
      const records = studentRoster.map(s => ({
        studentUsn: s.id,
        present: s.present,
        status: s.status || (s.present ? "Present" : "Absent")
      }));

      await facultyService.submitAttendance({
        subjectCode: attendanceCourse,
        subjectName: activeClass?.name || attendanceCourse,
        date: attendanceDate,
        records
      });

      const presentCount = studentRoster.filter(s => s.present).length;
      setAttendanceSuccess(
        `Attendance for ${activeClass?.name || attendanceCourse} on ${attendanceDate} successfully submitted! (${presentCount}/${studentRoster.length} students present)`
      );
    } catch (err) {
      console.error(err);
      setAttendanceSuccess("Error: Failed to submit attendance to database");
    } finally {
      setTimeout(() => {
        setAttendanceSuccess("");
      }, 4000);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    try {
      const activeClass = coursesList[0];
      const updated = await facultyService.createNotice({
        title: newNoticeTitle.trim(),
        category: newNoticeCategory,
        content: newNoticeContent.trim(),
        important: newNoticeImportant,
        department: activeClass?.department || "Computer Science Department",
        semester: activeClass?.semester || "All",
      });
      setNotices(updated);
      setNewNoticeTitle("");
      setNewNoticeContent("");
      setNewNoticeImportant(false);
      setNoticeSuccess("Campus notice announced successfully!");
    } catch (err) {
      console.error(err);
      setNoticeSuccess("Error: Failed to announce notice");
    } finally {
      setTimeout(() => {
        setNoticeSuccess("");
      }, 3000);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    try {
      const updated = await facultyService.deleteNotice(noticeId);
      setNotices(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const [resTitle, setResTitle] = useState("");
  const [resCourse, setResCourse] = useState("");
  const [resLink, setResLink] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resSuccess, setResSuccess] = useState("");

  useEffect(() => {
    if (coursesList.length > 0 && !resCourse) {
      setResCourse(coursesList[0].code);
    }
  }, [coursesList, resCourse]);

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!resTitle.trim() || !resLink.trim()) return;

    try {
      const courseObj = coursesList.find(c => c.code === resCourse);
      const updated = await facultyService.uploadResource({
        title: resTitle.trim(),
        description: resDesc.trim() || "No details provided.",
        subjectCode: resCourse,
        subjectName: courseObj?.name || resCourse,
        fileUrl: resLink.startsWith("http") ? resLink : `https://${resLink}`,
        department: courseObj?.department || "Computer Science Department",
        semester: courseObj?.semester || "6th Sem",
        type: "note",
      });

      const notes = updated.filter(r => r.type === "note").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        link: r.fileUrl,
        content: r.description
      }));
      setResources(notes);

      setResTitle("");
      setResLink("");
      setResDesc("");
      setResSuccess("E-Learning study resource uploaded successfully!");
    } catch (err) {
      console.error(err);
      setResSuccess("Error: Failed to upload study resource.");
    } finally {
      setTimeout(() => {
        setResSuccess("");
      }, 3000);
    }
  };

  const handleDeleteResource = async (resId) => {
    try {
      const updated = await facultyService.deleteResource(resId);
      const notes = updated.filter(r => r.type === "note").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        link: r.fileUrl,
        content: r.description
      }));
      setResources(notes);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Assignments & Grading State ---
  const [selectedAssignForGrading, setSelectedAssignForGrading] = useState("");
  const [submissions, setSubmissions] = useState({});
  const [assignTitle, setAssignTitle] = useState("");
  const [assignCourse, setAssignCourse] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  
  // Custom Due Date states initialized dynamically to today's date
  const dueInitialDate = new Date();
  const initialDueDay = dueInitialDate.getDate().toString().padStart(2, "0");
  const initialDueMonth = (dueInitialDate.getMonth() + 1).toString().padStart(2, "0");
  const initialDueYear = dueInitialDate.getFullYear().toString();

  const [dueDay, setDueDay] = useState(initialDueDay);
  const [dueMonth, setDueMonth] = useState(initialDueMonth);
  const [dueYear, setDueYear] = useState(initialDueYear);
  const [isDueDayOpen, setIsDueDayOpen] = useState(false);
  const [isDueMonthOpen, setIsDueMonthOpen] = useState(false);
  const [isDueYearOpen, setIsDueYearOpen] = useState(false);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysList = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const yearsList = Array.from({ length: 15 }, (_, i) => (2026 + i).toString());

  useEffect(() => {
    if (dueDay && dueMonth && dueYear) {
      const formattedDay = dueDay.padStart(2, "0");
      const formattedMonth = dueMonth.padStart(2, "0");
      setAssignDueDate(`${dueYear}-${formattedMonth}-${formattedDay}`);
    } else {
      setAssignDueDate("");
    }
  }, [dueDay, dueMonth, dueYear]);

  const getDueMaxDays = (monthNumStr, yearString) => {
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
    setIsDueMonthOpen(true);
    if (val === "") {
      setDueMonth("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    const mNum = parseInt(val, 10);
    if (mNum <= 12) {
      setDueMonth(val);
    }
  };

  const handleDueYearChange = (val) => {
    setIsDueYearOpen(true);
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
          setDueDay(dayNum.toString().padStart(2, "0"));
        }
      }
    }, 200);
  };

  const handleDueMonthBlur = () => {
    setTimeout(() => {
      setIsDueMonthOpen(false);
      if (dueMonth) {
        const mNum = parseInt(dueMonth, 10);
        if (isNaN(mNum) || mNum < 1 || mNum > 12) {
          setDueMonth("");
        } else {
          const formattedMonth = mNum.toString().padStart(2, "0");
          setDueMonth(formattedMonth);
          const maxDays = getDueMaxDays(formattedMonth, dueYear);
          if (dueDay && parseInt(dueDay, 10) > maxDays) {
            setDueDay(maxDays.toString().padStart(2, "0"));
          }
        }
      }
    }, 200);
  };

  const handleDueYearBlur = () => {
    setTimeout(() => {
      setIsDueYearOpen(false);
      if (dueYear) {
        const yrNum = parseInt(dueYear, 10);
        if (isNaN(yrNum) || yrNum < 2026 || yrNum > 2045) {
          setDueYear("");
        } else {
          setDueYear(yrNum.toString());
          if (parseInt(dueMonth, 10) === 2) {
            const maxDays = getDueMaxDays("02", yrNum.toString());
            if (dueDay && parseInt(dueDay, 10) > maxDays) {
              setDueDay(maxDays.toString().padStart(2, "0"));
            }
          }
        }
      }
    }, 200);
  };

  const [assignSuccess, setAssignSuccess] = useState("");

  // Grade Edit Form State
  const [gradingStudentId, setGradingStudentId] = useState(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradeSuccess, setGradeSuccess] = useState("");

  useEffect(() => {
    if (coursesList.length > 0 && !assignCourse) {
      setAssignCourse(coursesList[0].code);
    }
  }, [coursesList, assignCourse]);

  // Set default grading assignment on mount
  useEffect(() => {
    if (assignments.length > 0 && !selectedAssignForGrading) {
      setSelectedAssignForGrading(assignments[0].id);
    }
  }, [assignments, selectedAssignForGrading]);

  // Dynamic submissions loader from MongoDB Grade collection
  const loadSubmissions = async () => {
    if (!selectedAssignForGrading || coursesList.length === 0) return;
    try {
      const activeAssign = assignments.find(a => a.id === selectedAssignForGrading);
      const activeClass = coursesList.find(c => c.code === activeAssign?.courseCode);
      if (!activeClass) return;

      const rosterGrades = await facultyService.getGrades({
        department: activeClass.department,
        semester: activeClass.semester,
        subjectCode: activeClass.code,
      });

      const mappedSubs = rosterGrades.map(g => ({
        studentId: g.studentId,
        studentName: g.studentName,
        file: g.isGraded ? "assignment_submission.pdf" : "uploaded_file.zip",
        submittedAt: "2026-07-22",
        status: g.isGraded ? "Graded" : "Pending",
        marks: g.assignment ? g.assignment.toString() : "",
        feedback: g.remarks || "",
      }));

      setSubmissions(prev => ({
        ...prev,
        [selectedAssignForGrading]: mappedSubs,
      }));
    } catch (err) {
      console.error("Error loading submissions:", err);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedAssignForGrading, assignments, coursesList]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDueDate) return;

    try {
      const courseObj = coursesList.find(c => c.code === assignCourse);
      const updated = await facultyService.uploadResource({
        title: assignTitle.trim(),
        description: assignDesc.trim() || "No details provided.",
        subjectCode: assignCourse,
        subjectName: courseObj?.name || assignCourse,
        dueDate: assignDueDate,
        department: courseObj?.department || "Computer Science Department",
        semester: courseObj?.semester || "6th Sem",
        type: "assignment",
      });

      const assigns = updated.filter(r => r.type === "assignment").map(r => ({
        id: r._id,
        title: r.title,
        courseCode: r.subject,
        courseName: r.subjectName,
        dueDate: r.dueDate,
        content: r.description
      }));
      setAssignments(assigns);

      setAssignTitle("");
      setAssignDueDate("");
      setDueDay(initialDueDay);
      setDueMonth(initialDueMonth);
      setDueYear(initialDueYear);
      setAssignDesc("");
      setAssignSuccess("Assignment created and published to students!");
    } catch (err) {
      console.error(err);
      setAssignSuccess("Error: Failed to create assignment.");
    } finally {
      setTimeout(() => {
        setAssignSuccess("");
      }, 3000);
    }
  };

  const handleOpenGradingModal = (sub) => {
    setGradingStudentId(sub.studentId);
    setGradingMarks(sub.marks || "");
    setGradingFeedback(sub.feedback || "");
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedAssignForGrading || !gradingStudentId) return;

    try {
      const activeAssign = assignments.find(a => a.id === selectedAssignForGrading);
      const activeClass = coursesList.find(c => c.code === activeAssign?.courseCode);

      await facultyService.submitGrade({
        studentUsn: gradingStudentId,
        subjectCode: activeAssign?.courseCode || activeClass?.code || "CS-301",
        subjectName: activeAssign?.courseName || activeClass?.name || "Computer Networks",
        assignment: Number(gradingMarks),
        remarks: gradingFeedback.trim(),
        semester: activeClass?.semester || "6th Sem",
        department: activeClass?.department || "Computer Science Department",
      });

      setGradingStudentId(null);
      setGradingMarks("");
      setGradingFeedback("");
      setGradeSuccess("Grade updated and posted successfully!");
      
      // Reload submissions to refresh status instantly
      await loadSubmissions();
    } catch (err) {
      console.error(err);
      setGradeSuccess("Error: Failed to post grade.");
    } finally {
      setTimeout(() => {
        setGradeSuccess("");
      }, 2500);
    }
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
  const filteredCourses = coursesList.filter(course =>
    course.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const activeAssignmentObj = assignments.find(a => a.id === selectedAssignForGrading);
  const activeSubmissionsList = submissions[selectedAssignForGrading] || [];
  
  const filteredSubmissionsList = activeSubmissionsList.filter(sub =>
    sub.studentName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    sub.studentId.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (sub.file && sub.file.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
    (sub.feedback && sub.feedback.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );

  const filteredResearchPapers = researchPapers.filter(paper =>
    paper.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    paper.journal.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    paper.status.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredNotices = notices.filter(notice =>
    notice && (
      (notice.title || "").toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      (notice.content || "").toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      (notice.category || "").toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      (notice.author || "").toLowerCase().includes(globalSearchQuery.toLowerCase())
    )
  );

  const filteredStudentRoster = studentRoster.filter(student =>
    student.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(res =>
    res.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    res.courseCode.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    (res.description && res.description.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );

  // --- Bookmarking Helper Logic ---
  const bookmarkedItems = teacherProfile.bookmarks || [];

  const isBookmarked = (itemId) => {
    return bookmarkedItems.some((b) => b.itemId === itemId.toString());
  };

  const handleToggleBookmark = async (item, type) => {
    const itemIdStr = (item.id || item._id || item.itemId).toString();
    const isSaved = isBookmarked(itemIdStr);
    try {
      if (isSaved) {
        await removeBookmark(itemIdStr);
      } else {
        const bookmarkObj = {
          itemId: itemIdStr,
          type: type,
          title: item.title,
          courseCode: item.courseCode || item.subject || "",
          courseName: item.courseName || item.subjectName || item.title || "",
          dueDate: item.dueDate || "",
          category: item.category || "",
          link: item.link || item.fileUrl || "",
          content: item.content || item.description || "",
        };
        await addBookmark(bookmarkObj);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

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

  // --- Comprehensive Global Faculty Search Engine ---
  const getFacultySearchResults = () => {
    if (!globalSearchQuery || !globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase().trim();
    const results = [];

    // 1. Teaching Course Syllabus & Schedule
    coursesList.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q) ||
        c.schedule.toLowerCase().includes(q)
      ) {
        results.push({
          type: "Course",
          category: "Teaching Courses",
          title: `${c.code} - ${c.name}`,
          subtitle: `Schedule: ${c.schedule} | Room: ${c.room} (${c.studentsCount} Students)`,
          action: () => {
            setActiveTab("overview");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
        results.push({
          type: "Attendance Sheet",
          category: "Attendance",
          title: `Roll Call: ${c.code} (${c.name})`,
          subtitle: `Open attendance roster sheet for ${c.code}`,
          action: () => {
            setAttendanceCourse(c.code);
            setActiveTab("attendance");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 2. Students Roster in Attendance
    studentRoster.forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      ) {
        results.push({
          type: "Student",
          category: "Class Roster",
          title: `${s.name} (${s.id})`,
          subtitle: `Status: ${s.present ? "Present" : "Absent"} in active roll call`,
          action: () => {
            setActiveTab("attendance");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 3. Digital Classroom Study Materials & Resources
    resources.forEach((r) => {
      if (
        r.title.toLowerCase().includes(q) ||
        r.courseCode.toLowerCase().includes(q) ||
        r.courseName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      ) {
        results.push({
          type: "Resource",
          category: "Digital Classroom",
          title: r.title,
          subtitle: `Course: ${r.courseCode} | Published: ${r.date}`,
          action: () => {
            setActiveTab("resources");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 4. Assignments & Homework Worksheets
    assignments.forEach((a) => {
      if (
        a.title.toLowerCase().includes(q) ||
        a.courseCode.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Assignment",
          category: "Grading Hub",
          title: a.title,
          subtitle: `Course: ${a.courseCode} | Due: ${a.dueDate}`,
          action: () => {
            setSelectedAssignForGrading(a.id);
            setActiveTab("assignments");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 5. Student Submissions & Grades
    Object.keys(submissions).forEach((assignId) => {
      const assignObj = assignments.find((a) => a.id === assignId);
      const subList = submissions[assignId] || [];
      subList.forEach((sub) => {
        if (
          sub.studentName.toLowerCase().includes(q) ||
          sub.studentId.toLowerCase().includes(q) ||
          (sub.file && sub.file.toLowerCase().includes(q)) ||
          (sub.feedback && sub.feedback.toLowerCase().includes(q))
        ) {
          results.push({
            type: "Submission",
            category: "Student Submission",
            title: `${sub.studentName} - ${assignObj ? assignObj.title : 'Assignment'}`,
            subtitle: `File: ${sub.file || 'No file'} | Marks: ${sub.marks || 'Un-graded'} | Status: ${sub.status}`,
            action: () => {
              setSelectedAssignForGrading(assignId);
              setActiveTab("assignments");
              setGlobalSearchQuery("");
              setIsSearchFocused(false);
            }
          });
        }
      });
    });

    // 6. Research Papers & Publications
    researchPapers.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      ) {
        results.push({
          type: "Research Paper",
          category: "Research Publications",
          title: p.title,
          subtitle: `Journal: ${p.journal} | Status: ${p.status} | Date: ${p.date}`,
          action: () => {
            setActiveTab("research");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 7. Announcements / Department Notices
    notices.forEach((n) => {
      if (
        n && (
          (n.title || "").toLowerCase().includes(q) ||
          (n.category || "").toLowerCase().includes(q) ||
          (n.content || "").toLowerCase().includes(q) ||
          (n.author || "").toLowerCase().includes(q)
        )
      ) {
        results.push({
          type: "Notice",
          category: "Announcements Board",
          title: n.title,
          subtitle: `Category: ${n.category} | Author: ${n.author} | Date: ${n.date}`,
          action: () => {
            setActiveTab("notices");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 8. Academic Checklist Tasks
    tasks.forEach((t) => {
      if (t.text.toLowerCase().includes(q)) {
        results.push({
          type: "Task",
          category: "Academic Checklist",
          title: t.text,
          subtitle: `Status: ${t.completed ? "Completed" : "Pending"}`,
          action: () => {
            setActiveTab("overview");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 9. Faculty Core Profile Details
    if (
      "profile".includes(q) ||
      "department".includes(q) ||
      (teacherProfile.department && teacherProfile.department.toLowerCase().includes(q)) ||
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      "salary".includes(q) ||
      "phone".includes(q)
    ) {
      results.push({
        type: "Profile",
        category: "Faculty Profile",
        title: `${user.name} Profile (${teacherProfile.department || "Computer Science"})`,
        subtitle: `Email: ${user.email} | ID: ${teacherProfile.id || "N/A"}`,
        action: () => {
          setActiveTab("profile");
          setGlobalSearchQuery("");
          setIsSearchFocused(false);
        }
      });
    }

    // 10. Saved Bookmarks
    bookmarkedItems.forEach((b) => {
      if (
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.courseCode && b.courseCode.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Bookmark",
          category: "Saved Bookmarks",
          title: b.title,
          subtitle: `Type: ${b.type} | Course: ${b.courseCode || 'N/A'}`,
          action: () => {
            setActiveTab("bookmarks");
            setGlobalSearchQuery("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    return results;
  };

  const searchResults = getFacultySearchResults();

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
            onClick={() => setActiveTab("bookmarks")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === "bookmarks"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="relative">
              <Bookmark size={18} />
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
                placeholder="Search dashboard details..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setNoticeSearch(e.target.value);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-2xl border border-slate-200/60 pl-10 pr-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold text-slate-800 shadow-sm placeholder:text-slate-400"
              />

              {/* Dropdown Menu for Faculty Portal Search Results */}
              {isSearchFocused && globalSearchQuery && (
                <div className="absolute left-0 right-0 sm:min-w-[340px] mt-2 z-[60] max-h-[380px] overflow-y-auto bg-white rounded-2xl border border-slate-200/80 shadow-2xl py-2 flex flex-col divide-y divide-slate-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => {
                      let icon = <Search className="h-4 w-4 text-indigo-500" />;
                      if (result.category === "Teaching Courses") icon = <BookOpen className="h-4 w-4 text-indigo-500" />;
                      else if (result.category === "Attendance" || result.category === "Class Roster") icon = <ClipboardCheck className="h-4 w-4 text-emerald-500" />;
                      else if (result.category === "Digital Classroom") icon = <Laptop className="h-4 w-4 text-sky-500" />;
                      else if (result.category === "Grading Hub" || result.category === "Student Submission") icon = <FileText className="h-4 w-4 text-amber-500" />;
                      else if (result.category === "Research Publications") icon = <FlaskConical className="h-4 w-4 text-purple-500" />;
                      else if (result.category === "Announcements Board") icon = <Bell className="h-4 w-4 text-rose-500" />;
                      else if (result.category === "Academic Checklist") icon = <CheckSquare className="h-4 w-4 text-teal-500" />;
                      else if (result.category === "Faculty Profile") icon = <User className="h-4 w-4 text-blue-500" />;

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
                              {result.category} &bull; {result.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-500 text-xs font-semibold">
                      No faculty portal results found for "{globalSearchQuery}"
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
              <div
                className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  attendanceSuccess.toLowerCase().includes("error")
                    ? "bg-rose-50 border border-rose-200 text-rose-800"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-800"
                }`}
              >
                {attendanceSuccess.toLowerCase().includes("error") ? (
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                )}
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
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-3 gap-2 flex-1">
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
                            {Array.from({ length: getAttMaxDays(attMonth, attYear) }, (_, i) => (i + 1).toString())
                              .filter((d) => {
                                const today = new Date();
                                if (parseInt(attYear, 10) === today.getFullYear() && monthsList.indexOf(attMonth) === today.getMonth()) {
                                  return parseInt(d, 10) <= today.getDate();
                                }
                                return true;
                              })
                              .map((d) => (
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
                            {monthsList
                              .filter((m, idx) => {
                                const today = new Date();
                                if (parseInt(attYear, 10) === today.getFullYear()) {
                                  return idx <= today.getMonth();
                                }
                                return true;
                              })
                              .map((m) => (
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

                    {/* Calendar Pop-up Date Picker Button */}
                    <div className="relative flex-shrink-0" title="Pick date from calendar">
                      <div className="w-10 h-[42px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm transition pointer-events-none">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <input
                        type="date"
                        min="2026-01-01"
                        max={new Date().toISOString().split("T")[0]}
                        value={attendanceDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [y, m, d] = val.split("-");
                            const monthIndex = parseInt(m, 10) - 1;
                            const monthName = monthsList[monthIndex];
                            if (monthName) {
                              setAttYear(y);
                              setAttMonth(monthName);
                              setAttDay(parseInt(d, 10).toString());
                            }
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
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
                    {filteredStudentRoster.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm font-semibold">
                          No matching students found in class roster for "{globalSearchQuery}".
                        </td>
                      </tr>
                    ) : (
                      filteredStudentRoster.map((student) => (
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
                      ))
                    )}
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
                  ) : filteredResources.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                      No matching study resources found for "{globalSearchQuery}".
                    </div>
                  ) : (
                    filteredResources.map((res) => (
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

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleBookmark(res, "note")}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isBookmarked(res.id)
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                            }`}
                            title={isBookmarked(res.id) ? "Remove Bookmark" : "Bookmark Resource"}
                          >
                            <Bookmark size={14} fill={isBookmarked(res.id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                            title="Delete Resource"
                          >
                            <Trash2 size={16} />
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
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Due Date (DD / MM / YYYY)</label>
                        <div className="flex items-center gap-1.5">
                          <div className="grid grid-cols-3 gap-1.5 flex-1">
                            {/* Day Input & Dropdown */}
                            <div className="relative">
                              <input
                                type="text"
                                required
                                placeholder="DD"
                                value={dueDay}
                                onChange={(e) => handleDueDayChange(e.target.value)}
                                onFocus={() => setIsDueDayOpen(true)}
                                onBlur={handleDueDayBlur}
                                className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-center"
                              />
                              {isDueDayOpen && (
                                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                  {Array.from({ length: getDueMaxDays(dueMonth, dueYear) }, (_, i) => (i + 1).toString().padStart(2, "0")).map((d) => (
                                    <li
                                      key={d}
                                      onMouseDown={() => {
                                        setDueDay(d);
                                        setIsDueDayOpen(false);
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
                                value={dueMonth}
                                onChange={(e) => handleDueMonthChange(e.target.value)}
                                onFocus={() => setIsDueMonthOpen(true)}
                                onBlur={handleDueMonthBlur}
                                className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-center"
                              />
                              {isDueMonthOpen && (
                                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((m) => (
                                    <li
                                      key={m}
                                      onMouseDown={() => {
                                        setDueMonth(m);
                                        setIsDueMonthOpen(false);
                                        const maxDays = getDueMaxDays(m, dueYear);
                                        if (dueDay && parseInt(dueDay, 10) > maxDays) {
                                          setDueDay(maxDays.toString().padStart(2, "0"));
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
                                value={dueYear}
                                onChange={(e) => handleDueYearChange(e.target.value)}
                                onFocus={() => setIsDueYearOpen(true)}
                                onBlur={handleDueYearBlur}
                                className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-center"
                              />
                              {isDueYearOpen && (
                                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                                  {yearsList.map((y) => (
                                    <li
                                      key={y}
                                      onMouseDown={() => {
                                        setDueYear(y);
                                        setIsDueYearOpen(false);
                                        if (parseInt(dueMonth, 10) === 2) {
                                          const maxDays = getDueMaxDays("02", y);
                                          if (dueDay && parseInt(dueDay, 10) > maxDays) {
                                            setDueDay(maxDays.toString().padStart(2, "0"));
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

                          {/* Calendar Pop-up Date Picker Button */}
                          <div className="relative flex-shrink-0" title="Pick date from calendar">
                            <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm transition pointer-events-none">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <input
                              type="date"
                              min="2026-01-01"
                              value={assignDueDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  const [y, m, d] = val.split("-");
                                  setDueYear(y);
                                  setDueMonth(m);
                                  setDueDay(d);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
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
                    
                    <div className="flex items-center gap-2">
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
                      {activeAssignmentObj && (
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(activeAssignmentObj, "assignment")}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isBookmarked(activeAssignmentObj.id)
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                          }`}
                          title={isBookmarked(activeAssignmentObj.id) ? "Remove Bookmark" : "Bookmark Assignment"}
                        >
                          <Bookmark size={14} fill={isBookmarked(activeAssignmentObj.id) ? "currentColor" : "none"} />
                        </button>
                      )}
                    </div>
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
                    ) : filteredSubmissionsList.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                        No matching student submissions found for "{globalSearchQuery}".
                      </div>
                    ) : (
                      filteredSubmissionsList.map((sub) => (
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
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Publication Date  </label>
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
                  {researchPapers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                      No research publications logged yet.
                    </div>
                  ) : filteredResearchPapers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                      No matching research publications found for "{globalSearchQuery}".
                    </div>
                  ) : (
                    filteredResearchPapers.map((paper) => (
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

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleBookmark(paper, "research")}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isBookmarked(paper.id)
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                            }`}
                            title={isBookmarked(paper.id) ? "Remove Bookmark" : "Bookmark Publication"}
                          >
                            <Bookmark size={14} fill={isBookmarked(paper.id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => handleDeletePaper(paper.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                            title="Remove Publication"
                          >
                            <Trash2 size={16} />
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
                  {notices.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                      No notices broadcasted yet.
                    </div>
                  ) : filteredNotices.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                      No matching notices found for "{globalSearchQuery}".
                    </div>
                  ) : (
                    filteredNotices.map((notice) => (
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

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleBookmark(notice, "notice")}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isBookmarked(notice.id)
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                : "bg-white border-slate-200/40 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                            }`}
                            title={isBookmarked(notice.id) ? "Remove Bookmark" : "Bookmark Announcement"}
                          >
                            <Bookmark size={14} fill={isBookmarked(notice.id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                            title="Delete Notice"
                          >
                            <Trash2 size={16} />
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

        {/* --- TAB: MY BOOKMARKS --- */}
        {activeTab === "bookmarks" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Controls bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search saved bookmarks */}
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
                  { key: "notice", label: "Announcements" },
                  { key: "research", label: "Research" }
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
                <p className="text-sm mt-1">Items you bookmark across the Faculty Portal will show up here.</p>
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
                              : item.type === "research"
                                ? "bg-purple-50 text-purple-600 border-purple-100"
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

                      <h4 className="font-extrabold text-slate-800 text-base mb-1.5 leading-snug">{item.title}</h4>
                      {item.courseCode && (
                        <p className="text-xs text-indigo-600 font-bold mb-3">Subject: {item.courseCode}</p>
                      )}
                      {item.content && (
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 line-clamp-3">{item.content}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400">
                        {item.dueDate ? `Due: ${item.dueDate}` : item.category ? `Category: ${item.category}` : ""}
                      </span>
                      <button
                        onClick={() => {
                          if (item.type === "notice" || item.type === "announcement") {
                            setActiveTab("notices");
                          } else if (item.type === "note") {
                            setActiveTab("resources");
                          } else if (item.type === "assignment") {
                            setSelectedAssignForGrading(item.itemId);
                            setActiveTab("assignments");
                          } else if (item.type === "research") {
                            setActiveTab("research");
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                      >
                        View &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      {/* Attendance Confirmation & Absentee Preview Modal */}
      {showAttendanceConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                  Review Absentees Before Submit
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Course: <span className="font-extrabold text-slate-700">{attendanceCourse}</span> &bull; Date: <span className="font-extrabold text-slate-700">{attendanceDate}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttendanceConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Roster Stats Summary */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Total</span>
                <span className="font-black text-slate-800 text-sm">{studentRoster.length}</span>
              </div>
              <div>
                <span className="block text-emerald-600 font-bold uppercase text-[10px]">Present</span>
                <span className="font-black text-emerald-700 text-sm">{studentRoster.filter(s => s.present).length}</span>
              </div>
              <div>
                <span className="block text-rose-500 font-bold uppercase text-[10px]">Absent</span>
                <span className="font-black text-rose-600 text-sm">{studentRoster.filter(s => !s.present).length}</span>
              </div>
            </div>

            {/* Absentees List with USN & Interactive Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Absentees List ({studentRoster.filter(s => !s.present).length})
              </label>

              {studentRoster.filter(s => !s.present).length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  All students are marked Present! Zero Absentees.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {studentRoster
                    .filter((s) => !s.present)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition"
                      >
                        <div>
                          <span className="block text-xs font-bold text-slate-800">{s.name}</span>
                          <span className="text-[10px] font-extrabold text-slate-500 font-mono tracking-wider">USN: {s.id}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(s.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 flex items-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Mark Present
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAttendanceConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmitAttendance}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm & Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}