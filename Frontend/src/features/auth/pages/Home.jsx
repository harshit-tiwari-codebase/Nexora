import React from "react";
import { ArrowRight, Sparkles, Code2, Zap, Shield, Bot, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import NexoraLogo, { NexoraIcon } from "../../../components/NexoraLogo";
import ThreeHeroCanvas from "../../../components/ThreeHeroCanvas";

const Home = () => {
  const user = useSelector((state) => state.auth?.user);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B0D] text-white">
      {/* Interactive 3D WebGL Three.js Canvas */}
      <ThreeHeroCanvas />

      {/* Subtle Ambient Radial Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#DB2D28]/15 via-[#A41715]/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#40080A]/30 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#41494F]/60 bg-[#070B0D]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/">
            <NexoraLogo size="md" subtitle="AI Workspace" />
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/app"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#DB2D28]/25 transition hover:brightness-110"
              >
                Go to Workspace
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-[#41494F] px-5 py-2 text-sm font-medium text-[#6D7C83] transition hover:border-[#6D7C83] hover:text-white"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#DB2D28]/30 transition hover:brightness-110"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-28 text-center sm:pt-28">
      

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
          Build software faster,{" "}
          <span className="bg-gradient-to-r from-[#DB2D28] via-[#A41715] to-[#6D7C83] bg-clip-text text-transparent">
            without limits.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-[#6D7C83] sm:text-lg">
          Nexora is your intelligent developer workspace for coding, architecture,
          debugging, and multi-turn conversations powered by Google Gemini.
        </p>

        <div className="mt-10 flex flex-col gap-3.5 sm:flex-row">
          {user ? (
            <Link
              to="/app"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-8 py-3.5 font-medium text-white shadow-xl shadow-[#DB2D28]/30 transition hover:scale-[1.02]"
            >
              Open Workspace
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-8 py-3.5 font-medium text-white shadow-xl shadow-[#DB2D28]/30 transition hover:scale-[1.02] hover:brightness-110"
            >
              Start Free Today
              <ArrowRight size={18} />
            </Link>
          )}

          <Link
            to={user ? "/app" : "/login"}
            className="flex items-center justify-center rounded-full border border-[#41494F] bg-[#070B0D]/80 px-8 py-3.5 font-medium text-[#6D7C83] backdrop-blur-sm transition hover:border-[#6D7C83] hover:text-white"
          >
            {user ? "View Conversations" : "Live Workspace Demo"}
          </Link>
        </div>

        {/* Feature Badges Grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl w-full text-left">
          <div className="rounded-2xl border border-[#41494F]/80 bg-[#070B0D]/70 p-4 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DB2D28]/15 text-[#DB2D28] mb-3">
              <Bot size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Gemini 2.5 Flash</h3>
            <p className="mt-1 text-xs text-[#6D7C83]">High-speed intelligence.</p>
          </div>

          <div className="rounded-2xl border border-[#41494F]/80 bg-[#070B0D]/70 p-4 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A41715]/20 text-[#DB2D28] mb-3">
              <Code2 size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Full Stack Ready</h3>
            <p className="mt-1 text-xs text-[#6D7C83]">Node, React & MongoDB.</p>
          </div>

          <div className="rounded-2xl border border-[#41494F]/80 bg-[#070B0D]/70 p-4 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#40080A]/60 text-[#DB2D28] mb-3">
              <Zap size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Context Memory</h3>
            <p className="mt-1 text-xs text-[#6D7C83]">Persistent chat history.</p>
          </div>

          <div className="rounded-2xl border border-[#41494F]/80 bg-[#070B0D]/70 p-4 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6D7C83]/20 text-[#6D7C83] mb-3">
              <Shield size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Secure Sessions</h3>
            <p className="mt-1 text-xs text-[#6D7C83]">HTTP-only JWT cookies.</p>
          </div>
        </div>

        {/* AI Workspace Mockup Preview */}
        <div className="mt-16 w-full max-w-5xl overflow-hidden rounded-3xl border border-[#41494F] bg-[#070B0D]/90 shadow-2xl shadow-[#40080A]/30 backdrop-blur-md">
          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-[#41494F]/80 bg-[#070B0D] px-6 py-3.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#DB2D28]" />
              <div className="h-3 w-3 rounded-full bg-[#6D7C83]/50" />
              <div className="h-3 w-3 rounded-full bg-[#41494F]" />
              <span className="ml-3 font-mono text-xs text-[#6D7C83]">nexora-terminal.sh</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#DB2D28]/30 bg-[#40080A]/50 px-3 py-1 font-mono text-xs text-[#DB2D28]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#DB2D28] animate-pulse" />
              WebGL Context Active
            </div>
          </div>

          {/* Chat Preview */}
          <div className="space-y-6 p-6 text-left sm:p-8">
            <div className="ml-auto max-w-lg rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#DB2D28] to-[#A41715] px-5 py-3.5 text-white shadow-lg shadow-[#DB2D28]/20">
              <p className="text-sm leading-relaxed">
                How do I implement JWT cookie authentication in Express and React?
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#070B0D] ring-1 ring-[#DB2D28]/50">
                <NexoraIcon size={20} />
              </div>
              <div className="max-w-xl rounded-2xl rounded-tl-xs border border-[#41494F]/80 bg-[#070B0D] p-5 shadow-md">
                <p className="mb-3 text-sm text-zinc-300">
                  Here is the recommended production architecture for cookie-based JWT sessions:
                </p>
                <div className="rounded-xl border border-[#41494F] bg-[#070B0D] p-3 font-mono text-xs text-[#DB2D28]">
                  <code>res.cookie("accessToken", token, &#123; httpOnly: true, sameSite: "lax" &#125;);</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
