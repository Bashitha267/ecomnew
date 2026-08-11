"use client";

import React from "react";
import { useCurrency } from "../context/CurrencyContext";
import { ArrowRight, Tag, Clock, Info, ShoppingBag } from "lucide-react";

interface SectionPlaceholderProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bgVariant?: "white" | "light" | "dark";
}

export const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  id,
  title,
  subtitle,
  description,
  bgVariant = "white",
}) => {
  const { formatPrice } = useCurrency();

  const getBgClass = () => {
    switch (bgVariant) {
      case "light":
        return "bg-neutral-50 text-black border-y border-neutral-200/60";
      case "dark":
        return "bg-neutral-950 text-white border-y border-neutral-800";
      default:
        return "bg-white text-black";
    }
  };

  // Sample prices in AUD to showcase currency switcher functionality in placeholder previews
  const sampleProducts = [
    { title: "Carlton Oversized Blazer", priceAUD: 280, tag: "New Arrival" },
    { title: "Valley Linen Tailored Trouser", priceAUD: 195, tag: "Bestseller" },
    { title: "Silk Resort Collar Shirt", priceAUD: 160, tag: "Exclusive" },
  ];

  return (
    <section id={id} className={`py-24 md:py-32 px-4 md:px-8 transition-colors duration-300 ${getBgClass()}`}>
      <div className="max-w-6xl mx-auto text-center">
        {/* Subtitle / Category Header */}
        <span className="inline-block text-xs font-mono tracking-[0.35em] uppercase text-neutral-500 mb-3">
          {subtitle}
        </span>

        {/* Section Heading */}
        <h2 className="text-3xl md:text-5xl font-light font-serif tracking-[0.15em] uppercase mb-6">
          {title}
        </h2>

        {/* Main Placeholder Text requested by user ("This is About Us section", etc.) */}
        <div className="max-w-2xl mx-auto my-8 p-8 border border-dashed border-neutral-300 rounded-sm bg-white/50 backdrop-blur-xs">
          <p className="text-base md:text-lg font-serif italic text-neutral-700 tracking-wide mb-2">
            "{description}"
          </p>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            [ Section Placeholder View ]
          </span>
        </div>

        {/* Interactive Currency Sample Cards for Shop / Sale sections */}
        {(id === "shop" || id === "sale") && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {sampleProducts.map((prod, idx) => (
              <div
                key={idx}
                className="group p-6 border border-neutral-200 bg-white hover:border-black transition-all duration-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-black text-white px-2 py-0.5">
                      {prod.tag}
                    </span>
                    <ShoppingBag size={16} className="text-neutral-400 group-hover:text-black transition-colors" />
                  </div>
                  <h4 className="font-serif text-lg tracking-wide mb-2 text-black">{prod.title}</h4>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Price</span>
                  <span className="font-semibold font-mono text-sm text-black">
                    {formatPrice(prod.priceAUD)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clean Action Footer */}
        <div className="mt-10 flex items-center justify-center space-x-2 text-xs font-mono tracking-widest uppercase text-neutral-400">
          <span>CARLTON VALLEY Framework</span>
          <span>•</span>
          <span>CURRENCY READY (AUD / LKR)</span>
        </div>
      </div>
    </section>
  );
};
