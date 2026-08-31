"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import { SL_DISTRICTS, AU_STATES, CountryValue } from "../../lib/locations";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Truck,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Package,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotalAUD, clearCart, addOrder } = useStore();
  const { user, isAuthenticated, register } = useAuth();
  const { formatPrice, currency, setCurrency } = useCurrency();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [createAccount, setCreateAccount] = useState(true);
  
  // Location states
  const [country, setCountry] = useState<CountryValue>("Sri Lanka");
  const [district, setDistrict] = useState<string>(SL_DISTRICTS[0]);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Card details states
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [sameBilling, setSameBilling] = useState(true);

  // Status & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.address) setStreetAddress(user.address);
    }
  }, [user]);

  // When country changes, reset sub-location default
  const handleCountryChange = (newCountry: CountryValue) => {
    setCountry(newCountry);
    if (newCountry === "Sri Lanka") {
      setDistrict(SL_DISTRICTS[0]);
    } else {
      setDistrict(AU_STATES[0]);
    }
  };

  // Card number input formatting (e.g. 4532 1234 5678 9012)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Expiry input formatting (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("51") || clean.startsWith("52") || clean.startsWith("53") || clean.startsWith("54") || clean.startsWith("55")) return "Mastercard";
    if (clean.startsWith("34") || clean.startsWith("37")) return "Amex";
    return "Card";
  };

  // Calculate Shipping fee (Free over $200 AUD, else standard $10)
  const shippingFee = cartTotalAUD >= 200 || cartTotalAUD === 0 ? 0 : 10;
  const finalTotalAUD = cartTotalAUD + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!streetAddress.trim()) {
      setErrorMessage("Please enter your street address.");
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard.length < 13) {
      setErrorMessage("Please enter a valid card number.");
      return;
    }

    if (!cardExpiry || cardExpiry.length < 5) {
      setErrorMessage("Please enter your card expiry (MM/YY).");
      return;
    }

    if (!cardCvv || cardCvv.length < 3) {
      setErrorMessage("Please enter your card CVC/CVV code.");
      return;
    }

    if (!isAuthenticated && createAccount) {
      if (!accountPassword || accountPassword.length < 6) {
        setErrorMessage("Please enter a password with at least 6 characters to create your account.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const fullShippingAddress = `${streetAddress.trim()}${city.trim() ? ", " + city.trim() : ""}, ${district}, ${country}${postalCode.trim() ? " (" + postalCode.trim() + ")" : ""}`;
      
      // Auto create customer account if not logged in
      if (!isAuthenticated && createAccount && accountPassword) {
        try {
          await register({
            name: customerName.trim(),
            email: customerEmail.trim().toLowerCase(),
            password: accountPassword,
            phone: customerPhone.trim() || undefined,
            address: fullShippingAddress,
          });
        } catch (regErr) {
          console.warn("Auto register note:", regErr);
        }
      }

      const brand = getCardBrand();
      const last4 = cleanCard.slice(-4);
      const paymentMethodString = `${brand} (•••• ${last4})`;

      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim() || undefined,
        shippingAddress: fullShippingAddress,
        country,
        district,
        paymentMethod: paymentMethodString,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          priceAUD: item.priceAUD,
          image: item.image,
        })),
      };

      const created = await addOrder(orderPayload);
      clearCart();
      setOrderComplete({
        ...created,
        items: cart,
        country,
        district,
        shippingAddress: fullShippingAddress,
        paymentMethod: paymentMethodString,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        totalAUD: finalTotalAUD,
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to process order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ORDER SUCCESS CONFIRMATION VIEW ──────────────────────────────────────
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 sm:p-12 shadow-2xl space-y-8 animate-fadeIn">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 mb-2">
              <CheckCircle2 size={36} />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-emerald-400">Order Confirmed</p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Thank you, {orderComplete.customerName}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm font-sans max-w-md mx-auto">
              Your order has been recorded in our atelier ledger. A confirmation has been dispatched to{" "}
              <span className="text-white font-medium">{orderComplete.customerEmail}</span>.
            </p>
          </div>

          {/* Key Details Card */}
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-lg p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
              <div>
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">Order Identifier</span>
                <span className="font-mono font-bold text-sm text-white">{orderComplete.id || "ORD-SUCCESS"}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">Payment Method</span>
                <span className="font-medium text-white flex items-center justify-end gap-1.5">
                  <CreditCard size={13} className="text-neutral-400" />
                  {orderComplete.paymentMethod}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
              <div>
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">Destination</span>
                <span className="font-medium text-white block">
                  {orderComplete.district}, {orderComplete.country}
                </span>
                <span className="text-neutral-400 text-[11px] block mt-0.5">{orderComplete.shippingAddress}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">Estimated Dispatch</span>
                <span className="font-medium text-emerald-400 block">1–2 Business Days</span>
                <span className="text-neutral-400 text-[11px] block mt-0.5">Tracking sent via email</span>
              </div>
            </div>

            {/* Line items summary */}
            <div>
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-2">Purchased Items</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {orderComplete.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-neutral-800/60 last:border-0">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} alt={item.name} className="w-9 h-11 object-cover rounded bg-neutral-800" />
                      <div>
                        <p className="font-serif text-white font-medium text-xs">{item.name}</p>
                        <p className="text-neutral-400 text-[10px] font-mono">
                          {item.color} • Size {item.size} • Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-medium text-white">{formatPrice(item.priceAUD * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-neutral-800 text-sm">
              <span className="font-serif uppercase tracking-widest text-neutral-300">Total Paid</span>
              <span className="font-mono font-bold text-base text-white">{formatPrice(orderComplete.totalAUD)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/shop"
              className="flex-1 bg-white text-black text-center py-3 px-6 rounded text-xs uppercase tracking-[0.2em] font-bold hover:bg-neutral-200 transition-colors"
            >
              Continue Exploring
            </Link>
            <Link
              href="/"
              className="flex-1 bg-neutral-800 text-neutral-300 text-center py-3 px-6 rounded text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-700 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT VIEW ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased selection:bg-white selection:text-black">
      
      {/* Top Checkout Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur sticky top-0 z-30 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-block group">
            <span className="text-base sm:text-lg font-extrabold tracking-[0.25em] uppercase font-display text-white group-hover:text-neutral-300 transition-colors">
              CARLTON VALLEY
            </span>
          </Link>

          <div className="flex items-center space-x-6 text-xs">
            <div className="hidden sm:flex items-center space-x-1.5 text-neutral-400 font-mono text-[11px]">
              <Lock size={13} className="text-emerald-400" />
              <span>256-Bit Encrypted Atelier Checkout</span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center space-x-1 bg-neutral-900 border border-neutral-800 rounded px-2 py-1">
              <button
                onClick={() => setCurrency("LKR")}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                  currency === "LKR" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                LKR
              </button>
              <button
                onClick={() => setCurrency("AUD")}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                  currency === "AUD" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                AUD
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Boutique</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart Notice */
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">Your shopping bag is empty</h2>
            <p className="text-neutral-400 text-xs">Explore our latest seasonal arrivals and bespoke pieces to checkout.</p>
            <Link
              href="/shop"
              className="inline-block bg-white text-black px-6 py-3 rounded text-xs uppercase tracking-[0.2em] font-bold hover:bg-neutral-200 transition-colors mt-2"
            >
              Shop Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ─── LEFT: CHECKOUT FORM (7 COLS) ───────────────────────────── */}
            <div className="lg:col-span-7 space-y-8">
              
              <form onSubmit={handleSubmitOrder} className="space-y-8">
                
                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded text-xs flex items-start space-x-2 animate-shake">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ── SECTION 1: CONTACT INFORMATION ── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-mono text-xs flex items-center justify-center font-bold">1</span>
                      Contact Information
                    </h2>
                    {!isAuthenticated && (
                      <Link href="/login" className="text-[11px] text-neutral-400 hover:text-white underline">
                        Have an account? Sign in
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alexander Vance"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+94 77 123 4567 or +61 412 345 678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {!isAuthenticated && (
                      <div className="sm:col-span-2 bg-neutral-950/90 border border-neutral-800/90 rounded-lg p-3.5 space-y-2 mt-1">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-2 text-[11px] font-semibold text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={createAccount}
                              onChange={(e) => setCreateAccount(e.target.checked)}
                              className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                            />
                            <span>Create Client Account (Automated Tracking & Ledger Access)</span>
                          </label>
                          <span className="text-[10px] text-emerald-400 font-mono">Recommended</span>
                        </div>
                        {createAccount && (
                          <div className="pt-1.5 space-y-1">
                            <label className="block text-[10px] uppercase tracking-wider text-neutral-400">
                              Account Password (Min 6 Characters) <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="password"
                              required={createAccount}
                              minLength={6}
                              placeholder="Create a secure password..."
                              value={accountPassword}
                              onChange={(e) => setAccountPassword(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors font-mono"
                            />
                            <p className="text-[10px] text-neutral-500">
                              Your account will be instantly registered and authenticated upon order confirmation.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── SECTION 2: SHIPPING DESTINATION ── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                  <div className="border-b border-neutral-800 pb-3">
                    <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-mono text-xs flex items-center justify-center font-bold">2</span>
                      Delivery Destination
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Country Selector (Sri Lanka or Australia) */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleCountryChange("Sri Lanka")}
                        className={`p-3.5 rounded border text-left flex items-center justify-between transition-all ${
                          country === "Sri Lanka"
                            ? "bg-neutral-800 border-white text-white shadow-lg"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">🇱🇰</span>
                          <div>
                            <span className="block text-xs font-semibold text-white">Sri Lanka</span>
                            <span className="block text-[10px] text-neutral-400 font-mono">25 Districts Available</span>
                          </div>
                        </div>
                        {country === "Sri Lanka" && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCountryChange("Australia")}
                        className={`p-3.5 rounded border text-left flex items-center justify-between transition-all ${
                          country === "Australia"
                            ? "bg-neutral-800 border-white text-white shadow-lg"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">🇦🇺</span>
                          <div>
                            <span className="block text-xs font-semibold text-white">Australia</span>
                            <span className="block text-[10px] text-neutral-400 font-mono">8 States & Territories</span>
                          </div>
                        </div>
                        {country === "Australia" && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                      </button>
                    </div>

                    {/* Sub-Location Dropdown (District or State) */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        {country === "Sri Lanka" ? "District (Select from 25 Districts)" : "State / Territory"} <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white rounded px-3.5 py-2.5 text-xs focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        {country === "Sri Lanka"
                          ? SL_DISTRICTS.map((dist) => (
                              <option key={dist} value={dist} className="bg-neutral-900 text-white">
                                {dist} District
                              </option>
                            ))
                          : AU_STATES.map((st) => (
                              <option key={st} value={st} className="bg-neutral-900 text-white">
                                {st}
                              </option>
                            ))}
                      </select>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        Street Address / Apartment <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="No. 42 Crown Street, Suite 5B"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                          City / Suburb
                        </label>
                        <input
                          type="text"
                          placeholder={country === "Sri Lanka" ? "Colombo 07 / Kandy" : "Sydney / Melbourne"}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                          Postal / ZIP Code
                        </label>
                        <input
                          type="text"
                          placeholder="00700 or 2010"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 3: PAYMENT DETAILS (CARD / VISA) ── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-mono text-xs flex items-center justify-center font-bold">3</span>
                      Payment Method
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300 font-mono text-[10px] font-bold">
                        VISA
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300 font-mono text-[10px] font-bold">
                        MC
                      </span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-[10px] font-bold">
                        AMEX
                      </span>
                    </div>
                  </div>

                  {/* Visual Card Preview / Details */}
                  <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-4">
                    
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        Cardholder Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="NAME ON CARD"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white uppercase placeholder-neutral-600 font-mono focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] uppercase tracking-wider text-neutral-400">
                          Card Number <span className="text-red-400">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-neutral-400">{getCardBrand()}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4532 •••• •••• ••••"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white font-mono tracking-widest placeholder-neutral-600 focus:outline-none focus:border-white transition-colors pr-10"
                        />
                        <CreditCard size={16} className="absolute right-3 top-3 text-neutral-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                          Expiry Date <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-white transition-colors text-center"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] uppercase tracking-wider text-neutral-400">
                            CVC / CVV <span className="text-red-400">*</span>
                          </label>
                          <span title="3 or 4 digits on back of card" className="cursor-pointer text-neutral-500 hover:text-white">
                            <HelpCircle size={12} />
                          </span>
                        </div>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-white transition-colors text-center"
                        />
                      </div>
                    </div>

                    <label className="flex items-center space-x-2 text-[11px] text-neutral-400 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={sameBilling}
                        onChange={(e) => setSameBilling(e.target.checked)}
                        className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0"
                      />
                      <span>Billing address is same as shipping destination</span>
                    </label>
                  </div>
                </div>

                {/* ── SUBMIT BUTTON ── */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black py-4 rounded-lg text-xs uppercase tracking-[0.25em] font-extrabold hover:bg-neutral-200 transition-all flex items-center justify-center space-x-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Authorize Payment • {formatPrice(finalTotalAUD)}</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ─── RIGHT: ORDER SUMMARY (5 COLS) ──────────────────────────── */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="font-serif font-bold uppercase tracking-wider text-white text-sm">
                    Bag Summary ({cart.reduce((s, i) => s + i.quantity, 0)})
                  </h3>
                  <Link href="/shop" className="text-[11px] text-neutral-400 hover:text-white underline">
                    Modify Bag
                  </Link>
                </div>

                {/* Line Items List */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex space-x-3 text-xs">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-16 object-cover rounded bg-neutral-800 shrink-0"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-neutral-700 text-white rounded-full w-4 h-4 text-[10px] font-mono flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-medium text-white line-clamp-1">{item.name}</h4>
                        <p className="text-neutral-400 font-mono text-[11px] mt-0.5">
                          {item.color} • Size {item.size}
                        </p>
                        <p className="text-neutral-300 font-mono font-medium mt-1">
                          {formatPrice(item.priceAUD * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-neutral-800 pt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotalAUD)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Truck size={12} />
                      <span>Shipping ({country})</span>
                    </span>
                    <span>{shippingFee === 0 ? "Complimentary" : formatPrice(shippingFee)}</span>
                  </div>

                  {shippingFee === 0 && (
                    <p className="text-[10px] text-emerald-400 font-sans">
                      ✓ Complimentary worldwide luxury delivery applied
                    </p>
                  )}

                  <div className="flex justify-between items-center text-sm font-serif pt-3 border-t border-neutral-800 text-white font-bold">
                    <span>Total Amount</span>
                    <span className="font-mono text-base">{formatPrice(finalTotalAUD)}</span>
                  </div>
                </div>
              </div>

              {/* Atelier Guarantees */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 space-y-2.5 text-xs text-neutral-400">
                <div className="flex items-center space-x-2 text-white text-[11px] font-semibold">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Carlton Valley Certified Quality Guarantee</span>
                </div>
                <ul className="text-[11px] space-y-1.5 text-neutral-400 pl-5 list-disc marker:text-neutral-600">
                  <li>Directly dispatched from our Sydney atelier or Colombo warehouse</li>
                  <li>Eco-friendly luxury garment packaging included</li>
                  <li>Complimentary returns on undamaged items within 14 days</li>
                </ul>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
