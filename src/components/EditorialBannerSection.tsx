"use client";

import React, { useState, useEffect } from "react";
import { EDITORIAL_BANNER_DATA, EditorialBanner, fetchEditorialBanner } from "../data/data";

export const EditorialBannerSection: React.FC = () => {
  const [banner, setBanner] = useState<EditorialBanner>(EDITORIAL_BANNER_DATA);

  useEffect(() => {
    async function loadData() {
      const data = await fetchEditorialBanner();
      setBanner(data);
    }
    loadData();
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[650px] overflow-hidden bg-neutral-950 text-white flex items-end justify-center text-center pb-20 md:pb-28 border-b border-neutral-800">
      {/* Fullscreen Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <img
          src={banner.image}
          alt={banner.headline}
          className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-1000"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        {/* Dark Vignette Overlay (Matching reference image aesthetic) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/30" />
        <div className="absolute inset-0 bg-black/20 backdrop-brightness-[0.88]" />
      </div>

      {/* Editorial Content Overlay (Positioned at bottom center matching reference screenshot) */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
        {/* Kicker Subtitle */}
        <p className="text-xs sm:text-sm font-sans tracking-[0.28em] font-light text-neutral-300 uppercase mb-3.5 opacity-90 drop-shadow-md">
          {banner.subtitle}
        </p>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light font-serif tracking-[0.12em] text-white drop-shadow-xl leading-tight">
          {banner.headline}
        </h2>
      </div>
    </section>
  );
};
