import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Task Board</h1>
        <p className="text-xl text-gray-600 mb-8">
          Set a goal. Let GPT-4o break it into tasks. Ship it on a kanban board.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
