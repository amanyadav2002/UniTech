import { useState, useEffect } from "react";
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
  Calendar,
  Phone,
  Hash,
  Building,
  Droplet,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, defaultTab = "login", defaultRole = "student" }) {
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
  const [usn, setUsn] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [blood, setBlood] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");

  // Auth Context hooks
  const { login, signup } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Synchronize initial tab and role when modal opens, and clear previous fields/errors
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setRole(defaultRole);
      setLocalError(null);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreeTerms(false);
      setCustomId("");
      setAge("");
      setPhone("");
      setDob("");
      setUsn("");
      setYear("");
      setSemester("");
      setBlood("");
      setDepartment("");
      setSalary("");
    }
  }, [isOpen, defaultTab, defaultRole]);

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
      } else {
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
        } else if (role === "faculty") {
          signupData.department = department;
          signupData.salary = Number(salary);
        }

        await signup(signupData);
      }
      onClose();
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
  ];

  // Admin is only selectable on Login, not Sign Up
  const filteredRoles = tab === "login" ? roles : roles.filter((r) => r.id !== "admin");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className={`relative w-full transition-all duration-300 ${tab === "signup" ? "max-w-2xl" : "max-w-md"} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200`}>
        
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
              {tab === "login" ? "Welcome Back" : "Create an Account"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tab === "login"
                ? "Enter your credentials to access your dashboard"
                : "Join UniTech portal to start managing academic tasks"}
            </p>
          </div>

          {/* Login / Sign Up Tabs */}
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
            <div className={tab === "signup" ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" : "space-y-3"}>
              {/* Name Input (Sign Up Only) */}
              {tab === "signup" && (
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

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
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

              {/* Profile fields (Sign Up Only) */}
              {tab === "signup" && (
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
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Calendar className="h-5 w-5" />
                      </span>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      />
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
                            onChange={(e) => setYear(e.target.value)}
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
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                          >
                            <option value="" disabled>Select Semester</option>
                            <option value="1st Sem">1st Sem</option>
                            <option value="2nd Sem">2nd Sem</option>
                            <option value="3rd Sem">3rd Sem</option>
                            <option value="4th Sem">4th Sem</option>
                            <option value="5th Sem">5th Sem</option>
                            <option value="6th Sem">6th Sem</option>
                            <option value="7th Sem">7th Sem</option>
                            <option value="8th Sem">8th Sem</option>
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
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Science">Information Science</option>
                            <option value="Electronics & Communication">Electronics & Communication</option>
                            <option value="Electrical & Electronics">Electrical & Electronics</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
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
              {loading ? "Processing..." : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Social Logins */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                alert("Google sign in simulator");
                onClose();
              }}
              className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition duration-150 font-semibold text-slate-700 text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.6 15.02 1 12 1 7.35 1 3.37 3.67 1.43 7.57l3.78 2.93c.9-2.7 3.4-4.46 6.79-4.46z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58v2.98h3.84c2.25-2.07 3.59-5.12 3.59-8.66z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.21 10.5c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.43 2.99C.52 4.8 0 6.84 0 9s.52 4.2 1.43 6.01l3.78-2.93z"
                />
                <path
                  fill="#34A853"
                  d="M12 18.96c3.24 0 5.97-1.07 7.9-2.92l-3.84-2.98c-1.12.75-2.56 1.2-4.06 1.2-3.39 0-5.89-1.76-6.79-4.46L1.43 12.7c1.94 3.9 5.92 6.57 10.57 6.57z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                alert("GitHub sign in simulator");
                onClose();
              }}
              className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition duration-150 font-semibold text-slate-700 text-sm"
            >
              <svg className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
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
        </div>
      </div>
    </div>
  );
}
