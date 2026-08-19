"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
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
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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

      if (mode === "signup" && !fullName.trim()) {
        setIsLoading(false);
        setErrorMessage("Please enter your full name.");
        return;
      }

      const result = login(usernameOrEmail, password, fullName, {
        phone: phone.trim(),
        address: address.trim(),
      });

      if (result.role === "admin") {
        setSuccessMessage("Welcome, Administrator. Entering Atelier Control...");
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        setSuccessMessage(
          mode === "signup"
            ? `Welcome to Carlton Valley Atelier, ${result.name}. Profile created.`
            : `Welcome back, ${result.name}. Loading boutique...`
        );
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen text-white font-sans antialiased flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Immersive Global Background Image with High Visibility */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/cat_shop_all.jpg"
          alt="Carlton Valley Atelier"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.78] sm:brightness-[0.72] contrast-[1.05] saturate-[0.95]"
        />
        {/* Soft Ambient Overlay for Glassmorphism Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/55" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      {/* Reduced Top Creative Luxury Header Bar */}
      <header className="relative h-14 sm:h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between border-b border-white/[0.12] bg-black/45 backdrop-blur-xl z-20">
        <Link href="/" className="inline-flex flex-col group text-left">
          <span className="text-xs sm:text-sm font-syne font-extrabold tracking-[0.35em] uppercase text-white group-hover:text-neutral-300 transition-colors drop-shadow-md">
            CARLTON VALLEY
          </span>
          <span className="text-[7.5px] sm:text-[8px] font-mono tracking-[0.25em] text-neutral-400 uppercase -mt-0.5">
            Haute Couture • Atelier
          </span>
        </Link>

        <Link
          href="/"
          className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-200 hover:text-white flex items-center space-x-1.5 transition-all bg-white/[0.08] hover:bg-white/[0.18] border border-white/25 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md shadow-sm group"
        >
          <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5 text-white" />
          <span>Return to Store</span>
        </Link>
      </header>

      {/* Main Container with Glassmorphic Card */}
      <main className="relative flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 z-10 my-2">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-black/55 sm:bg-white/[0.04] border border-white/[0.18] backdrop-blur-2xl rounded-2xl md:rounded-none shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/10 overflow-hidden">
          
          {/* Left Column: Visual Lookbook Editorial (Visible on large screens) */}
          <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-8 overflow-hidden text-white border-r border-white/[0.15] bg-black/35 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Top Brand Headline — Cormorant editorial luxury */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center space-x-2 text-[7.5px] font-mono tracking-[0.32em] uppercase text-neutral-400">
                <span className="w-3 h-px bg-white/35" />
                <span>Haute Couture Atelier</span>
                <span className="w-3 h-px bg-white/35" />
              </div>
              <h2 className="text-[1.35rem] xl:text-[1.55rem] font-[family-name:var(--font-cormorant)] italic font-light tracking-wide text-white/90 leading-[1.35] drop-shadow">
                Step into a world of <em className="not-italic font-normal text-white">timeless elegance</em> &amp; <em className="not-italic font-normal text-white/80">bespoke distinction</em>.
              </h2>
            </div>

            {/* Bottom Luxury Privileges */}
            <div className="relative z-10 space-y-4 pt-8">
              <p className="text-xs font-urbanist text-neutral-300 leading-relaxed font-light text-[13px] tracking-wide">
                Indulge in architectural silhouettes, tactile fabrics, and private access to our seasonal collections designed for timeless distinction.
              </p>

              <div className="space-y-2.5 text-xs font-urbanist text-neutral-200 pt-3 border-t border-white/[0.15]">
                <div className="flex items-center space-x-2">
                  <Sparkles size={13} className="text-amber-300 shrink-0" />
                  <span className="font-light tracking-wide text-[11px]">Private previews & seasonal releases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown size={13} className="text-amber-300 shrink-0" />
                  <span className="font-light tracking-wide text-[11px]">Bespoke concierge & personal fitting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package size={13} className="text-amber-300 shrink-0" />
                  <span className="font-light tracking-wide text-[11px]">White-glove keepsake box delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Form Card */}
          <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-center bg-black/65 sm:bg-black/35 backdrop-blur-2xl">
            
            {/* Mobile-only editorial tagline */}
            <div className="lg:hidden text-center mb-4 space-y-1">
              <div className="inline-flex items-center space-x-2 text-[7.5px] font-mono tracking-[0.3em] uppercase text-neutral-400">
                <span className="w-3 h-px bg-white/35" />
                <span>Private Client Portal</span>
                <span className="w-3 h-px bg-white/35" />
              </div>
              <h2 className="text-[1.15rem] sm:text-[1.3rem] font-[family-name:var(--font-cormorant)] italic font-light text-white/90 leading-snug tracking-wide">
                Step into a world of <em className="not-italic font-normal text-white">timeless elegance</em> &amp; <em className="not-italic text-white/80">bespoke distinction</em>.
              </h2>
            </div>

            {/* Glassmorphic Tab Switcher */}
            <div className="flex bg-black/60 p-1 rounded-full sm:rounded-none border border-white/[0.15] mb-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-urbanist font-bold tracking-[0.2em] uppercase transition-all rounded-full sm:rounded-none cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white font-medium"
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
                className={`flex-1 py-2 text-[10px] sm:text-xs font-urbanist font-bold tracking-[0.2em] uppercase transition-all rounded-full sm:rounded-none cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white font-medium"
                }`}
              >
                Join the Atelier
              </button>
            </div>

            {/* Form Title & Subtitle */}
            <div className="space-y-0.5 mb-4 text-left">
              <h1 className="text-lg sm:text-xl font-[family-name:var(--font-cormorant)] font-light tracking-widest text-white uppercase">
                {mode === "signin" ? "Welcome Back" : "Create Client Profile"}
              </h1>
              <p className="text-[10.5px] text-neutral-400 font-light font-urbanist tracking-wide">
                {mode === "signin"
                  ? "Enter your credentials to access your private wardrobe & orders."
                  : "Join Carlton Valley to experience bespoke luxury & express checkout."}
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/75 border border-red-500/40 text-red-200 text-xs flex items-start space-x-2 animate-fadeIn rounded-lg sm:rounded-none backdrop-blur-md font-sans">
                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed text-[11px]">{errorMessage}</div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-950/75 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn rounded-lg sm:rounded-none backdrop-blur-md font-sans">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <div className="text-[11px]">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              
              {/* Registration Extra Fields (Full Name, Email, Contact Number, Address) */}
              {mode === "signup" && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 z-20 flex items-center pointer-events-none text-white">
                        <User size={16} strokeWidth={2.2} className="text-white" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-2.5 pl-11 text-xs text-white placeholder-white/35 focus:outline-none transition-all rounded-lg sm:rounded-none backdrop-blur-md shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 z-20 flex items-center pointer-events-none text-white">
                        <Mail size={16} strokeWidth={2.2} className="text-white" />
                      </div>
                      <input
                        type="email"
                        required
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-2.5 pl-11 text-xs text-white placeholder-white/35 focus:outline-none transition-all rounded-lg sm:rounded-none font-mono backdrop-blur-md shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                      Contact Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 z-20 flex items-center pointer-events-none text-white">
                        <Phone size={16} strokeWidth={2.2} className="text-white" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+61 400 000 000 / +94 77 000 0000"
                        className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-2.5 pl-11 text-xs text-white placeholder-white/35 focus:outline-none transition-all rounded-lg sm:rounded-none font-mono backdrop-blur-md shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Delivery / Residence Address */}
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                      Delivery / Residence Address
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 z-20 flex items-center pointer-events-none text-white">
                        <MapPin size={16} strokeWidth={2.2} className="text-white" />
                      </div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, City, State, Postal Code"
                        className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-2.5 pl-11 text-xs text-white placeholder-white/35 focus:outline-none transition-all rounded-lg sm:rounded-none backdrop-blur-md shadow-inner"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Sign In Email / Username Field (Only in Sign In mode) */}
              {mode === "signin" && (
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                    Email Address or Username
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 z-20 flex items-center pointer-events-none text-white">
                      <User size={16} strokeWidth={2.2} className="text-white" />
                    </div>
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-2.5 pl-11 text-xs text-white placeholder-white/35 focus:outline-none transition-all rounded-lg sm:rounded-none font-mono backdrop-blur-md shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                    Password
                  </label>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 z-20 flex items-center pointer-events-none text-white">
                    <Lock size={16} strokeWidth={2.2} className="text-white" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/25 focus:border-white px-3 py-2.5 pl-11 pr-11 text-xs text-white placeholder-white/35 focus:outline-none transition-all rounded-lg sm:rounded-none font-mono backdrop-blur-md shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 z-20 flex items-center text-white hover:text-neutral-200 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2.2} /> : <Eye size={16} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 accent-white rounded border-white/30 bg-black/40"
                  />
                  <span className="text-neutral-300 text-[10.5px] font-mono">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button with Glass Specular Glow */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-white text-black hover:bg-neutral-200 py-3 text-xs uppercase font-cinzel tracking-[0.25em] font-bold transition-all shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.35)] flex items-center justify-center space-x-2 mt-2 cursor-pointer rounded-lg sm:rounded-none`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 font-mono text-[10px]">
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In" : "Join Carlton Valley"}</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

          </div>

        </div>
      </main>

    </div>
  );
}
