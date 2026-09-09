"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "../../context/StoreContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ProductSize, FullProduct } from "../../data/data";
import { getImageUrl } from "../../lib/api";
import {
  SlidersHorizontal,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
  X,
  ChevronDown,
  Star,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ArrowRight,
  Layers,
} from "lucide-react";

const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "2XL"];

function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category");

  const { products, categories, addToCart } = useStore();
  const { formatPrice } = useCurrency();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam || "All");
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [preOrderOnly, setPreOrderOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>("featured");

  // Sync category with URL search param if it changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Layout State
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Quick Add Notification
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // Collect all unique colors from current products
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach((p) => {
      p.colors.forEach((c) => {
        if (!colorMap.has(c.name)) {
          colorMap.set(c.name, c.hex || "#333");
        }
      });
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Toggle size filter
  const toggleSize = (size: ProductSize) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Toggle color filter
  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setPreOrderOnly(false);
    setMaxPrice(500);
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    inStockOnly ||
    preOrderOnly ||
    maxPrice < 500;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }
      // Max price filter
      if (p.priceAUD > maxPrice) {
        return false;
      }
      // Sizes filter
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => p.sizes.includes(s));
        if (!hasSize) return false;
      }
      // Colors filter
      if (selectedColors.length > 0) {
        const hasColor = selectedColors.some((c) => p.colors.some((col) => col.name === c));
        if (!hasColor) return false;
      }
      // Availability filter
      if (inStockOnly && !p.inStock) {
        return false;
      }
      if (preOrderOnly && !p.preOrder) {
        return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.priceAUD - b.priceAUD);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.priceAUD - a.priceAUD);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === "newest") {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, maxPrice, selectedSizes, selectedColors, inStockOnly, preOrderOnly, sortBy]);

  const handleQuickAdd = (p: FullProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = p.colors[0];
    addToCart({
      productId: p.id,
      name: p.name,
      priceAUD: p.priceAUD,
      color: defaultColor?.name || "Standard",
      size: p.sizes[0] || "M",
      image: defaultColor?.images[0] || defaultColor?.swatchImage || "",
      quantity: 1,
    });
    setAddedItemName(p.name);
    setTimeout(() => setAddedItemName(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased flex flex-col selection:bg-neutral-900 selection:text-white">
      <Navbar />

      {/* Quick Add Toast Notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded shadow-2xl text-xs font-mono flex items-center space-x-2 animate-fadeIn">
          <Check size={14} className="text-emerald-400" />
          <span>Added &ldquo;{addedItemName}&rdquo; to your shopping bag.</span>
        </div>
      )}

      {/* Top Category Hero Banner */}
      <div className="pt-28 md:pt-36 pb-8 border-b border-neutral-100 bg-[#fafafa]">
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-3 flex items-center space-x-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Categories & Shop</span>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-light tracking-wide text-neutral-900">
                {selectedCategory === "All" ? "All Categories" : selectedCategory}
              </h1>
              <p className="text-xs text-neutral-500 font-serif max-w-xl mt-2 leading-relaxed">
                Elevated silhouettes, refined tailoring, and sustainable textiles. Explore our complete signature collection across all categories.
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </div>
          </div>

          {/* Category Cards Carousel / Quick Nav on Shop Page */}
          <div className="pt-4 border-t border-neutral-200/80">
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`flex-shrink-0 px-5 py-2.5 rounded-none border text-xs font-serif tracking-[0.16em] uppercase transition-all ${
                  selectedCategory === "All"
                    ? "bg-black text-white border-black font-semibold shadow"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-black"
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.title).length;
                const isSelected = selectedCategory === cat.title;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.title)}
                    className={`flex-shrink-0 flex items-center space-x-2.5 px-4 py-2 border transition-all ${
                      isSelected
                        ? "bg-black text-white border-black font-semibold shadow"
                        : "bg-white text-neutral-700 border-neutral-200 hover:border-black"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-serif tracking-[0.14em] uppercase">{cat.title}</span>
                    <span className="text-[10px] font-mono opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="max-w-[1700px] w-full mx-auto px-4 md:px-8 lg:px-12 py-8 flex-1">
        
        {/* Controls Bar: Mobile Filter Button, Sorting, Grid Switcher */}
        <div className="flex justify-between items-center pb-6 border-b border-neutral-200 gap-4 flex-wrap">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold border border-neutral-300 px-4 py-2 hover:border-black"
          >
            <SlidersHorizontal size={14} />
            <span>Filters ({hasActiveFilters ? "Active" : "All"})</span>
          </button>

          {/* Active Filter Tags */}
          <div className="hidden lg:flex items-center space-x-2 flex-wrap text-xs">
            {hasActiveFilters && (
              <>
                <span className="text-neutral-400 uppercase text-[10px] font-mono">Filtered By:</span>
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center space-x-1 bg-neutral-100 px-2.5 py-1 text-[11px] rounded font-mono">
                    <span>Category: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory("All")} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                {selectedSizes.map((s) => (
                  <span key={s} className="inline-flex items-center space-x-1 bg-neutral-100 px-2.5 py-1 text-[11px] rounded font-mono">
                    <span>Size: {s}</span>
                    <button onClick={() => toggleSize(s)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
                {selectedColors.map((c) => (
                  <span key={c} className="inline-flex items-center space-x-1 bg-neutral-100 px-2.5 py-1 text-[11px] rounded font-mono">
                    <span>Color: {c}</span>
                    <button onClick={() => toggleColor(c)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
                {inStockOnly && (
                  <span className="inline-flex items-center space-x-1 bg-neutral-100 px-2.5 py-1 text-[11px] rounded font-mono">
                    <span>In Stock Only</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-black underline ml-2"
                >
                  Clear All
                </button>
              </>
            )}
          </div>

          {/* Right Controls: Sort & Grid View */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-neutral-400 uppercase tracking-wider text-[11px] hidden sm:inline font-mono">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-neutral-300 text-neutral-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-black font-sans"
              >
                <option value="featured">Featured Collection</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Desktop Grid Switcher */}
            <div className="hidden md:flex items-center border border-neutral-300 divide-x divide-neutral-300">
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 transition-colors ${gridCols === 2 ? "bg-black text-white" : "text-neutral-500 hover:text-black"}`}
                title="2 Columns Grid"
              >
                <Grid2X2 size={15} />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 transition-colors ${gridCols === 3 ? "bg-black text-white" : "text-neutral-500 hover:text-black"}`}
                title="3 Columns Grid"
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2 transition-colors ${gridCols === 4 ? "bg-black text-white" : "text-neutral-500 hover:text-black"}`}
                title="4 Columns Grid"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Catalog Grid (Left: Faceted Filter Sidebar, Right: Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 text-xs self-start">
            
            {/* Category Filter Accordion */}
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-neutral-900">
                Categories
              </h3>
              <ul className="space-y-2 font-serif text-xs">
                <li>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full text-left flex items-center justify-between py-1 transition-colors ${
                      selectedCategory === "All" ? "font-bold text-black" : "text-neutral-600 hover:text-black"
                    }`}
                  >
                    <span>All Garments</span>
                    <span className="font-mono text-[11px] text-neutral-400">{products.length}</span>
                  </button>
                </li>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.title).length;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.title)}
                        className={`w-full text-left flex items-center justify-between py-1 transition-colors ${
                          selectedCategory === cat.title
                            ? "font-bold text-black"
                            : "text-neutral-600 hover:text-black"
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className="font-mono text-[11px] text-neutral-400">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Size Filter */}
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-neutral-900">
                  Size
                </h3>
                {selectedSizes.length > 0 && (
                  <button onClick={() => setSelectedSizes([])} className="text-[10px] uppercase font-mono text-neutral-400 hover:text-black">
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {ALL_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-center border transition-all ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "border-neutral-200 text-neutral-800 hover:border-neutral-400 bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette Filter */}
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-neutral-900">
                  Colorway
                </h3>
                {selectedColors.length > 0 && (
                  <button onClick={() => setSelectedColors([])} className="text-[10px] uppercase font-mono text-neutral-400 hover:text-black">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map(({ name, hex }) => {
                  const isSelected = selectedColors.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleColor(name)}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xs border text-[11px] font-sans transition-all ${
                        isSelected
                          ? "border-black bg-neutral-900 text-white font-medium"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-neutral-300"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-neutral-900">
                  Max Price
                </h3>
                <span className="font-mono text-xs text-neutral-800 font-semibold">
                  {formatPrice(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>{formatPrice(50)}</span>
                <span>{formatPrice(500)}</span>
              </div>
            </div>

            {/* Availability Toggles */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-neutral-900">
                Availability
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span className="text-neutral-700">In Stock Items Only</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preOrderOnly}
                    onChange={(e) => setPreOrderOnly(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span className="text-neutral-700">Pre-Order Available</span>
                </label>
              </div>
            </div>

          </aside>

          {/* RIGHT COLUMN: PRODUCT CATALOG GRID */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-200 rounded-sm space-y-4">
                <h3 className="text-xl font-serif text-neutral-800">No matching products found</h3>
                <p className="text-xs text-neutral-500 font-sans max-w-sm mx-auto">
                  Try adjusting your size, color, or category filters to see more luxury apparel.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-black text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-x-6 gap-y-10 ${
                  gridCols === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : gridCols === 3
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {filteredProducts.map((p) => {
                  const raw1 = p.colors[0]?.images[0] || p.colors[0]?.swatchImage;
                  const raw2 = p.colors[0]?.images[1] || raw1;
                  const img1 = getImageUrl(raw1);
                  const img2 = getImageUrl(raw2, img1);
                  return (
                    <div key={p.id} className="group flex flex-col text-center relative">
                      
                      {/* Dual Image Hover Card */}
                      <Link
                        href={`/product/${p.id}`}
                        className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-3.5 block"
                      >
                        <img
                          src={img1}
                          alt={p.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                          }}
                          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"
                        />
                        <img
                          src={img2}
                          alt={`${p.name} secondary angle`}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = img1;
                          }}
                          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                        />

                        {/* Badges */}
                        {p.badge && (
                          <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 z-10">
                            {p.badge}
                          </span>
                        )}

                        {/* Quick Add Overlay on desktop hover */}
                        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button
                            onClick={(e) => handleQuickAdd(p, e)}
                            className="w-full bg-white/95 backdrop-blur text-black hover:bg-black hover:text-white py-2.5 text-[11px] font-bold uppercase tracking-widest shadow-lg transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <ShoppingBag size={13} />
                            <span>Quick Add</span>
                          </button>
                        </div>
                      </Link>

                      {/* Color dots */}
                      <div className="flex justify-center items-center space-x-1.5 mb-2">
                        {p.colors.map((c) => (
                          <span
                            key={c.id}
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                            style={{ backgroundColor: c.hex || "#333" }}
                            title={c.name}
                          />
                        ))}
                      </div>

                      {/* Product Title with Luxury Editorial Typography */}
                      <Link
                        href={`/product/${p.id}`}
                        className="text-[14px] sm:text-[15px] font-serif font-medium tracking-wide text-neutral-900 group-hover:text-neutral-500 transition-colors line-clamp-1 leading-snug"
                      >
                        {p.name}
                      </Link>

                      {/* Price in Selected Currency (Crisp Space Mono) */}
                      <span className="text-xs font-mono font-semibold tracking-tight text-neutral-900 mt-1.5">
                        {formatPrice(p.priceAUD, p.priceLKR)}
                      </span>

                      {/* Star rating info */}
                      <div className="flex items-center justify-center space-x-1.5 mt-1.5 text-[11px] text-neutral-500 font-mono">
                        <div className="flex text-emerald-950">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < Math.floor(p.rating || 5)
                                  ? "fill-emerald-950 text-emerald-950 stroke-none"
                                  : "text-neutral-300 stroke-none fill-neutral-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-neutral-700">{p.rating?.toFixed(1) || "5.0"}</span>
                        <span className="text-neutral-400">({p.reviewCount || p.reviews?.length || 22})</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MOBILE SLIDE-OVER FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between animate-slideLeft">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
                <h3 className="font-serif text-base uppercase tracking-widest font-bold">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-neutral-500 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase text-neutral-500">Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-neutral-300 p-2 text-xs"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase text-neutral-500">Sizes</h4>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {ALL_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-center border ${
                        selectedSizes.includes(size) ? "bg-black text-white" : "border-neutral-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>Max Price</span>
                  <span>{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest font-bold"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
              <button
                onClick={resetFilters}
                className="w-full py-2 text-xs uppercase tracking-widest text-neutral-500 font-mono underline"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans text-xs uppercase tracking-widest">
          Loading Carlton Valley Catalog...
        </div>
      }
    >
      <ShopCatalogContent />
    </Suspense>
  );
}
