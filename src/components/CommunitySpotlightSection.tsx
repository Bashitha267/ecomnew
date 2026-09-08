"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { COMMUNITY_SPOTLIGHT_DATA, CommunitySpotlight, fetchCommunitySpotlight } from "../data/data";
import { ChevronRight, Camera } from "lucide-react";
import { communitySpotlightApi } from "../lib/api";

export const CommunitySpotlightSection: React.FC = () => {
  const [spotlights, setSpotlights] = useState<CommunitySpotlight[]>(COMMUNITY_SPOTLIGHT_DATA);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await communitySpotlightApi.list({ activeOnly: true });
        if (res.data?.success && res.data.spotlights && res.data.spotlights.length > 0) {
          const mapped: CommunitySpotlight[] = res.data.spotlights.map((s) => ({
            id: s.id,
            username: s.username,
            image: s.image,
            productTagged: s.productTagged,
          }));
          setSpotlights(mapped);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch remote spotlight items, falling back to static data:", err);
      }

      const fallback = await fetchCommunitySpotlight();
      setSpotlights(fallback);
    }
    loadData();
  }, []);

  const handleNext = () => {
    if (spotlights.length <= 5) return;
    const maxStart = Math.max(1, spotlights.length - 4);
    setStartIndex((prev) => (prev + 1) % maxStart);
  };

  // Slice 5 items to display side-by-side
  const visibleItems = spotlights.length <= 5 ? spotlights : spotlights.slice(startIndex, startIndex + 5);

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-white text-black border-b border-neutral-100 relative">
      <div className="max-w-[1700px] mx-auto">
        
        {/* Section Heading (Matching UI Screenshot) */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-light font-serif tracking-[0.2em] uppercase text-black">
            Community Spotlight
          </h2>
        </div>

        {/* 5 Images Grid Container with Floating Navigation Arrow */}
        <div className="relative">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer rounded-xs shadow-xs"
              >
                {/* Community Photo */}
                <img
                  src={item.image}
                  alt={`Community post by ${item.username}`}
                  className="w-full h-full object-cover object-center scale-[1.01] group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop";
                  }}
                />

                {/* Dark Vignette Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Camera size={14} className="text-white/80" />
                    <span className="text-xs font-mono tracking-wider font-medium">{item.username}</span>
                  </div>
                  {item.productTagged && (
                    <span className="text-[10px] font-sans text-neutral-300 font-light truncate">
                      {item.productTagged}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Floating Right Arrow Button (Matching UI Screenshot) */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/95 text-black hover:bg-black hover:text-white transition-all duration-300 rounded-full shadow-2xl flex items-center justify-center border border-neutral-200"
            aria-label="Next Spotlight Items"
          >
            <ChevronRight size={22} />
          </button>

        </div>

      </div>
    </section>
  );
};
