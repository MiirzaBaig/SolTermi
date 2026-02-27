import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-terminal-bg text-text-primary flex flex-col items-center justify-center p-6 font-mono">
      <div className="border-3 border-border bg-panel-bg p-8 shadow-brutal max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-accent mb-2">404</h1>
        <p className="text-text-secondary font-semibold mb-6">This page could not be found.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 border-3 border-border bg-accent text-terminal-bg font-bold shadow-brutal-press hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200"
        >
          Back to SOL Terminal
        </Link>
      </div>
    </div>
  );
}
