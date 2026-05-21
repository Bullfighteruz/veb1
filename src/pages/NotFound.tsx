import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-center text-white">
      <div>
        <div className="font-display text-7xl font-semibold tracking-tightest text-rev-green">
          404
        </div>
        <p className="mt-4 max-w-sm text-[15px] text-white/55">
          That route doesn't exist on Revu yet.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-medium text-ink-900 transition hover:bg-rev-green"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
