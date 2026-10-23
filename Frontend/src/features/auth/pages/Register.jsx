import React, { useState, useEffect } from "react";
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import { setError } from "../services/auth.slice";
import NexoraLogo, { NexoraIcon } from "../../../components/NexoraLogo";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registerUser } = useAuth();

  const { error, isLoading } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password validation checks for real-time UX feedback
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await registerUser({ username, email, password });

    if (res.success) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#070B0D] text-white">
      {/* Ambient Lighting with User Color Palette */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#DB2D28]/10 blur-[140px]" />
        <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-[#40080A]/30 blur-[130px]" />
      </div>

      {/* Navbar */}
      <header className="flex h-18 items-center justify-between border-b border-[#41494F]/70 px-6 sm:px-10">
        <Link to="/">
          <NexoraLogo size="md" subtitle="AI Workspace" />
        </Link>

        <Link
          to="/login"
          className="rounded-full border border-[#41494F] px-4 py-1.5 text-xs font-mono font-medium text-[#6D7C83] transition hover:border-[#6D7C83] hover:text-white"
        >
          Sign In
        </Link>
      </header>

      {/* Register Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Card Box */}
          <div className="rounded-3xl border border-[#41494F] bg-[#070B0D]/90 p-8 shadow-2xl shadow-[#40080A]/20 backdrop-blur-xl sm:p-10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <NexoraIcon size={44} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-xs text-[#6D7C83] sm:text-sm">
                Get started with your intelligent AI developer workspace
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-[#DB2D28]/40 bg-[#40080A]/30 px-4 py-3 text-xs text-[#DB2D28]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium text-[#6D7C83]">
                  Username
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-[#6D7C83]" />
                  <input
                    type="text"
                    required
                    placeholder="learner101"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-[#41494F] bg-[#070B0D] py-3 pl-10 pr-4 text-sm text-white placeholder-[#6D7C83] outline-none transition focus:border-[#DB2D28]/60 focus:ring-2 focus:ring-[#DB2D28]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium text-[#6D7C83]">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-[#6D7C83]" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#41494F] bg-[#070B0D] py-3 pl-10 pr-4 text-sm text-white placeholder-[#6D7C83] outline-none transition focus:border-[#DB2D28]/60 focus:ring-2 focus:ring-[#DB2D28]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium text-[#6D7C83]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-[#6D7C83]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#41494F] bg-[#070B0D] py-3 pl-10 pr-11 text-sm text-white placeholder-[#6D7C83] outline-none transition focus:border-[#DB2D28]/60 focus:ring-2 focus:ring-[#DB2D28]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#6D7C83] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Real-time UX Password Strength Indicators */}
                {password.length > 0 && (
                  <div className="mt-2.5 rounded-xl border border-[#41494F]/80 bg-[#070B0D] p-3 font-mono text-[11px] space-y-1">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-[#DB2D28]" : "text-[#6D7C83]"}`}>
                      {hasMinLength ? <Check size={12} /> : <X size={12} />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-[#DB2D28]" : "text-[#6D7C83]"}`}>
                      {hasUppercase ? <Check size={12} /> : <X size={12} />}
                      <span>At least 1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-[#DB2D28]" : "text-[#6D7C83]"}`}>
                      {hasLowercase ? <Check size={12} /> : <X size={12} />}
                      <span>At least 1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-[#DB2D28]" : "text-[#6D7C83]"}`}>
                      {hasNumber ? <Check size={12} /> : <X size={12} />}
                      <span>At least 1 number (0-9)</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DB2D28] to-[#A41715] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#DB2D28]/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-8 border-t border-[#41494F]/60 pt-6 text-center text-xs text-[#6D7C83]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#DB2D28] transition hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
