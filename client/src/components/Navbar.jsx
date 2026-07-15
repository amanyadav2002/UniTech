import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  Search,
  UserCircle,
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Institutions", path: "/institutions" },
  { name: "Students", path: "/students" },
  { name: "Faculty", path: "/faculty" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar({ onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);

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

            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth("login");
              }}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
            >
              Login
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
}