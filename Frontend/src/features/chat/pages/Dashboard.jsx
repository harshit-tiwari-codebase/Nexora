import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, MessageSquare, Settings, LayoutGrid, LogOut, ChevronDown } from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const { logoutUser } = useAuth();

  const navItems = [
    { label: 'Overview', icon: LayoutGrid, href: '#overview' },
    { label: 'Messages', icon: MessageSquare, href: '#messages' },
  ];

  const handleLogout = async () => {
    const res = await logoutUser();

    if (res.success) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#overview" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="rounded-full bg-violet-600/20 p-2 text-violet-300">
              <Sparkles size={18} />
            </span>
            Nexora
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {navItems.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
              >
                <Icon size={16} />
                {label}
              </a>
            ))}

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition hover:text-white"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
              >
                <Settings size={16} />
                Settings
                <ChevronDown size={14} />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl shadow-black/30">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-zinc-800 hover:text-red-300"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 md:block">
              {user?.username || user?.name || 'Welcome'}
            </div>
            <button
              type="button"
              className="rounded-full border border-zinc-800 p-2 text-zinc-200 md:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={16} />
                  {label}
                </a>
              ))}

              <button
                type="button"
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </span>
                <ChevronDown size={14} />
              </button>

              {isSettingsOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSettingsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}

              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                {user?.username || user?.name || 'Welcome'}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main id="overview" className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Welcome back, {user?.username || user?.name || 'there'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
            Your workspace is ready. Use the navigation above to jump between sections.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Logged in account
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-zinc-500">Username</p>
                <p className="text-lg font-semibold text-white">{user?.username || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Email</p>
                <p className="text-lg font-semibold text-white">{user?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Status</p>
                <p className="text-lg font-semibold text-emerald-400">{user?.verified ? 'Verified' : 'Pending verification'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Quick actions
            </p>
            <div className="mt-4 space-y-3">
              <button className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-violet-500/40 hover:text-white">
                <span>Open workspace</span>
                <span className="text-violet-400">→</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-violet-500/40 hover:text-white">
                <span>View messages</span>
                <span className="text-violet-400">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
