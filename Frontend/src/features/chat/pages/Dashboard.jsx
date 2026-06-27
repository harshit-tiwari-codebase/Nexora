import React from "react";
import {
  Search,
  Bell,
  Settings,
  Sparkles,
  Clock,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-zinc-800 bg-[#09090B] lg:flex lg:flex-col">
        <div className="border-b border-zinc-800 p-6">
          <h1 className="text-2xl font-bold tracking-tight">Nexora</h1>
          <p className="mt-1 text-sm text-zinc-500">
            AI Productivity Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-black transition">
            <Sparkles size={20} />
            Dashboard
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
            <FileText size={20} />
            Projects
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
            <Clock size={20} />
            History
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <button className="w-full rounded-xl bg-white py-3 font-medium text-black transition hover:scale-[1.02]">
            Upgrade Plan
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-[#09090B]/90 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Welcome back. Continue building with AI.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-xl border border-zinc-800 p-3 transition hover:border-white">
              <Search size={20} />
            </button>

            <button className="rounded-xl border border-zinc-800 p-3 transition hover:border-white">
              <Bell size={20} />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-semibold text-black">
              H
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="space-y-8 p-6">
          {/* Hero */}
          <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                AI Workspace
              </p>

              <h1 className="mt-3 text-5xl font-bold leading-tight">
                Build faster with intelligent tools.
              </h1>

              <p className="mt-5 text-lg text-zinc-400">
                Organize projects, generate content, and collaborate seamlessly
                with AI-powered workflows.
              </p>

              <button className="mt-8 flex items-center gap-2 rounded-full bg-white px-6 py-4 font-medium text-black transition hover:scale-[1.02]">
                <Plus size={20} />
                Create Project
              </button>
            </div>
          </section>

          {/* Stats */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Projects",
                value: "12",
              },
              {
                title: "AI Generations",
                value: "284",
              },
              {
                title: "Storage",
                value: "2.4 GB",
              },
              {
                title: "Team Members",
                value: "5",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <p className="text-sm text-zinc-500">{item.title}</p>

                <h3 className="mt-4 text-4xl font-bold">{item.value}</h3>
              </div>
            ))}
          </section>

          {/* Recent Activity */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <h2 className="text-xl font-semibold">Recent Activity</h2>

              <button className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-zinc-800">
              {[
                "Generated a project summary using AI.",
                "Created a new workspace.",
                "Uploaded project documents.",
                "Updated profile information.",
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div>
                    <p className="font-medium">{activity}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Today • 2 mins ago
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-zinc-500"
                  />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;