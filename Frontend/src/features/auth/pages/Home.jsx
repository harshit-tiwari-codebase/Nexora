import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Nexora
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm transition hover:border-zinc-500"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
          <Sparkles size={16} />
          AI Workspace for Developers
        </div>

        <h1 className="max-w-5xl text-5xl font-bold leading-none tracking-tight md:text-7xl lg:text-8xl">
          Build with AI,
          <br />
          <span className="text-zinc-400">without the complexity.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-500">
          Nexora is your intelligent workspace for writing, coding,
          brainstorming, debugging, and building software faster.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-medium text-black transition hover:scale-[1.02]"
          >
            Start Free
            <ArrowRight size={18} />
          </Link>

          <button className="rounded-full border border-zinc-700 px-7 py-3 transition hover:bg-zinc-900">
            View Demo
          </button>
        </div>

        {/* AI Preview */}
        <div className="mt-24 w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          {/* Window Header */}
          <div className="flex items-center gap-2 border-b border-zinc-800 px-6 py-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />

            <div className="ml-auto rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              Gemini 2.5 Flash
            </div>
          </div>

          {/* Chat */}
          <div className="space-y-6 p-8 text-left">
            <div className="ml-auto max-w-lg rounded-2xl bg-zinc-900 px-5 py-4">
              <p className="text-zinc-300">
                Create an Express authentication system using JWT and MongoDB.
              </p>
            </div>

            <div className="max-w-xl rounded-2xl border border-zinc-800 bg-[#111113] px-5 py-4">
              <p className="mb-4 text-zinc-300">
                Here's a production-ready authentication flow:
              </p>

              <ul className="space-y-2 text-zinc-400">
                <li>✓ JWT Authentication</li>
                <li>✓ Refresh Tokens</li>
                <li>✓ Email Verification</li>
                <li>✓ Password Hashing</li>
                <li>✓ Protected Routes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-6 border-t border-zinc-800 py-12 md:grid-cols-3">
          <div>
            <h2 className="text-3xl font-bold">10x</h2>
            <p className="mt-2 text-zinc-500">
              Faster development workflow
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">24/7</h2>
            <p className="mt-2 text-zinc-500">
              AI assistance whenever you need it
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">∞</h2>
            <p className="mt-2 text-zinc-500">
              Unlimited ideas and possibilities
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;