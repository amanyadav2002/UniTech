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
} from "lucide-react";

export default function Students({ onOpenAuth }) {
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
      description:
        "Monitor attendance records and maintain eligibility for examinations.",
    },
    {
      icon: <ClipboardList size={34} />,
      title: "Results",
      description:
        "Access semester results, internal marks, and academic performance.",
    },
    {
      icon: <BookOpen size={34} />,
      title: "Course Registration",
      description:
        "Register electives and manage semester course selections.",
    },
    {
      icon: <Library size={34} />,
      title: "Digital Library",
      description:
        "Explore books, journals, research papers, and online resources.",
    },
    {
      icon: <Laptop size={34} />,
      title: "E-Learning",
      description:
        "Attend online lectures, access notes, and submit assignments.",
    },
    {
      icon: <Bell size={34} />,
      title: "Notices",
      description:
        "Stay informed with university announcements and upcoming events.",
    },
  ];

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

                <button className="mt-6 flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800">
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