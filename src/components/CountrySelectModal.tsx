"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { Globe } from "lucide-react";

export const CountrySelectModal: React.FC = () => {
  const { selectedCountry, setSelectedCountry } = useStore();
  const { setCurrency } = useCurrency();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    // If auth state is still resolving, wait
    if (authLoading) return;

    // Rule: If user is logged in, DO NOT ask
    if (isAuthenticated) {
      setIsOpen(false);
      return;
    }

    // Check if visitor has already chosen a country before
    const hasChosen = typeof window !== "undefined" && localStorage.getItem("cv_country_selected");
    if (!hasChosen) {
      // Show modal to new visitors
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading]);

  if (!isOpen) return null;

  const handleSelectCountry = (country: "Australia" | "Sri Lanka") => {
    setSelectedCountry(country);
    setCurrency(country === "Australia" ? "AUD" : "LKR");
    if (typeof window !== "undefined") {
      localStorage.setItem("cv_selected_country", country);
      localStorage.setItem("cv_country_selected", "true");
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn text-white">
      <div 
        className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800/90 rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-6 sm:p-10 text-center overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-modal-title"
      >
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="relative z-10 mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400">
            <Globe size={13} className="text-amber-400" />
            <span>Regional Atelier Selection</span>
          </div>

          <h2
            id="country-modal-title"
            className="text-2xl sm:text-3xl font-serif font-light tracking-wide uppercase text-white"
          >
            Select Your Destination
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-md mx-auto leading-relaxed">
            Welcome to Carlton Valley. Please choose your boutique destination for tailored collections, local currency, and white-glove regional delivery.
          </p>
        </div>

        {/* Two Regional Boutique Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Australia Card */}
          <button
            type="button"
            onClick={() => handleSelectCountry("Australia")}
            onMouseEnter={() => setHoveredCountry("Australia")}
            onMouseLeave={() => setHoveredCountry(null)}
            className={`group relative text-left p-5 sm:p-6 rounded-lg border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
              selectedCountry === "Australia" || hoveredCountry === "Australia"
                ? "bg-neutral-900/90 border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]"
                : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl sm:text-4xl">🇦🇺</div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/80 text-blue-300">
                AUD ($)
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-lg font-serif font-bold text-white tracking-wide uppercase">
                Australia
              </h3>
              <p className="text-xs text-neutral-400 font-light">
                Prices in Australian Dollars (AUD). Direct dispatch across Australia & New Zealand.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-blue-400 group-hover:text-blue-300">
              <span>Enter Australia Store</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </button>

          {/* Sri Lanka Card */}
          <button
            type="button"
            onClick={() => handleSelectCountry("Sri Lanka")}
            onMouseEnter={() => setHoveredCountry("Sri Lanka")}
            onMouseLeave={() => setHoveredCountry(null)}
            className={`group relative text-left p-5 sm:p-6 rounded-lg border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
              selectedCountry === "Sri Lanka" || hoveredCountry === "Sri Lanka"
                ? "bg-neutral-900/90 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-[1.02]"
                : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl sm:text-4xl">🇱🇰</div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/80 text-amber-300">
                LKR (Rs)
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-lg font-serif font-bold text-white tracking-wide uppercase">
                Sri Lanka
              </h3>
              <p className="text-xs text-neutral-400 font-light">
                Prices in Sri Lankan Rupees (LKR). Islandwide express concierge & atelier delivery.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400 group-hover:text-amber-300">
              <span>Enter Sri Lanka Store</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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
