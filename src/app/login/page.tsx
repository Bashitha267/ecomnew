"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  Package,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    setTimeout(() => {
      if (!usernameOrEmail.trim()) {
        setIsLoading(false);
        setErrorMessage("Please enter your email address or username.");
        return;
      }

      const result = login(usernameOrEmail, password, fullName);

      if (result.role === "admin") {
        setSuccessMessage("Welcome, Administrator. Entering Atelier Control...");
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        setSuccessMessage(`Welcome to Carlton Valley, ${result.name}. Loading your boutique...`);
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen text-white font-sans antialiased flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Immersive Global Background Image with Luxury Dark Blur */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/cat_shop_all.jpg"
          alt="Carlton Valley Atelier"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.1] saturate-[0.85]"
        />
        {/* Ambient Dark Gradient & Radial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/90" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Creative Luxury Header Bar with Glassmorphism */}
      <header className="relative h-20 px-5 sm:px-8 md:px-12 flex items-center justify-between border-b border-white/[0.12] bg-black/40 backdrop-blur-xl z-20">
        <Link href="/" className="inline-flex flex-col group text-left">
          <span className="text-sm sm:text-base font-cinzel font-bold tracking-[0.32em] uppercase text-white group-hover:text-neutral-300 transition-colors drop-shadow-md">
            CARLTON VALLEY
          </span>
          <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase -mt-0.5">
            Haute Couture • Atelier
          </span>
        </Link>

        <Link
          href="/"
          className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-neutral-200 hover:text-white flex items-center space-x-2 transition-all bg-white/[0.08] hover:bg-white/[0.18] border border-white/25 px-4 py-2 rounded-full backdrop-blur-md shadow-sm group"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5 text-white" />
          <span>Return to Store</span>
        </Link>
      </header>

      {/* Main Container with Glassmorphic Card */}
      <main className="relative flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-black/50 sm:bg-white/[0.04] border border-white/[0.18] backdrop-blur-2xl rounded-3xl md:rounded-none shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/10 overflow-hidden">
          
          {/* Left Column: Visual Lookbook Editorial (Visible on large screens) */}
          <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 overflow-hidden text-white border-r border-white/[0.15] bg-black/30 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Top Brand Headline */}
            <div className="relative z-10 space-y-3">
              <h2 className="text-2xl xl:text-3xl font-italiana font-normal tracking-wide text-white leading-snug drop-shadow">
                Join Carlton Valley & enjoy your luxury wearing.
              </h2>
            </div>

            {/* Bottom Luxury Privileges */}
            <div className="relative z-10 space-y-5 pt-10">
              <p className="text-xs font-cormorant text-neutral-300 leading-relaxed font-light text-sm italic tracking-wide">
                Indulge in architectural silhouettes, tactile fabrics, and private access to our seasonal collections designed for timeless distinction.
              </p>

              <div className="space-y-3 text-xs font-sans text-neutral-200 pt-4 border-t border-white/[0.15]">
                <div className="flex items-center space-x-2.5">
                  <Sparkles size={14} className="text-amber-300 shrink-0" />
                  <span className="font-light tracking-wide">Private previews & limited release drops</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Crown size={14} className="text-amber-300 shrink-0" />
                  <span className="font-light tracking-wide">Bespoke sizing & personal styling consultation</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Package size={14} className="text-amber-300 shrink-0" />
                  <span className="font-light tracking-wide">Global white-glove delivery in signature keepsake boxes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Form Card */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-black/60 sm:bg-black/30 backdrop-blur-2xl">
            
            {/* Mobile-only brand tagline with balanced Italiana font */}
            <div className="lg:hidden text-center mb-6 space-y-2">
              <h2 className="text-xl sm:text-2xl font-italiana font-normal text-white leading-snug drop-shadow-sm tracking-wide">
                Join Carlton Valley & enjoy your luxury wearing.
              </h2>
            </div>

            {/* Glassmorphic Tab Switcher */}
            <div className="flex bg-black/60 p-1.5 rounded-full sm:rounded-none border border-white/[0.15] mb-6 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2.5 text-[11px] sm:text-xs font-cinzel tracking-[0.22em] uppercase transition-all rounded-full sm:rounded-none cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-neutral-400 hover:text-white font-normal"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2.5 text-[11px] sm:text-xs font-cinzel tracking-[0.22em] uppercase transition-all rounded-full sm:rounded-none cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-neutral-400 hover:text-white font-normal"
                }`}
              >
                Join the Atelier
              </button>
            </div>

            {/* Form Title & Subtitle */}
            <div className="space-y-1 mb-6 text-left">
              <h1 className="text-xl sm:text-2xl font-italiana font-normal tracking-wide text-white">
                {mode === "signin" ? "Welcome Back" : "Create Client Profile"}
              </h1>
              <p className="text-xs text-neutral-300/80 font-light font-sans tracking-wide">
                {mode === "signin"
                  ? "Enter your credentials to access your private wardrobe & saved orders."
                  : "Join Carlton Valley to explore bespoke releases & express checkout."}
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start space-x-2 animate-fadeIn rounded-xl sm:rounded-none backdrop-blur-md font-sans">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn rounded-xl sm:rounded-none backdrop-blur-md font-sans">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <div>{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Full Name Field (Displayed during Join/Create Account) */}
              {(mode === "signup" || fullName) && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/90">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alexander Wright"
                      className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-3.5 pl-11 text-xs text-white placeholder-white/40 focus:outline-none transition-all rounded-xl sm:rounded-none backdrop-blur-md shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Username or Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-300">
                  Email Address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/90">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder={mode === "signin" ? "name@example.com" : "your.email@example.com"}
                    className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-3.5 pl-11 text-xs text-white placeholder-white/40 focus:outline-none transition-all rounded-xl sm:rounded-none font-mono backdrop-blur-md shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/90">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-3.5 pl-11 pr-11 text-xs text-white placeholder-white/40 focus:outline-none transition-all rounded-xl sm:rounded-none font-mono backdrop-blur-md shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/80 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-white rounded border-white/30 bg-black/40"
                  />
                  <span className="text-neutral-300 text-[11px] font-mono">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button with Glass Specular Glow */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-white text-black hover:bg-neutral-200 py-4 text-xs uppercase font-cinzel tracking-[0.28em] font-bold transition-all shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.35)] flex items-center justify-center space-x-2 mt-4 cursor-pointer rounded-xl sm:rounded-none`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In" : "Join Carlton Valley"}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

          </div>

        </div>
      </main>

      {/* Footer with Glassmorphism */}
      <footer className="relative h-16 px-6 md:px-12 flex items-center justify-between border-t border-white/[0.12] text-[11px] font-mono text-neutral-400 bg-black/40 backdrop-blur-xl z-20">
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
