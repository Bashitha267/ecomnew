"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ArrowRight } from "lucide-react";

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* SECTION 1: HERO FULLSCREEN LOOKBOOK BANNER */}
      <section className="relative w-full h-[80vh] sm:h-[85vh] lg:h-[92vh] min-h-[550px] bg-neutral-900 overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <img
          src="/images/cat_shop_all.jpg"
          alt="Carlton Valley Atelier"
          className="w-full h-full object-cover object-center"
        />

        {/* Subtle Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />

        {/* Centered Single Serif Title "About Us" */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pt-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-[0.08em] text-white drop-shadow-lg">
            About Us
          </h1>
        </div>
      </section>

      {/* SECTION 2: BRAND MANIFESTO & STORY TEXT (Matching Screenshot 2) */}
      <section className="py-20 md:py-28 px-6 md:px-12 max-w-[1200px] mx-auto w-full">
        <div className="max-w-2xl mx-auto md:ml-[25%] space-y-8 font-serif text-sm sm:text-base md:text-[17px] leading-relaxed text-neutral-800 font-light">
          <p>
            At Carlton Valley, we want to tell stories and give meaning to the things we make.
          </p>

          <p>
            We see the brand as something that grows over time. A long story made up of ideas, moments, references, and decisions. Not everything needs to be loud or groundbreaking. What matters is building something that feels consistent and real as it evolves.
          </p>

          <p>
            We think of Carlton Valley as a kind of ongoing archive. Each collection adds to what came before. Some ideas stick around, some change, some disappear. Together, they form a record of where we&apos;ve been and how the brand has developed.
          </p>
        </div>
      </section>

      {/* SECTION 3: 2-COLUMN EDITORIAL IMAGERY (Matching Screenshot 3) */}
      <section className="px-4 md:px-8 max-w-[1700px] mx-auto w-full pb-20 md:pb-28">
        <div className="overflow-hidden rounded-xs">
          <img
            src="/images/about/about_editorial_pair.jpg"
            alt="Carlton Valley Editorial Lookbook Pairs"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* SECTION 4: FOUR TENETS OF THE CARLTON VALLEY STANDARD (Matching Screenshot 4) */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full border-t border-neutral-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Clothing Rack Image with Overlay */}
          <div className="lg:col-span-6 relative aspect-[3/4] bg-neutral-100 overflow-hidden rounded-xs group shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop"
              alt="Hanging Wardrobe Rack"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 border border-neutral-200 text-black space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 block">
                THE ESSENTIAL WARDROBE
              </span>
              <h4 className="font-serif text-sm md:text-base font-bold tracking-wide text-neutral-900">
                Designed in Sydney, Worn Worldwide
              </h4>
            </div>
          </div>

          {/* Right Column: Four Tenets List */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 block">
                03 • OUR COMMITMENT
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-[42px] font-serif font-light text-neutral-900 leading-tight">
                Four Tenets of the <br />
                <span className="italic font-normal">Carlton Valley Standard</span>
              </h2>
            </div>

            <div className="space-y-6 divide-y divide-neutral-100 font-sans text-xs">
              {/* Tenet 01 */}
              <div className="pt-4 flex items-start space-x-5">
                <span className="font-mono text-xs text-neutral-400 font-semibold pt-0.5 select-none">
                  01
                </span>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-neutral-900 tracking-wide">
                    Relaxed Architecture
                  </h3>
                  <p className="text-neutral-600 font-serif text-xs sm:text-sm leading-relaxed">
                    Precise drops at the shoulder, generous chest measurements, and tailored proportions that balance ease with structure.
                  </p>
                </div>
              </div>

              {/* Tenet 02 */}
              <div className="pt-4 flex items-start space-x-5">
                <span className="font-mono text-xs text-neutral-400 font-semibold pt-0.5 select-none">
                  02
                </span>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-neutral-900 tracking-wide">
                    Tactile Richness
                  </h3>
                  <p className="text-neutral-600 font-serif text-xs sm:text-sm leading-relaxed">
                    Heavyweight botanical twills and sand-washed silks that provide substantive weight without trapping heat.
                  </p>
                </div>
              </div>

              {/* Tenet 03 */}
              <div className="pt-4 flex items-start space-x-5">
                <span className="font-mono text-xs text-neutral-400 font-semibold pt-0.5 select-none">
                  03
                </span>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-neutral-900 tracking-wide">
                    Monochromatic Palette
                  </h3>
                  <p className="text-neutral-600 font-serif text-xs sm:text-sm leading-relaxed">
                    Earthy hues, charcoal blacks, bone whites, and botanical greens designed for seamless outfit coordination.
                  </p>
                </div>
              </div>

              {/* Tenet 04 */}
              <div className="pt-4 flex items-start space-x-5">
                <span className="font-mono text-xs text-neutral-400 font-semibold pt-0.5 select-none">
                  04
                </span>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-neutral-900 tracking-wide">
                    Ethical Stewardship
                  </h3>
                  <p className="text-neutral-600 font-serif text-xs sm:text-sm leading-relaxed">
                    Ethically audited manufacturing partners ensuring living wages, clean water recycling, and non-toxic dye houses.
                  </p>
                </div>
              </div>
            </div>

            {/* Shop Collection CTA Button (Matching Screenshot 4) */}
            <div className="pt-6">
              <Link
                href="/shop"
                className="inline-flex items-center space-x-3 border border-black px-7 py-3 text-xs uppercase font-serif tracking-[0.2em] font-semibold text-black hover:bg-black hover:text-white transition-colors group"
              >
                <span>SHOP THE COLLECTION</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
