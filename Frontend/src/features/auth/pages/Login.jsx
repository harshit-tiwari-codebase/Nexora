import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const { error, isLoading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await loginUser({
      email,
      password,
    });

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
        <Link to="/" className="text-2xl font-semibold tracking-tight">
          Nexora
        </Link>

        <Link
          to="/register"
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm transition hover:border-white"
        >
          Register
        </Link>
      </header>

      {/* Login */}
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center justify-center px-6">
        <div className="w-full max-w-md">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Welcome Back
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Sign in to
            <br />
            Nexora.
          </h1>

          <p className="mt-5 text-zinc-500">
            Continue your AI workspace and pick up exactly where you left off.
          </p>

          {/* Error */}
          {error && (
            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing In..." : "Login"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm">
            <button className="text-zinc-500 transition hover:text-white">
              Forgot password?
            </button>

            <Link
              to="/register"
              className="text-zinc-400 transition hover:text-white"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;