import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  Search,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Institutions", path: "/institutions" },
  { name: "Students", path: "/students" },
  { name: "Faculty", path: "/faculty" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar({ onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <GraduationCap className="h-9 w-9 text-blue-600" />

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              UniTech Portal
            </h1>
            <p className="text-xs text-gray-500">
              Smart University Management
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-slate-700 hover:text-blue-600 transition"
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
                <span className="text-xs text-slate-500 capitalize">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth("login")}
                className="rounded-full p-2 hover:bg-gray-100 text-slate-700 hover:text-blue-600 transition-colors"
                title="Account"
              >
                <UserCircle className="h-7 w-7" />
              </button>

              <button
                onClick={() => onOpenAuth("login")}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 transition"
              >
                Login
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t bg-white lg:hidden">
          <ul className="space-y-4 px-6 py-5">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "block font-semibold text-blue-600"
                      : "block text-slate-700 hover:text-blue-600"
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}

            {user ? (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                  <UserCircle className="h-9 w-9 text-slate-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full rounded-lg bg-red-50 text-red-600 hover:bg-red-100 py-2 font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuth("login");
                }}
                className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}