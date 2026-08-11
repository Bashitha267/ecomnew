"use client";

import React, { useState, useEffect } from "react";
import { useCurrency, Currency } from "../context/CurrencyContext";
import { User, Search, ShoppingBag, ChevronDown, Menu, X, Check } from "lucide-react";

interface NavbarProps {
  onNavClick?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavClick }) => {
  const { currency, setCurrency } = useCurrency();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "SHOP", id: "shop" },
    { label: "BRAND", id: "brand" },
    { label: "COMING SOON", id: "coming-soon" },
    { label: "SALE", id: "sale" },
    { label: "INFO", id: "info" },
  ];

  const handleLinkClick = (id: string) => {
    setIsMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white text-black border-b border-neutral-100 shadow-sm py-3"
            : "bg-transparent text-white border-b border-white/15 py-4 sm:py-5 bg-gradient-to-b from-black/60 via-black/30 to-transparent"
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button (Left side on mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1.5 hover:opacity-70 transition-opacity ${scrolled ? "text-black" : "text-white"}`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Left Navigation Links (Desktop only) */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-10 text-[13px] tracking-[0.18em] font-medium font-serif">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-opacity duration-200 uppercase cursor-pointer ${
                  scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75 drop-shadow-xs"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Center Brand Logo (Single-line, non-wrapping on all screen sizes) */}
          <div className="text-center flex-1 md:flex-initial">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block group"
            >
              <h1
                className={`text-[15px] sm:text-xl md:text-3xl lg:text-4xl font-extrabold tracking-[0.14em] sm:tracking-[0.18em] md:tracking-[0.22em] uppercase font-display leading-none whitespace-nowrap transition-all duration-300 ${
                  scrolled ? "text-black hover:opacity-85" : "text-white drop-shadow-md hover:opacity-90"
                }`}
              >
                CARLTON VALLEY
              </h1>
            </button>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 text-[13px]">
            
            {/* Currency Selector (Desktop only to prevent top mobile bar clutter) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className={`flex items-center space-x-1 tracking-wider text-xs md:text-[13px] font-medium transition-opacity py-1 px-1 ${
                  scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-80"
                }`}
                aria-expanded={isCurrencyOpen}
              >
                <span>{currency === "AUD" ? "AUD $" : "LKR Rs"}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isCurrencyOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Currency Dropdown Menu */}
              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white text-black border border-neutral-200 shadow-xl rounded-sm py-1 z-50 text-xs font-sans">
                  <button
                    onClick={() => {
                      setCurrency("AUD");
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                      currency === "AUD" ? "font-bold text-black bg-neutral-50" : "text-neutral-700"
                    }`}
                  >
                    <span>AUD ($)</span>
                    {currency === "AUD" && <Check size={14} className="text-black" />}
                  </button>
                  <button
                    onClick={() => {
                      setCurrency("LKR");
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                      currency === "LKR" ? "font-bold text-black bg-neutral-50" : "text-neutral-700"
                    }`}
                  >
                    <span>LKR (Rs)</span>
                    {currency === "LKR" && <Check size={14} className="text-black" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Icon (Desktop only) */}
            <button
              onClick={() => handleLinkClick("info")}
              className={`p-1 transition-opacity hidden md:block ${scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75"}`}
              title="Account"
              aria-label="Account"
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Search Icon (Visible on all screens) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-1 transition-opacity ${scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75"}`}
              title="Search"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Cart Icon (Visible on all screens) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`p-1 transition-opacity relative ${scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75"}`}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer (Clean, Spaced Drawer with Currency & Account) */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t px-6 py-6 animate-fadeIn shadow-2xl ${
            scrolled ? "bg-white text-black border-neutral-100" : "bg-black/95 text-white border-white/10 backdrop-blur-md"
          }`}>
            <nav className="flex flex-col space-y-4 text-center font-serif text-sm tracking-[0.2em]">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className="py-2.5 hover:opacity-60 transition-opacity border-b border-neutral-500/20 uppercase"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Currency & Account inside Mobile Menu */}
            <div className="mt-6 pt-6 border-t border-neutral-500/20 flex items-center justify-between px-2 text-xs font-mono">
              <span className="text-neutral-400 uppercase tracking-widest">Currency:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrency("AUD")}
                  className={`px-3 py-1 border transition-colors ${
                    currency === "AUD" ? "bg-white text-black border-white font-bold" : "border-neutral-500/40 text-neutral-300"
                  }`}
                >
                  AUD $
                </button>
                <button
                  onClick={() => setCurrency("LKR")}
                  className={`px-3 py-1 border transition-colors ${
                    currency === "LKR" ? "bg-white text-black border-white font-bold" : "border-neutral-500/40 text-neutral-300"
                  }`}
                >
                  LKR Rs
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal / Slide-over */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white w-full max-w-2xl rounded-sm p-6 shadow-2xl animate-scaleUp relative text-black">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
              <h3 className="text-lg font-serif tracking-widest uppercase">Search Store</h3>
              <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:opacity-60 text-black">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Search collection, dresses, coats..."
                className="w-full py-3 px-4 pl-10 border border-neutral-300 rounded-none focus:outline-none focus:border-black text-sm"
                autoFocus
              />
              <Search size={18} className="absolute left-3 top-3.5 text-neutral-400" />
            </div>
            <div className="mt-6 text-xs text-neutral-400 uppercase tracking-widest text-center">
              This is Search overlay
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end text-black">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-slideLeft">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
                <h3 className="text-lg font-serif tracking-widest uppercase">Your Cart</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:opacity-60 text-black">
                  <X size={20} />
                </button>
              </div>
              <div className="py-12 text-center text-neutral-500 font-serif tracking-wider">
                <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-4 text-neutral-300" />
                <p className="text-sm">Your shopping bag is currently empty.</p>
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-black text-white py-3 uppercase tracking-widest text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
