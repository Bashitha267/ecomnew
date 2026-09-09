"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCurrency } from "../context/CurrencyContext";
import { useStore } from "../context/StoreContext";
import { analyticsApi, getImageUrl, getProductCardImages } from "../lib/api";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export const NewArrivalsSection: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { products } = useStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const newArrivals = products.filter((p) => p.isNewArrival);
  const displayList = newArrivals.length > 0 ? newArrivals : products;

  const itemsPerPage = 3;
  const totalPages = Math.ceil(displayList.length / itemsPerPage);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const currentProducts = displayList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase block mb-1">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-neutral-900 font-light">
              New Arrivals
            </h2>
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Previous items"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Next items"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* 3 Products Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-opacity duration-300 ${
            isAnimating ? "opacity-30" : "opacity-100"
          }`}
        >
          {currentProducts.map((product) => {
            const { img1, img2 } = getProductCardImages(product.colors[0]);
            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                onClick={() => analyticsApi.track(product.id, 'click')}
                className="group cursor-pointer flex flex-col text-center"
              >
                {/* Product Image Container with Dual Image Hover Effect */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100 mb-4 rounded-xs">
                  
                  {/* Primary Image */}
                  <img
                    src={img1}
                    alt={product.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                    }}
                    className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                  />

                  {/* Secondary Image (Hover Effect) */}
                  <img
                    src={img2}
                    alt={`${product.name} secondary view`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = img1;
                    }}
                    className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                  />

                  {/* Badge if present */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-mono tracking-widest uppercase bg-black text-white px-2.5 py-1">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-1.5 px-2">
                  <h3 className="text-[14px] sm:text-[15px] font-serif font-medium tracking-wide text-neutral-900 group-hover:text-neutral-500 transition-colors line-clamp-1 leading-snug">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs font-mono font-semibold tracking-tight text-neutral-900">
                    {formatPrice(product.priceAUD, product.priceLKR)}
                  </p>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-center space-x-1.5 pt-1">
                    <div className="flex text-emerald-950">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className="fill-emerald-950 text-emerald-950 stroke-none"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono font-medium text-neutral-500">
                      ({product.rating.toFixed(1)})
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Swipe Page Progress Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-10">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrentPage(idx);
                    setTimeout(() => setIsAnimating(false), 300);
                  }
                }}
                className={`h-1.5 transition-all rounded-full cursor-pointer ${
                  currentPage === idx ? "w-6 bg-black" : "w-2 bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

