import {
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
} from "lucide-react";

export default function Faculty({ onOpenAuth }) {
  const stats = [
    {
      title: "Faculty Members",
      value: "320+",
      icon: <Users size={36} />,
    },
    {
      title: "Departments",
      value: "12",
      icon: <Building2 size={36} />,
    },
    {
      title: "Research Papers",
      value: "850+",
      icon: <BookOpen size={36} />,
    },
    {
      title: "Awards",
      value: "120+",
      icon: <Award size={36} />,
    },
  ];

  const services = [
    {
      icon: <ClipboardCheck size={34} />,
      title: "Attendance Management",
      description:
        "Manage class attendance efficiently and generate attendance reports.",
    },
    {
      icon: <CalendarDays size={34} />,
      title: "Academic Schedule",
      description:
        "Access teaching schedules, semester calendars, and examination timetables.",
    },
    {
      icon: <FileText size={34} />,
      title: "Assignments",
      description:
        "Create assignments, evaluate submissions, and provide student feedback.",
    },
    {
      icon: <Laptop size={34} />,
      title: "Digital Classroom",
      description:
        "Upload lecture notes, presentations, videos, and learning resources.",
    },
    {
      icon: <FlaskConical size={34} />,
      title: "Research Portal",
      description:
        "Manage research projects, publications, grants, and collaborations.",
    },
    {
      icon: <Briefcase size={34} />,
      title: "Faculty Dashboard",
      description:
        "Track workload, courses, student progress, and administrative tasks.",
    },
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
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">

          <GraduationCap className="mx-auto mb-6 h-16 w-16" />

          <h1 className="text-5xl font-bold">
            Faculty Portal
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100">
            Empowering educators with modern teaching tools,
            research opportunities, academic resources,
            and seamless university management.
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

              <h2 className="text-4xl font-bold">
                {item.value}
              </h2>

              <p className="mt-2 text-gray-600">
                {item.title}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* Faculty Services */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-6">

          <h2 className="mb-12 text-center text-4xl font-bold">
            Faculty Services
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

      {/* Departments */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h2 className="mb-12 text-center text-4xl font-bold">
          Academic Departments
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {departments.map((dept) => (
            <div
              key={dept}
              className="rounded-xl bg-white p-6 shadow transition hover:bg-blue-600 hover:text-white"
            >
              <Building2 className="mb-4" size={34} />
              <h3 className="text-lg font-semibold">
                {dept}
              </h3>
            </div>
          ))}

        </div>

      </section>

      {/* Research */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-6xl px-6">

          <h2 className="mb-10 text-center text-4xl font-bold">
            Research & Innovation
          </h2>

          <div className="grid gap-8 md:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-8 shadow-lg">
              <FlaskConical className="mb-4 text-blue-600" size={40} />

              <h3 className="text-2xl font-bold">
                Research Labs
              </h3>

              <p className="mt-4 text-gray-600">
                Advanced laboratories supporting innovation,
                AI research, IoT, Robotics, and Cloud Computing.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-8 shadow-lg">
              <BookOpen className="mb-4 text-blue-600" size={40} />

              <h3 className="text-2xl font-bold">
                Publications
              </h3>

              <p className="mt-4 text-gray-600">
                Faculty publish research papers in leading
                national and international journals.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-8 shadow-lg">
              <Award className="mb-4 text-blue-600" size={40} />

              <h3 className="text-2xl font-bold">
                Awards & Recognition
              </h3>

              <p className="mt-4 text-gray-600">
                Recognized for excellence in teaching,
                innovation, research, and academic leadership.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="bg-blue-700 py-20 text-center text-white">

        <h2 className="text-4xl font-bold">
          Inspire the Next Generation
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
          Join our faculty community and contribute to world-class
          education, impactful research, and student success.
        </p>

        <button
          onClick={() => onOpenAuth("login", "faculty")}
          className="mt-8 rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 transition hover:bg-slate-100 duration-200 active:scale-[0.98]"
        >
          Faculty Login
        </button>

      </section>

    </div>
  );
}