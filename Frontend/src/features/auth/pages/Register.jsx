import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const { registerUser } = useAuth();

  const { error, isLoading } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await registerUser({
      username,
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
        <Link to="/" className="text-2xl font-semibold tracking-tight">
          Nexora
        </Link>

        <Link
          to="/login"
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm transition hover:border-white"
        >
          Login
        </Link>
      </header>

      {/* Register */}
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center justify-center px-6">
        <div className="w-full max-w-md">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Join Nexora
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Create your
            <br />
            account.
          </h1>

          <p className="mt-5 text-zinc-500">
            Start building, researching and creating with AI in one workspace.
          </p>

          {/* Error */}
          {error && (
            <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-zinc-700 bg-transparent py-4 text-lg outline-none transition placeholder:text-zinc-600 focus:border-white"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-zinc-700 bg-transparent py-4 text-lg outline-none transition placeholder:text-zinc-600 focus:border-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-zinc-700 bg-transparent py-4 text-lg outline-none transition placeholder:text-zinc-600 focus:border-white"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm">
            <p className="text-zinc-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="text-zinc-400 transition hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;