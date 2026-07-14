import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Logo */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-white">
                UniTech Portal
              </h2>
            </div>

            <p className="text-gray-400">
              A modern University Management Portal built using
              React, Vite and Tailwind CSS.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Home</a></li>
              <li><a href="#" className="hover:text-blue-400">Academics</a></li>
              <li><a href="#" className="hover:text-blue-400">Students</a></li>
              <li><a href="#" className="hover:text-blue-400">Faculty</a></li>
              <li><a href="#" className="hover:text-blue-400">Attendance</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <MapPin className="text-blue-500" size={18} />
                Bengaluru, Karnataka
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-blue-500" size={18} />
                +91 9876543210
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-blue-500" size={18} />
                info@unitech.edu
              </div>

            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Newsletter
            </h3>

            <p className="mb-4 text-gray-400">
              Subscribe for university updates.
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-blue-500"
            />

            <button className="mt-3 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
              Subscribe
            </button>
          </div>

        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} UniTech Portal. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}