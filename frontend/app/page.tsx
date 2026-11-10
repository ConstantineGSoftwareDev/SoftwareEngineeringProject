import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
          OpenFest Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Host & Manage Outdoor Events
        </h1>
        <p className="text-base text-gray-600 dark:text-zinc-400">
          Create custom outdoor gatherings, manage capacity and tickets, monitor attendees, and toggle event sign-up availability in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors"
          >
            Go to Creator Dashboard →
          </Link>
          <Link
            href="/events/create"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-semibold text-sm transition-colors"
          >
            Create New Event
          </Link>
        </div>
      </div>
    </main>
  );
}
