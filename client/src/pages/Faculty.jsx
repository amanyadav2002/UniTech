export default function Faculty() {
  return (
    <div className="min-h-screen px-6 py-20">

      <h1 className="text-center text-5xl font-bold">
        Faculty
      </h1>

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">

        <div className="rounded-xl bg-white p-8 shadow">
          Computer Science
        </div>

        <div className="rounded-xl bg-white p-8 shadow">
          Information Science
        </div>

        <div className="rounded-xl bg-white p-8 shadow">
          Electronics
        </div>

      </div>

    </div>
  );
}