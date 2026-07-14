import {
  Building2,
  Target,
  Eye,
  Users,
  GraduationCap,
  Trophy,
  Library,
  Laptop,
  FlaskConical,
} from "lucide-react";

export default function Institution() {
  const stats = [
    { title: "Students", value: "5,200+" },
    { title: "Faculty", value: "320+" },
    { title: "Courses", value: "48+" },
    { title: "Placement", value: "95%" },
  ];

  const facilities = [
    {
      icon: <Library size={34} />,
      title: "Central Library",
      desc: "A modern library with thousands of books, journals, and digital resources.",
    },
    {
      icon: <Laptop size={34} />,
      title: "Computer Labs",
      desc: "High-performance computing labs equipped with the latest technologies.",
    },
    {
      icon: <FlaskConical size={34} />,
      title: "Research Labs",
      desc: "Advanced laboratories supporting innovation and research.",
    },
    {
      icon: <GraduationCap size={34} />,
      title: "Career Development",
      desc: "Placement training, internships, and career guidance programs.",
    },
  ];

  return (
    <div className="bg-slate-50">

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Building2 className="mx-auto mb-5 h-16 w-16" />

          <h1 className="text-5xl font-bold">
            About Our Institution
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100">
            UniTech Portal represents a modern university committed to
            academic excellence, innovation, research, and holistic
            student development.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-6 py-20">

        <h2 className="mb-8 text-4xl font-bold text-slate-800">
          About UniTech
        </h2>

        <p className="leading-8 text-gray-600">
          UniTech is dedicated to delivering world-class education through
          innovative teaching methods, industry collaboration, research,
          and technology-driven learning. We nurture future professionals
          who contribute positively to society and the global workforce.
        </p>

      </section>

      {/* Vision & Mission */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">

          <div className="rounded-2xl bg-blue-50 p-8 shadow">
            <Eye className="mb-4 text-blue-600" size={40} />
            <h3 className="mb-3 text-2xl font-bold">
              Vision
            </h3>

            <p className="text-gray-600 leading-7">
              To become a globally recognized institution that empowers
              students through quality education, research, innovation,
              and ethical values.
            </p>
          </div>

          <div className="rounded-2xl bg-indigo-50 p-8 shadow">
            <Target className="mb-4 text-indigo-600" size={40} />
            <h3 className="mb-3 text-2xl font-bold">
              Mission
            </h3>

            <p className="text-gray-600 leading-7">
              To provide student-centered learning, promote innovation,
              strengthen industry partnerships, and encourage lifelong
              learning opportunities.
            </p>
          </div>

        </div>
      </section>

      {/* Statistics */}
      <section className="mx-auto max-w-6xl px-6 py-20">

        <h2 className="mb-10 text-center text-4xl font-bold">
          University at a Glance
        </h2>

        <div className="grid gap-6 md:grid-cols-4">

          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-8 text-center shadow"
            >
              <h3 className="text-4xl font-bold text-blue-600">
                {item.value}
              </h3>

              <p className="mt-3 text-gray-600">
                {item.title}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* Facilities */}
      <section className="bg-white py-20">

        <div className="mx-auto max-w-6xl px-6">

          <h2 className="mb-12 text-center text-4xl font-bold">
            Campus Facilities
          </h2>

          <div className="grid gap-8 md:grid-cols-2">

            {facilities.map((facility) => (
              <div
                key={facility.title}
                className="rounded-2xl border bg-slate-50 p-8 transition hover:shadow-xl"
              >
                <div className="mb-4 text-blue-600">
                  {facility.icon}
                </div>

                <h3 className="mb-3 text-2xl font-semibold">
                  {facility.title}
                </h3>

                <p className="text-gray-600">
                  {facility.desc}
                </p>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* Leadership */}
      <section className="mx-auto max-w-6xl px-6 py-20">

        <h2 className="mb-10 text-center text-4xl font-bold">
          Leadership
        </h2>

        <div className="grid gap-8 md:grid-cols-3">

          {["Chancellor", "Vice Chancellor", "Principal"].map((role) => (
            <div
              key={role}
              className="rounded-2xl bg-white p-8 text-center shadow"
            >
              <Users className="mx-auto mb-4 text-blue-600" size={48} />

              <h3 className="text-xl font-bold">
                {role}
              </h3>

              <p className="mt-2 text-gray-500">
                Name Placeholder
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* Achievements */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-20 text-white">

        <div className="mx-auto max-w-6xl px-6 text-center">

          <Trophy className="mx-auto mb-6 h-16 w-16" />

          <h2 className="mb-6 text-4xl font-bold">
            Achievements
          </h2>

          <p className="mx-auto max-w-4xl text-lg text-blue-100 leading-8">
            Ranked among the leading universities for academic excellence,
            innovation, placements, and research with multiple national
            awards and international collaborations.
          </p>

        </div>

      </section>

    </div>
  );
}