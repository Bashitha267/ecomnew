"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrency, Currency } from "../context/CurrencyContext";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Search,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Check,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Shield,
  LogOut,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  onNavClick?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavClick }) => {
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { cart, removeFromCart, updateCartQuantity, products } = useStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalAUD = cart.reduce((sum, item) => sum + item.priceAUD * item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white text-black border-b border-neutral-100 shadow-sm py-3"
            : "bg-black/60 backdrop-blur-xs text-white border-b border-white/15 py-4 sm:py-5"
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button (Left side on mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1.5 focus:outline-none ${scrolled ? "text-black" : "text-white"}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Left Navigation Links (Desktop only) */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[13px] tracking-[0.18em] font-medium font-serif">
            <Link
              href="/shop"
              className={`transition-opacity duration-200 uppercase ${
                scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75 drop-shadow-xs"
              }`}
            >
              SHOP
            </Link>
            <Link
              href="/brand"
              className={`transition-opacity duration-200 uppercase ${
                scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75 drop-shadow-xs"
              }`}
            >
              BRAND
            </Link>

            <Link
              href="/#new-arrivals"
              className={`transition-opacity duration-200 uppercase ${
                scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75 drop-shadow-xs"
              }`}
            >
              NEW ARRIVALS
            </Link>
            <Link
              href="/#coming-soon"
              className={`transition-opacity duration-200 uppercase ${
                scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75 drop-shadow-xs"
              }`}
            >
              COMING SOON
            </Link>
          </nav>

          {/* Center Brand Logo */}
          <div className="text-center flex-1 md:flex-initial">
            <Link href="/" className="inline-block group">
              <h1
                className={`text-[15px] sm:text-xl md:text-3xl lg:text-4xl font-extrabold tracking-[0.14em] sm:tracking-[0.18em] md:tracking-[0.22em] uppercase font-display leading-none whitespace-nowrap transition-all duration-300 ${
                  scrolled ? "text-black hover:opacity-85" : "text-white drop-shadow-md hover:opacity-90"
                }`}
              >
                CARLTON VALLEY
              </h1>
            </Link>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 text-[13px]">
            
            {/* Currency Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setIsCurrencyOpen(!isCurrencyOpen);
                  setIsUserDropdownOpen(false);
                }}
                className={`flex items-center space-x-1 tracking-wider text-xs md:text-[13px] font-medium transition-opacity py-1 px-1 cursor-pointer ${
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

            {/* User Account / Profile Display (Displays User Name in Header) */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      setIsCurrencyOpen(false);
                    }}
                    className={`flex items-center space-x-1.5 py-1 px-1.5 rounded transition-colors text-xs font-sans cursor-pointer ${
                      scrolled
                        ? "text-neutral-800 hover:bg-neutral-100"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-neutral-800 text-white border border-neutral-600 flex items-center justify-center text-[10px] font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-serif tracking-wide hidden sm:inline max-w-[120px] truncate font-medium">
                      Hi, {user.name}
                    </span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* User Profile Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white text-black border border-neutral-200 shadow-2xl rounded-sm py-2 z-50 text-xs font-sans animate-fadeIn">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <div className="font-serif font-bold text-neutral-900 truncate text-sm">{user.name}</div>
                        <div className="font-mono text-[10px] text-neutral-500 truncate">{user.email}</div>
                        <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider bg-neutral-100 text-neutral-800">
                          {isAdmin ? "Administrator" : "Client Member"}
                        </div>
                      </div>

                      {/* Admin panel quick link if admin */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2.5 flex items-center space-x-2 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 font-semibold transition-colors"
                        >
                          <Shield size={14} />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <Link
                        href="/shop"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 flex items-center space-x-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <ShoppingBag size={14} />
                        <span>Explore Collection</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors border-t border-neutral-100 mt-1 cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center space-x-1.5 p-1 transition-opacity text-xs font-serif tracking-wider uppercase ${
                    scrolled ? "text-neutral-800 hover:opacity-60" : "text-white hover:opacity-80"
                  }`}
                  title="Sign In / Client Gateway"
                >
                  <User size={18} strokeWidth={1.5} />
                  <span className="hidden lg:inline text-[11px] font-mono">Sign In</span>
                </Link>
              )}
            </div>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-1 transition-opacity cursor-pointer ${scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75"}`}
              title="Search"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`p-1 transition-opacity relative cursor-pointer ${scrolled ? "text-black hover:opacity-60" : "text-white hover:opacity-75"}`}
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t px-6 py-6 animate-fadeIn shadow-2xl ${
            scrolled ? "bg-white text-black border-neutral-100" : "bg-black/95 text-white border-white/10 backdrop-blur-md"
          }`}>
            <nav className="flex flex-col space-y-4 text-center font-serif text-sm tracking-[0.2em]">
              
              {/* Logged in User Greeting on Mobile */}
              {isAuthenticated && user ? (
                <div className="pb-3 mb-2 border-b border-neutral-500/20 text-center font-sans space-y-1">
                  <div className="text-xs font-serif uppercase tracking-widest text-neutral-400">Signed in as</div>
                  <div className="text-sm font-serif font-bold text-emerald-400">{user.name}</div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-neutral-300 hover:opacity-60 transition-opacity border-b border-neutral-500/20 uppercase font-mono text-xs"
                >
                  SIGN IN / CLIENT PORTAL
                </Link>
              )}

              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 hover:opacity-60 transition-opacity border-b border-neutral-500/20 uppercase"
              >
                SHOP ALL
              </Link>
              <Link
                href="/brand"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 hover:opacity-60 transition-opacity border-b border-neutral-500/20 uppercase font-semibold"
              >
                ABOUT THE BRAND
              </Link>

              <Link
                href="/#new-arrivals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 hover:opacity-60 transition-opacity border-b border-neutral-500/20 uppercase"
              >
                NEW ARRIVALS
              </Link>
              <Link
                href="/#coming-soon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 hover:opacity-60 transition-opacity border-b border-neutral-500/20 uppercase"
              >
                COMING SOON
              </Link>
              
              {/* Show admin link if logged in as admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-emerald-400 hover:opacity-60 transition-opacity font-mono text-xs uppercase"
                >
                  ADMIN DASHBOARD
                </Link>
              )}

              {/* Logout button on mobile */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-red-400 hover:opacity-60 transition-opacity font-mono text-xs uppercase"
                >
                  SIGN OUT
                </button>
              )}
            </nav>

            {/* Currency in Mobile Menu */}
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

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-28 px-4">
          <div className="bg-white w-full max-w-2xl rounded-sm p-6 shadow-2xl animate-scaleUp text-black">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
              <h3 className="text-base font-serif tracking-widest uppercase font-semibold">Search Collection</h3>
              <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:opacity-60 text-black">
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type shirt, silk, twill, or collection name..."
                className="w-full py-3 px-4 pl-10 border border-neutral-300 rounded-none focus:outline-none focus:border-black text-sm"
                autoFocus
              />
              <Search size={18} className="absolute left-3 top-3.5 text-neutral-400" />
            </div>

            {/* Results list */}
            {searchQuery.trim() && (
              <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center font-serif">
                    No matching apparel found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                ) : (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center space-x-3 py-3 hover:bg-neutral-50 px-2 transition-colors group"
                    >
                      <img
                        src={item.colors[0]?.images[0] || item.colors[0]?.swatchImage}
                        alt={item.name}
                        className="w-12 h-14 object-cover bg-neutral-100"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-serif text-sm font-medium text-neutral-900 group-hover:underline truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-mono text-neutral-500">{formatPrice(item.priceAUD)}</p>
                      </div>
                      <ArrowRight size={14} className="text-neutral-400 group-hover:text-black" />
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHOPPING BAG / CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end text-black">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-slideLeft">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
                <h3 className="text-base font-serif tracking-widest uppercase font-semibold">
                  Shopping Bag ({totalCartCount})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:opacity-60 text-black">
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="py-20 text-center text-neutral-500 font-serif tracking-wider">
                  <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-4 text-neutral-300" />
                  <p className="text-sm">Your shopping bag is currently empty.</p>
                </div>
              ) : (
                <div className="mt-4 max-h-[60vh] overflow-y-auto divide-y divide-neutral-100 space-y-3">
                  {cart.map((item, idx) => (
                    <div key={`${item.productId}-${item.color}-${item.size}-${idx}`} className="pt-3 flex space-x-3 text-xs">
                      <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-neutral-100 rounded-xs" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-sm font-medium text-neutral-900 line-clamp-1">{item.name}</h4>
                          <p className="text-neutral-500 font-mono text-[11px] mt-0.5">
                            {item.color} • Size {item.size}
                          </p>
                          <p className="font-mono font-semibold text-neutral-900 mt-1">
                            {formatPrice(item.priceAUD * item.quantity)}
                          </p>
                        </div>

                        {/* Quantity & Delete */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-neutral-300">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-neutral-600 hover:text-black"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-2 text-xs font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-neutral-600 hover:text-black"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-500"
                            title="Remove from bag"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div className="flex justify-between items-center font-serif text-sm">
                  <span className="uppercase tracking-widest text-neutral-600">Subtotal</span>
                  <span className="font-mono font-bold text-base text-neutral-900">{formatPrice(cartSubtotalAUD)}</span>
                </div>
                <p className="text-[11px] text-neutral-500 text-center font-sans">
                  Taxes and shipping calculated at checkout
                </p>
                <button
                  onClick={() => alert("Proceeding to secure checkout...")}
                  className="w-full bg-black text-white py-3.5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-neutral-800 transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

