"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface HeroProps {
  videoSrc?: string;
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  videoSrc = "/hero1.mp4",
  onExploreClick,
}) => {
  return (
    <section className="relative w-full h-screen min-h-[650px] overflow-hidden bg-black text-white flex items-center justify-center">
      {/* Background Video Player (Autoplay & Muted) */}
      <video
        id="hero-video"
        className="absolute inset-0 w-full h-full object-cover scale-[1.02] transition-transform duration-700"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Luxury Dark Vignette Tint Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/50" />
      <div className="absolute inset-0 bg-black/20 backdrop-brightness-[0.88]" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-16">
        <span className="text-xs md:text-sm tracking-[0.35em] uppercase text-neutral-300 font-sans font-light mb-4 opacity-90 animate-fadeIn">
          Autumn / Winter 2026 Collection
        </span>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[0.18em] font-serif uppercase text-white mb-6 drop-shadow-md">
          CARLTON VALLEY
        </h2>

        <p className="text-sm md:text-base text-neutral-300 tracking-[0.15em] font-sans font-light max-w-xl mb-10 opacity-80 leading-relaxed">
          Contemporary tailoring & timeless silhouettes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => {
              if (onExploreClick) {
                onExploreClick();
              } else {
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-8 py-3.5 bg-white text-black text-xs tracking-[0.25em] uppercase font-semibold font-sans hover:bg-neutral-200 transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl"
          >
            Explore Collection
          </button>
          
          <button
            onClick={() => {
              document.getElementById("brand")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3.5 border border-white/60 text-white text-xs tracking-[0.25em] uppercase font-medium font-sans hover:bg-white/10 transition-all duration-300 backdrop-blur-xs"
          >
            Discover Brand
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator (Bottom Center) */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/70 hover:text-white transition-colors cursor-pointer"
        onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="text-[10px] tracking-[0.3em] uppercase mb-1 font-sans">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </div>
    </section>
  );
};
