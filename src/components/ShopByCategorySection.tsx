"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "../context/StoreContext";

interface ShopByCategorySectionProps {
  onCategoryClick?: (categoryId: string) => void;
}

export const ShopByCategorySection: React.FC<ShopByCategorySectionProps> = ({ onCategoryClick }) => {
  const { categories } = useStore();

  return (
    <section id="categories" className="py-20 md:py-28 px-4 md:px-8 bg-white text-black border-b border-neutral-100">
      <div className="max-w-[1700px] mx-auto">
        
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-light font-serif tracking-[0.2em] uppercase text-black">
            Shop By Category
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.title)}`}
              className="group relative aspect-[3/4] overflow-hidden bg-neutral-900 cursor-pointer rounded-xs shadow-md block"
            >
              {/* Category Background Image with Hover Scale */}
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover object-center scale-[1.01] group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop";
                }}
              />

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/80 transition-colors duration-300" />

              {/* Boxed Overlay Button at Bottom Center */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-auto">
                <span className="inline-block px-6 sm:px-8 py-3 border border-white/80 bg-black/40 backdrop-blur-xs text-white text-xs font-serif tracking-[0.22em] uppercase group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-xl whitespace-nowrap">
                  {category.buttonText}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

