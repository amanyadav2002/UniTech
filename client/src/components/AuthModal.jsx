import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Shield,
  Phone,
  Hash,
  Building,
  Droplet,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, defaultTab = "login", defaultRole = "student" }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);
  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states - Auth fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form states - Custom profile fields
  const [customId, setCustomId] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  
  // Custom DOB picker states
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysList = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const yearsList = Array.from({ length: 80 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Synchronize separate custom fields with main dob state
  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      const monthNum = monthsList.indexOf(dobMonth) + 1;
      if (monthNum > 0) {
        const formattedMonth = monthNum.toString().padStart(2, "0");
        const formattedDay = dobDay.padStart(2, "0");
        setDob(`${dobYear}-${formattedMonth}-${formattedDay}`);
      } else {
        setDob("");
      }
    } else {
      setDob("");
    }
  }, [dobDay, dobMonth, dobYear]);

  // DOB validation helper to compute max days
  const getMaxDays = (monthName, yearString) => {
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

  // DOB Input Change Handlers
  const handleDayChange = (val) => {
    if (val === "") {
      setDobDay("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    const dayNum = parseInt(val, 10);
    const maxDays = getMaxDays(dobMonth, dobYear);
    if (dayNum <= maxDays) {
      setDobDay(val);
    }
  };

  const handleMonthChange = (val) => {
    if (val === "") {
      setDobMonth("");
      return;
    }
    if (!/^[a-zA-Z]+$/.test(val)) return;
    setDobMonth(val);
  };

  const handleYearChange = (val) => {
    if (val === "") {
      setDobYear("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    if (val.length > 4) return;
    setDobYear(val);
  };

  // DOB Input Blur Handlers
  const handleDayBlur = () => {
    setTimeout(() => {
      setIsDayOpen(false);
      if (dobDay) {
        const dayNum = parseInt(dobDay, 10);
        if (isNaN(dayNum) || dayNum < 1) {
          setDobDay("");
        } else {
          setDobDay(dayNum.toString());
        }
      }
    }, 200);
  };

  const handleMonthBlur = () => {
    setTimeout(() => {
      setIsMonthOpen(false);
      if (dobMonth) {
        const matchedMonth = monthsList.find(
          (m) => m.toLowerCase() === dobMonth.toLowerCase()
        );
        if (matchedMonth) {
          setDobMonth(matchedMonth);
          // Adjust Day if it exceeds new Month's max days
          const maxDays = getMaxDays(matchedMonth, dobYear);
          if (dobDay && parseInt(dobDay, 10) > maxDays) {
            setDobDay(maxDays.toString());
          }
        } else {
          setDobMonth("");
        }
      }
    }, 200);
  };

  const handleYearBlur = () => {
    setTimeout(() => {
      setIsYearOpen(false);
      if (dobYear) {
        const yrNum = parseInt(dobYear, 10);
        const currentYr = new Date().getFullYear();
        if (isNaN(yrNum) || yrNum < 1900 || yrNum > currentYr) {
          setDobYear("");
        } else {
          setDobYear(yrNum.toString());
          // Leap year adjustment
          if (dobMonth.toLowerCase() === "february") {
            const maxDays = getMaxDays("february", yrNum.toString());
            if (dobDay && parseInt(dobDay, 10) > maxDays) {
              setDobDay(maxDays.toString());
            }
          }
        }
      }
    }, 200);
  };

  // Year and Semester synchronization helpers
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

  const handleYearSelection = (selectedYear) => {
    setYear(selectedYear);
    // Clear semester if it is incompatible with the newly selected year
    if (selectedYear === "1st Year" && !["1st Sem", "2nd Sem"].includes(semester)) {
      setSemester("");
    } else if (selectedYear === "2nd Year" && !["3rd Sem", "4th Sem"].includes(semester)) {
      setSemester("");
    } else if (selectedYear === "3rd Year" && !["5th Sem", "6th Sem"].includes(semester)) {
      setSemester("");
    } else if (selectedYear === "4th Year" && !["7th Sem", "8th Sem"].includes(semester)) {
      setSemester("");
    }
  };

  const handleSemesterSelection = (selectedSemester) => {
    setSemester(selectedSemester);
    // Automatically select the corresponding year
    const semLower = selectedSemester.toLowerCase();
    if (semLower.includes("1st") || semLower.includes("2nd")) {
      setYear("1st Year");
    } else if (semLower.includes("3rd") || semLower.includes("4th")) {
      setYear("2nd Year");
    } else if (semLower.includes("5th") || semLower.includes("6th")) {
      setYear("3rd Year");
    } else if (semLower.includes("7th") || semLower.includes("8th")) {
      setYear("4th Year");
    }
  };

  const [usn, setUsn] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [blood, setBlood] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");
  const [departments, setDepartments] = useState([]);
  const [semestersList, setSemestersList] = useState([]);

  // Auth Context hooks
  const { login, signup, socialCheck, socialLogin, socialSignup, loginWithGoogleToken } = useAuth();
  const [socialAuthData, setSocialAuthData] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Synchronize initial tab and role when modal opens, and clear previous fields/errors
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setRole(defaultRole);
      setLocalError(null);
      setSocialAuthData(null);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreeTerms(false);
      setCustomId("");
      setAge("");
      setPhone("");
      setDob("");
      setDobDay("");
      setDobMonth("");
      setDobYear("");
      setIsDayOpen(false);
      setIsMonthOpen(false);
      setIsYearOpen(false);
      setUsn("");
      setYear("");
      setSemester("");
      setBlood("");
      setDepartment("");
      setSalary("");
    }
  }, [isOpen, defaultTab, defaultRole]);

  // Load dynamic department and semester lists from public endpoints when modal is open
  useEffect(() => {
    if (isOpen) {
      const loadLookupData = async () => {
        try {
          const deptRes = await fetch(`${API_BASE_URL}/auth/departments`);
          if (deptRes.ok) {
            const deptData = await deptRes.json();
            setDepartments(deptData.departments || []);
          }
          const semRes = await fetch(`${API_BASE_URL}/auth/semesters`);
          if (semRes.ok) {
            const semData = await semRes.json();
            setSemestersList(semData.semesters || []);
          }
        } catch (err) {
          console.error("Failed to load signup lookup data:", err);
        }
      };
      loadLookupData();
    }
  }, [isOpen]);

  // Lock scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Listen to Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Google Credential Response Callback
  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;
    setLocalError(null);
    setLoading(true);
    try {
      const res = await loginWithGoogleToken(idToken);
      if (res.exists) {
        // User exists and logged in successfully!
        onClose();
        const loggedInUser = res.user;
        if (loggedInUser.role === "student") {
          navigate("/students");
        } else if (loggedInUser.role === "faculty") {
          navigate("/faculty");
        } else if (loggedInUser.role === "admin") {
          navigate("/admin");
        }
      } else {
        // New user! Go to complete profile screen
        setSocialAuthData({
          provider: "google",
          email: res.email,
          name: res.name,
          providerId: res.googleId,
        });
        setName(res.name || "");
        setEmail(res.email);
        setTab("social-signup");
        setRole("student");
      }
    } catch (err) {
      setLocalError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize and Render Google Sign-In Button
  useEffect(() => {
    if (isOpen && window.google && tab !== "social-signup") {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "422348845354-706a2hbhkq9931gfi8fg509mbuqc2760.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        // Delay slightly to ensure DOM element exists
        setTimeout(() => {
          const btnParent = document.getElementById("google-signin-button");
          if (btnParent) {
            window.google.accounts.id.renderButton(
              btnParent,
              {
                theme: "outline",
                size: "large",
                width: btnParent.offsetWidth || 380,
                text: "continue_with",
                shape: "pill"
              }
            );
          }
        }, 100);
      } catch (err) {
        console.error("Failed to initialize Google Sign In:", err);
      }
    }
  }, [isOpen, tab]);

  // Listen to message events from social oauth popup (for GitHub simulator)
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data && event.data.type === "oauth-success") {
        const { provider, email, name: oAuthName, id } = event.data;
        if (provider !== "github") return; // Google is handled natively
        setLocalError(null);
        setLoading(true);
        try {
          const checkRes = await socialCheck(email);
          if (checkRes.exists) {
            const loggedInUser = await socialLogin(email, provider, id);
            onClose();
            if (loggedInUser.role === "student") {
              navigate("/students");
            } else if (loggedInUser.role === "faculty") {
              navigate("/faculty");
            } else if (loggedInUser.role === "admin") {
              navigate("/admin");
            }
          } else {
            setSocialAuthData({ provider, email, name: oAuthName, providerId: id });
            setName(oAuthName || "");
            setEmail(email);
            setTab("social-signup");
            setRole("student");
          }
        } catch (err) {
          setLocalError(err.message || "Social authentication failed.");
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [socialCheck, socialLogin, navigate, onClose]);

  const handleSocialClick = (provider) => {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `${window.location.origin}/oauth-simulator.html?provider=${provider}`,
      `Simulated ${provider} Login`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (popup) popup.focus();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (tab === "signup" && password !== confirmPassword) {
      setLocalError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password, role);
      } else if (tab === "signup") {
        const signupData = {
          name,
          email,
          password,
          role,
          id: customId,
          age: Number(age),
          phone,
          dob,
        };

        if (role === "student") {
          signupData.usn = usn;
          signupData.year = year;
          signupData.semester = semester;
          signupData.blood = blood;
          signupData.department = department;
        } else if (role === "faculty") {
          signupData.department = department;
          signupData.salary = Number(salary);
        }

        await signup(signupData);
      } else if (tab === "social-signup") {
        const signupData = {
          name: name || (socialAuthData && socialAuthData.name) || "Social User",
          email: socialAuthData.email,
          role,
          provider: socialAuthData.provider,
          providerId: socialAuthData.providerId,
          id: customId,
          age: Number(age),
          phone,
          dob,
        };

        if (role === "student") {
          signupData.usn = usn;
          signupData.year = year;
          signupData.semester = semester;
          signupData.blood = blood;
          signupData.department = department;
        } else if (role === "faculty") {
          signupData.department = department;
          signupData.salary = Number(salary);
        }

        await socialSignup(signupData);
      }
      onClose();
      if (role === "student") {
        navigate("/students");
      } else if (role === "faculty") {
        navigate("/faculty");
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "security") {
        navigate("/security");
      }
    } catch (err) {
      setLocalError(err.message || "Authentication failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "student",
      label: "Student",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      id: "faculty",
      label: "Faculty",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      id: "admin",
      label: "Admin",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  // Admin and Security are only selectable on Login, not Sign Up
  const filteredRoles = tab === "login" ? roles : roles.filter((r) => r.id !== "admin" && r.id !== "security");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className={`relative w-full transition-all duration-300 ${tab === "signup" || tab === "social-signup" ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Header decoration banner */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 shrink-0"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable container */}
        <div className="overflow-y-auto px-6 pt-7 pb-6 flex-1 scrollbar-thin">
          {/* Logo & Headline */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-1">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">UniTech</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {tab === "login" ? "Welcome Back" : tab === "social-signup" ? "Complete Your Profile" : "Create an Account"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tab === "login"
                ? "Enter your credentials to access your dashboard"
                : tab === "social-signup"
                  ? `Linked ${socialAuthData?.provider === "google" ? "Google" : "GitHub"} account: ${socialAuthData?.email}`
                  : "Join UniTech portal to start managing academic tasks"}
            </p>
          </div>

          {/* Back Button for Social Signup */}
          {tab === "social-signup" && (
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setSocialAuthData(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold mb-2 inline-flex items-center gap-1 focus:outline-none"
            >
              &larr; Back to Sign In
            </button>
          )}

          {/* Login / Sign Up Tabs */}
          {tab !== "social-signup" && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                onClick={() => {
                  setTab("login");
                  setLocalError(null);
                  // Reset role to student if current role was admin and we switch tabs
                  if (role === "admin") setRole("student");
                }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setTab("signup");
                  setLocalError(null);
                  setRole("student");
                }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === "signup"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {localError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-100">
                {localError}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                I am a
              </span>
              <div className={`grid ${tab === "login" ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                {filteredRoles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-semibold transition-all ${
                      role === r.id
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {r.icon}
                    <span className="mt-1">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form layout */}
            <div className={tab === "signup" || tab === "social-signup" ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" : "space-y-3"}>
              {/* Name Input (Sign Up / Social Signup Only) */}
              {(tab === "signup" || tab === "social-signup") && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email/Identifier Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {tab === "signup" || tab === "social-signup"
                    ? "Email Address"
                    : role === "student"
                      ? "Email Address or USN"
                      : role === "faculty"
                        ? "Email Address or ID"
                        : "Email Address"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type={tab === "signup" || tab === "social-signup" ? "email" : "text"}
                    required
                    disabled={tab === "social-signup"}
                    placeholder={
                      tab === "signup" || tab === "social-signup"
                        ? "name@university.edu"
                        : role === "student"
                          ? "e.g. anubhav@unitech.edu or 1RI23CS185"
                          : role === "faculty"
                            ? "e.g. faculty@unitech.edu or CS001"
                            : "name@university.edu"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input */}
              {tab !== "social-signup" && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    {tab === "login" && (
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Forgot password mechanism is not implemented.");
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Sign Up Only) */}
              {tab === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Profile fields (Sign Up or Social Signup) */}
              {(tab === "signup" || tab === "social-signup") && (
                <>
                  {/* Custom ID */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      {role === "student" ? "Student ID" : "Employee ID"}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Hash className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={role === "student" ? "e.g. STU123" : "e.g. EMP123"}
                        value={customId}
                        onChange={(e) => setCustomId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Age
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Hash className="h-5 w-5" />
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 20"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Phone className="h-5 w-5" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Day Input & Dropdown */}
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Day"
                          value={dobDay}
                          onChange={(e) => handleDayChange(e.target.value)}
                          onFocus={() => setIsDayOpen(true)}
                          onBlur={handleDayBlur}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-semibold"
                        />
                        {isDayOpen && (
                          <ul className="absolute z-[110] w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                            {daysList
                              .filter((d) => d.includes(dobDay))
                              .map((d) => (
                                <li
                                  key={d}
                                  onMouseDown={() => {
                                    setDobDay(d);
                                    setIsDayOpen(false);
                                  }}
                                  className="px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-xs font-semibold"
                                >
                                  {d}
                                </li>
                              ))}
                            {daysList.filter((d) => d.includes(dobDay)).length === 0 && (
                              <li className="px-3 py-1.5 text-slate-400 text-xs font-semibold">No matches</li>
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
                          value={dobMonth}
                          onChange={(e) => handleMonthChange(e.target.value)}
                          onFocus={() => setIsMonthOpen(true)}
                          onBlur={handleMonthBlur}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-semibold"
                        />
                        {isMonthOpen && (
                          <ul className="absolute z-[110] w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                            {monthsList
                              .filter((m) => m.toLowerCase().includes(dobMonth.toLowerCase()))
                              .map((m) => (
                                <li
                                  key={m}
                                  onMouseDown={() => {
                                    setDobMonth(m);
                                    setIsMonthOpen(false);
                                    // Cap Day if it exceeds maximum days for selected month
                                    const maxDays = getMaxDays(m, dobYear);
                                    if (dobDay && parseInt(dobDay, 10) > maxDays) {
                                      setDobDay(maxDays.toString());
                                    }
                                  }}
                                  className="px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-xs font-semibold"
                                >
                                  {m}
                                </li>
                              ))}
                            {monthsList.filter((m) => m.toLowerCase().includes(dobMonth.toLowerCase())).length === 0 && (
                              <li className="px-3 py-1.5 text-slate-400 text-xs font-semibold">No matches</li>
                            )}
                          </ul>
                        )}
                      </div>

                      {/* Year Input & Dropdown */}
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Year"
                          value={dobYear}
                          onChange={(e) => handleYearChange(e.target.value)}
                          onFocus={() => setIsYearOpen(true)}
                          onBlur={handleYearBlur}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-semibold"
                        />
                        {isYearOpen && (
                          <ul className="absolute z-[110] w-full bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto mt-1 shadow-lg scrollbar-thin">
                            {yearsList
                              .filter((y) => y.includes(dobYear))
                              .map((y) => (
                                <li
                                  key={y}
                                  onMouseDown={() => {
                                    setDobYear(y);
                                    setIsYearOpen(false);
                                    // Adjust Feb day limit if year changes
                                    if (dobMonth.toLowerCase() === "february") {
                                      const maxDays = getMaxDays("february", y);
                                      if (dobDay && parseInt(dobDay, 10) > maxDays) {
                                        setDobDay(maxDays.toString());
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-xs font-semibold"
                                >
                                  {y}
                                </li>
                              ))}
                            {yearsList.filter((y) => y.includes(dobYear)).length === 0 && (
                              <li className="px-3 py-1.5 text-slate-400 text-xs font-semibold">No matches</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student Specific Fields */}
                  {role === "student" && (
                    <>
                      {/* USN */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          USN
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <GraduationCap className="h-5 w-5" />
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 1RV21CS001"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Year */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Year
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <BookOpen className="h-5 w-5" />
                          </span>
                          <select
                            required
                            value={year}
                            onChange={(e) => handleYearSelection(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="" disabled>Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>

                      {/* Semester */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Semester
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <BookOpen className="h-5 w-5" />
                          </span>
                          <select
                            required
                            value={semester}
                            onChange={(e) => handleSemesterSelection(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="" disabled>Select Semester</option>
                            {semestersList.map((sem) => (
                              <option key={sem._id} value={sem.name}>{sem.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Department
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Building className="h-5 w-5" />
                          </span>
                          <select
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="" disabled>Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept._id} value={dept.name}>{dept.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Blood Group */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Blood Group
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Droplet className="h-5 w-5 text-red-500" />
                          </span>
                          <select
                            required
                            value={blood}
                            onChange={(e) => setBlood(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="" disabled>Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Teacher Specific Fields */}
                  {role === "faculty" && (
                    <>
                      {/* Department */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Department
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Building className="h-5 w-5" />
                          </span>
                          <select
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="" disabled>Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept._id} value={dept.name}>{dept.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Salary */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                          Monthly Salary (INR)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Hash className="h-5 w-5" />
                          </span>
                          <input
                            type="number"
                            required
                            min="0"
                            placeholder="e.g. 85000"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Remember Me / Terms & Conditions */}
            {tab === "login" ? (
              <div className="flex items-center pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-slate-600 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
            ) : (
              <div className="flex items-start pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-xs text-slate-500 leading-normal cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Terms & Conditions placeholder");
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Privacy Policy placeholder");
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 transition duration-200 active:scale-[0.98] text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : tab === "login" ? "Sign In" : tab === "social-signup" ? "Complete Registration" : "Create Account"}
            </button>
          </form>

          {tab !== "social-signup" && (
            <>
              {/* Social Logins */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div id="google-signin-button" className="w-full flex justify-center py-0.5 min-h-[40px] items-center"></div>
              </div>

              {/* Footer toggle switcher */}
              <div className="text-center mt-4 text-sm text-slate-600">
                {tab === "login" ? (
                  <>
                    New to UniTech?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("signup");
                        setRole("student");
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("login")}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
