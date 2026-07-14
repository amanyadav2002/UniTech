import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  Bell,
  Award,
} from "lucide-react";

const features = [
  {
    icon: <Users size={32} />,
    title: "Student Management",
    description: "Manage student records, profiles, and enrollment."
  },
  {
    icon: <GraduationCap size={32} />,
    title: "Faculty Portal",
    description: "Faculty dashboard with attendance and course management."
  },
  {
    icon: <BookOpen size={32} />,
    title: "Course Management",
    description: "Create and manage departments, semesters, and subjects."
  },
  {
    icon: <ClipboardCheck size={32} />,
    title: "Attendance",
    description: "Real-time attendance monitoring and analytics."
  },
  {
    icon: <Bell size={32} />,
    title: "Notice Board",
    description: "Latest announcements and university events."
  },
  {
    icon: <Award size={32} />,
    title: "Results",
    description: "Publish and access examination results securely."
  },
];

export default function Home() {
  return (
    <div className="bg-slate-50">

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <h1 className="text-5xl font-bold">
            Welcome to <span className="text-yellow-300">UniTech</span> Portal
          </h1>

          <p className="mt-6 text-lg text-blue-100">
            A modern University Management System that simplifies
            academics, administration, attendance, examinations,
            and communication.
          </p>

          <div className="mt-10 flex justify-center gap-5">
            <button className="rounded-xl bg-white px-7 py-3 font-semibold text-blue-700 shadow-lg hover:bg-slate-100">
              Get Started
            </button>

            <button className="rounded-xl border border-white px-7 py-3 font-semibold hover:bg-white hover:text-blue-700">
              Learn More
            </button>
          </div>

        </div>
      </section>

      {/* Statistics */}

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-4">

        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-4xl font-bold text-blue-700">5000+</h2>
          <p className="mt-2 text-gray-600">Students</p>
        </div>

        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-4xl font-bold text-blue-700">250+</h2>
          <p className="mt-2 text-gray-600">Faculty</p>
        </div>

        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-4xl font-bold text-blue-700">100+</h2>
          <p className="mt-2 text-gray-600">Courses</p>
        </div>

        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-4xl font-bold text-blue-700">95%</h2>
          <p className="mt-2 text-gray-600">Placement Rate</p>
        </div>

      </section>

      {/* Features */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <h2 className="mb-12 text-center text-4xl font-bold">
          Portal Features
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-5 text-blue-700">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* Notice Section */}

      <section className="bg-blue-700 py-16 text-white">

        <div className="mx-auto max-w-5xl px-6">

          <h2 className="mb-8 text-center text-4xl font-bold">
            Latest Notices
          </h2>

          <div className="space-y-4">

            <div className="rounded-xl bg-white/10 p-5">
              📢 Semester Registration Starts from 20 August.
            </div>

            <div className="rounded-xl bg-white/10 p-5">
              📅 Mid-Semester Examination Schedule Released.
            </div>

            <div className="rounded-xl bg-white/10 p-5">
              💻 Smart India Hackathon Registration Open.
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}