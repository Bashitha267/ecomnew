"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface FeaturedVideoSectionProps {
  videoSrc?: string;
  onCtaClick?: () => void;
}

export const FeaturedVideoSection: React.FC<FeaturedVideoSectionProps> = ({
  videoSrc = "/hero2.mp4",
  onCtaClick,
}) => {
  return (
    <section className="py-20 lg:py-28 px-4 md:px-8 bg-neutral-950 text-white overflow-hidden border-b border-neutral-800 flex items-center justify-center">
      {/* Centered Balanced Container (Restored to previous centered alignment) */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center justify-items-center">
        
        {/* Left Side: Portrait Video Container */}
        <div className="w-full max-w-[420px] flex justify-center">
          <div className="relative w-full group rounded-xs overflow-hidden shadow-2xl bg-neutral-900 aspect-[3/4] max-h-[580px]">
            <video
              id="featured-video"
              className="w-full h-full object-cover scale-[1.01] group-hover:scale-105 transition-transform duration-1000 ease-out"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>
        </div>

        {/* Right Side: Centered Authentic Text Block */}
        <div className="w-full max-w-[480px] flex flex-col justify-center space-y-6">
          
          <div className="space-y-2">
            <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-neutral-400">
              EDITORIAL // VOL. 01
            </span>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-light font-serif tracking-[0.14em] uppercase leading-tight text-white">
              CARLTON VALLEY
            </h2>
          </div>

          <div className="w-12 h-[1px] bg-neutral-700" />

          {/* Minimal Authentic Text */}
          <p className="text-sm font-sans font-light leading-relaxed text-neutral-300 tracking-wide">
            Structured tailoring built with uncompromised natural textiles and timeless minimalist form.
          </p>

          {/* Minimalist Highlights */}
          <div className="grid grid-cols-2 gap-6 pt-2 text-xs">
            <div className="border-l border-neutral-800 pl-4 py-1">
              <span className="block text-white font-serif text-xs tracking-wider uppercase mb-1">PRECISION CUT</span>
              <span className="text-[11px] font-sans font-light text-neutral-400">Architectural tailoring.</span>
            </div>
            <div className="border-l border-neutral-800 pl-4 py-1">
              <span className="block text-white font-serif text-xs tracking-wider uppercase mb-1">PURE TEXTILES</span>
              <span className="text-[11px] font-sans font-light text-neutral-400">Natural silk, wool & linen.</span>
            </div>
          </div>

          {/* Minimalist CTA Link */}
          <div className="pt-4">
            <button
              onClick={() => {
                if (onCtaClick) {
                  onCtaClick();
                } else {
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="inline-flex items-center space-x-3 text-xs tracking-[0.25em] uppercase font-semibold font-sans text-white hover:text-neutral-300 transition-colors group"
            >
              <span className="border-b border-white group-hover:border-neutral-300 pb-1">Explore Collection</span>
              <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
