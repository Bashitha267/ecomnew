"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "../context/StoreContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { setCookie, getCookie, COUNTRY_COOKIE_NAME, COUNTRY_CHOSEN_COOKIE_NAME } from "../lib/cookies";
import { Globe } from "lucide-react";

export const CountrySelectModal: React.FC = () => {
  const pathname = usePathname();
  const { selectedCountry, setSelectedCountry } = useStore();
  const { setCurrency } = useCurrency();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If auth state is still resolving, wait
    if (authLoading) return;

    // Rule 1: If user is logged in, DO NOT ask
    if (isAuthenticated) {
      setIsOpen(false);
      return;
    }

    // Rule 2: Don't show popup modal over login/admin pages (login has its own country selector)
    if (pathname === "/login" || pathname?.startsWith("/admin")) {
      setIsOpen(false);
      return;
    }

    // Rule 3: Check if country preference is already stored in cookies or localStorage
    const cookieCountry = getCookie(COUNTRY_COOKIE_NAME);
    const cookieChosen = getCookie(COUNTRY_CHOSEN_COOKIE_NAME);
    const cachedCountry = typeof window !== "undefined" ? localStorage.getItem(COUNTRY_COOKIE_NAME) : null;
    const hasChosen = typeof window !== "undefined" ? localStorage.getItem(COUNTRY_CHOSEN_COOKIE_NAME) : null;

    const chosen = cookieChosen === "true" || hasChosen === "true";
    const country = cookieCountry || cachedCountry;

    if (chosen && (country === "Australia" || country === "Sri Lanka")) {
      setIsOpen(false);
      return;
    }

    // Else: Immediately show the modal asking to select country first!
    setIsOpen(true);
  }, [isAuthenticated, authLoading, pathname]);

  if (!isOpen) return null;

  const handleSelectCountry = (country: "Australia" | "Sri Lanka") => {
    setSelectedCountry(country);
    setCurrency(country === "Australia" ? "AUD" : "LKR");

    // Store in cookie (365 days / 1 year)
    setCookie(COUNTRY_COOKIE_NAME, country, 365);
    setCookie(COUNTRY_CHOSEN_COOKIE_NAME, "true", 365);

    // Also keep in localStorage for backwards compatibility
    if (typeof window !== "undefined") {
      localStorage.setItem(COUNTRY_COOKIE_NAME, country);
      localStorage.setItem(COUNTRY_CHOSEN_COOKIE_NAME, "true");
    }

    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn text-white">
      {/* Background Editorial Image on backdrop */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src="/cntrybg.avif"
          alt="Backdrop"
          className="w-full h-full object-cover object-center opacity-25 filter blur-xs scale-105"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      <div 
        className="relative w-full max-w-2xl border border-neutral-800/90 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-10 text-center overflow-hidden animate-scaleUp bg-neutral-950/90 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-modal-title"
      >
        {/* Background Editorial Image Inside Modal Box */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/cntrybg.avif"
            alt="Editorial Background"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/80 to-neutral-950/95" />
        </div>

        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="relative z-10 mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400">
            <Globe size={13} className="text-amber-400" />
            <span>Regional Selection</span>
          </div>

          <h2
            id="country-modal-title"
            className="text-2xl sm:text-3xl font-serif font-light tracking-wide uppercase text-white"
          >
            Select Your Destination
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-md mx-auto leading-relaxed">
            Please choose your country to browse local collections and currency.
          </p>
        </div>

        {/* Two Simplified Flag + Country Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Australia Card */}
          <button
            type="button"
            onClick={() => handleSelectCountry("Australia")}
            className="group relative p-6 sm:p-8 rounded-xl border border-neutral-700/60 bg-neutral-950/75 hover:bg-neutral-900/90 hover:border-blue-500/80 backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:scale-[1.02] shadow-xl hover:shadow-blue-500/15"
          >
            <div className="w-20 h-12 sm:w-24 sm:h-14 overflow-hidden rounded-md shadow-md border border-neutral-700/80 group-hover:border-blue-400 transition-colors">
              <img
                src="/flags/au.svg"
                alt="Australia Flag"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wider uppercase group-hover:text-blue-300 transition-colors">
                Australia
              </h3>
              <span className="text-xs font-mono text-neutral-400 tracking-wider mt-1 inline-block">
                AUD ($)
              </span>
            </div>
          </button>

          {/* Sri Lanka Card */}
          <button
            type="button"
            onClick={() => handleSelectCountry("Sri Lanka")}
            className="group relative p-6 sm:p-8 rounded-xl border border-neutral-700/60 bg-neutral-950/75 hover:bg-neutral-900/90 hover:border-amber-500/80 backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:scale-[1.02] shadow-xl hover:shadow-amber-500/15"
          >
            <div className="w-20 h-12 sm:w-24 sm:h-14 overflow-hidden rounded-md shadow-md border border-neutral-700/80 group-hover:border-amber-400 transition-colors">
              <img
                src="/flags/lk.svg"
                alt="Sri Lanka Flag"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wider uppercase group-hover:text-amber-300 transition-colors">
                Sri Lanka
              </h3>
              <span className="text-xs font-mono text-neutral-400 tracking-wider mt-1 inline-block">
                LKR (Rs)
              </span>
            </div>
          </button>
        </div>

        {/* Bottom Note */}
        <p className="relative z-10 text-[11px] text-neutral-500 font-mono tracking-wide">
          You can switch your store region or currency anytime from the navigation bar.
        </p>
      </div>
    </div>
  );
};


