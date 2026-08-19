"use client";

import React from "react";
import Link from "next/link";
import { useCurrency } from "../context/CurrencyContext";

export const Footer: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <footer className="bg-black text-white py-16 px-4 md:px-8 border-t border-neutral-900 font-sans">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="block">
            <h3 className="text-2xl font-extrabold tracking-[0.2em] font-display uppercase">
              CARLTON VALLEY
            </h3>
          </Link>
          <p className="text-xs text-neutral-400 leading-relaxed font-light tracking-wide max-w-xs">
            High fashion e-commerce experience tailored with modern aesthetics, fluid responsive layouts, and dual currency options (AUD / LKR).
          </p>
        </div>

        {/* Quick Navigation Links */}
        <div className="space-y-3 text-xs tracking-[0.2em] font-serif">
          <h4 className="text-neutral-500 uppercase font-mono tracking-widest text-[11px] mb-4">Navigation</h4>
          <ul className="space-y-2.5">
            <li><Link href="/shop" className="hover:text-neutral-400 transition-colors uppercase">Shop Collection</Link></li>
            <li><Link href="/brand" className="hover:text-neutral-400 transition-colors uppercase">About Us / Brand</Link></li>
            <li><Link href="/#coming-soon" className="hover:text-neutral-400 transition-colors uppercase">Coming Soon</Link></li>
            <li><Link href="/shop" className="hover:text-neutral-400 transition-colors uppercase">Categories</Link></li>
            <li><Link href="/admin" className="hover:text-neutral-400 transition-colors uppercase font-mono text-[11px] text-emerald-400">Admin Control</Link></li>
          </ul>
        </div>

        {/* Currency & Region */}
        <div className="space-y-3 text-xs">
          <h4 className="text-neutral-500 uppercase font-mono tracking-widest text-[11px] mb-4">Currency & Region</h4>
          <p className="text-neutral-400 text-xs mb-3">Selected Currency: <strong className="text-white">{currency === "AUD" ? "Australian Dollar (AUD $)" : "Sri Lankan Rupee (LKR Rs)"}</strong></p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrency("AUD")}
              className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                currency === "AUD" ? "bg-white text-black border-white" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              AUD $
            </button>
            <button
              onClick={() => setCurrency("LKR")}
              className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                currency === "LKR" ? "bg-white text-black border-white" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              LKR Rs
            </button>
          </div>
        </div>

        {/* Newsletter Signup Placeholder */}
        <div className="space-y-4">
          <h4 className="text-neutral-500 uppercase font-mono tracking-widest text-[11px]">Newsletter</h4>
          <p className="text-xs text-neutral-400 font-light">Subscribe to receive private preview drops & exclusive release news.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-neutral-600 w-full"
            />
            <button
              type="submit"
              className="bg-white text-black text-xs px-4 py-2 uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors shrink-0"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1700px] mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 font-mono tracking-wider">
        <p>© 2026 CARLTON VALLEY. All rights reserved by Matrix.</p>
      </div>
    </footer>
  );
};
