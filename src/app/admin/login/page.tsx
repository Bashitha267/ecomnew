"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const result = await login(username, password);

    if (!result.success) {
      setErrorMessage(result.error || "Invalid credentials. Please try again.");
      setIsLoading(false);
      return;
    }

    if (result.role === "admin") {
      setSuccessMessage("Authentication successful. Redirecting to Admin Dashboard...");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } else {
      setErrorMessage("Access denied. This portal is for administrators only.");
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername("admin");
    setPassword("admin123");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased flex flex-col justify-between selection:bg-white selection:text-black">
      
      {/* Top Header Bar */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur z-10">
        <Link href="/" className="inline-block group">
          <span className="text-sm md:text-base font-extrabold tracking-[0.25em] uppercase font-display text-white group-hover:text-neutral-300 transition-colors">
            CARLTON VALLEY
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white flex items-center space-x-2 transition-colors border border-neutral-800 hover:border-neutral-600 px-3.5 py-1.5 rounded"
        >
          <ArrowLeft size={13} />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Left Column: Visual Brand Story Banner (Hidden on mobile) */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-neutral-950 flex-col justify-between p-8 overflow-hidden border-r border-neutral-800">
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
              alt="Carlton Valley Atelier"
              className="absolute inset-0 w-full h-full object-cover opacity-25 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider">
                <Shield size={11} />
                <span>Admin Gateway</span>
              </div>
              <h2 className="text-xl font-serif font-light text-white tracking-wide">
                Atelier Control & Inventory System
              </h2>
            </div>

            <div className="relative z-10 space-y-4 pt-20">
              <p className="text-xs font-serif text-neutral-400 leading-relaxed font-light">
                Manage live catalogue items, multi-color galleries, customer order fulfillment, and realtime sales performance reports.
              </p>

              {/* Demo Credentials Quick Pill Box */}
              <div className="bg-neutral-900/90 border border-neutral-700/60 p-3.5 rounded space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] text-neutral-300 font-semibold">
                  <span className="flex items-center space-x-1">
                    <KeyRound size={12} className="text-emerald-400" />
                    <span>Demo Credentials:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 underline uppercase"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-neutral-400 text-[11px] space-y-0.5">
                  <div>User: <strong className="text-white font-mono">admin</strong></div>
                  <div>Pass: <strong className="text-white font-mono">admin123</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-neutral-900/90">
            
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-serif font-light tracking-wide text-white">
                Admin Sign In
              </h1>
              <p className="text-xs text-neutral-400 font-sans">
                Please enter your credentials to authenticate and manage store operations.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start space-x-2 animate-fadeIn font-sans">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-6 p-3.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn font-sans">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <div>{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2.5 pl-9 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
                  >
                    Use &ldquo;admin123&rdquo;
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2.5 pl-9 pr-10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Help */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-white rounded border-neutral-700 bg-neutral-950"
                  />
                  <span className="text-neutral-400 text-[11px] font-mono">Remember session</span>
                </label>
                <span className="text-[11px] text-neutral-500 font-mono">v2.4 Secured</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-white text-black hover:bg-neutral-200 py-3 rounded text-xs uppercase font-serif tracking-[0.2em] font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill helper button on mobile */}
            <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center lg:hidden">
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-mono text-neutral-400 hover:text-white underline inline-flex items-center space-x-1"
              >
                <KeyRound size={12} className="text-emerald-400" />
                <span>Fill Demo Credentials (admin / admin123)</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-6 md:px-12 flex items-center justify-between border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500">
        <div>© 2026 CARLTON VALLEY. All rights reserved.</div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-white transition-colors">Storefront</Link>
          <span>•</span>
          <Link href="/shop" className="hover:text-white transition-colors">Catalog</Link>
          <span>•</span>
          <Link href="/brand" className="hover:text-white transition-colors">About Us</Link>
        </div>
      </footer>

    </div>
  );
}
