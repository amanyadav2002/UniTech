export default function Students() {
  return (
    <div className="min-h-screen px-6 py-20">

      <h1 className="text-center text-5xl font-bold">
        Students
      </h1>

      <div className="mx-auto mt-12 max-w-6xl grid gap-8 md:grid-cols-3">

        <div className="rounded-xl bg-white p-8 shadow">
          Student Profile
        </div>

        <div className="rounded-xl bg-white p-8 shadow">
          Attendance
        </div>

        <div className="rounded-xl bg-white p-8 shadow">
          Results
        </div>

      </div>

    </div>
  );
}