"use client";

import React, { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { COMING_SOON_DATA, Product, fetchComingSoon } from "../data/data";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export const ComingSoonSection: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>(COMING_SOON_DATA);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load products from data store (Prepared for Supabase query integration)
  useEffect(() => {
    async function loadData() {
      const data = await fetchComingSoon();
      setProducts(data);
    }
    loadData();
  }, []);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);

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

  // Slice exactly 4 products for the current page
  const currentProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section id="coming-soon" className="py-20 md:py-28 px-4 md:px-8 bg-white text-black border-b border-neutral-100">
      <div className="max-w-[1700px] mx-auto">
        
        {/* Header Section */}
        <div className="relative text-center mb-12 flex flex-col sm:flex-row items-center justify-between">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-light font-serif tracking-[0.2em] uppercase text-black">
              Coming Soon
            </h2>
          </div>

          {/* Carousel Control Arrows (Swipes 4 products at a time) */}
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <span className="text-xs font-mono text-neutral-400 tracking-widest mr-2">
              0{currentPage + 1} / 0{totalPages}
            </span>
            <button
              onClick={handlePrev}
              className="p-2.5 border border-neutral-200 text-black hover:bg-black hover:text-white transition-all rounded-full"
              aria-label="Previous 4 Products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 border border-neutral-200 text-black hover:bg-black hover:text-white transition-all rounded-full"
              aria-label="Next 4 Products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 4 Products Grid (Exactly 4 Products in One Row on Desktop) */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 transition-opacity duration-300 ${
            isAnimating ? "opacity-30" : "opacity-100"
          }`}
        >
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col text-center"
            >
              {/* Product Image Container with Dual Image Hover Effect */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100 mb-4 rounded-xs">
                
                {/* Primary Image */}
                <img
                  src={product.primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                />

                {/* Secondary Image (Hover Effect) */}
                <img
                  src={product.secondaryImage}
                  alt={`${product.name} secondary view`}
                  className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                />

                {/* Badge if present */}
                {product.badge && (
                  <span className="absolute top-3 left-3 z-10 text-[10px] font-mono tracking-widest uppercase bg-black text-white px-2.5 py-1">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Details (Matching UI Screenshot) */}
              <div className="space-y-1.5 px-2">
                <h3 className="text-sm font-serif tracking-wide text-neutral-900 group-hover:text-neutral-600 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-xs font-mono font-medium text-neutral-700">
                  {formatPrice(product.priceAUD)}
                </p>

                {/* Rating Stars */}
                <div className="flex items-center justify-center space-x-1 pt-1">
                  <div className="flex text-emerald-900">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-emerald-900 text-emerald-900 stroke-none"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 ml-1">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Swipe Page Progress Dots */}
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
              className={`h-1.5 transition-all rounded-full ${
                currentPage === idx ? "w-6 bg-black" : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
