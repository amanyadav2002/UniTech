export default function Contact() {
  return (
    <div className="min-h-screen px-6 py-20">

      <h1 className="text-center text-5xl font-bold">
        Contact Us
      </h1>

      <div className="mx-auto mt-12 max-w-3xl rounded-xl bg-white p-10 shadow">

        <input
          type="text"
          placeholder="Name"
          className="mb-4 w-full rounded-lg border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border p-3"
        />

        <textarea
          rows="5"
          placeholder="Message"
          className="mb-4 w-full rounded-lg border p-3"
        />

        <button className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Send Message
        </button>

      </div>

    </div>
  );
}