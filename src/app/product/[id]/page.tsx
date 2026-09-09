"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useStore } from "../../../context/StoreContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { analyticsApi } from "../../../lib/api";
import { Navbar } from "../../../components/Navbar";
import { Footer } from "../../../components/Footer";
import { ProductSize, ProductReview, FullProduct } from "../../../data/data";
import {
  Star,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  X,
  Share2,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Maximize2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { getProductById, products, addToCart, addReview } = useStore();
  const { formatPrice, currency } = useCurrency();

  // Retrieve current product (fallback to first product if not found)
  const product: FullProduct = getProductById(id) || products[0];

  // Selected state
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product?.sizes?.[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [isAddedToBag, setIsAddedToBag] = useState(false);

  // Accordion states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(true);

  // Lightbox & Modal states
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [activeMediaModal, setActiveMediaModal] = useState<{ url: string; type: "photo" | "video"; name: string } | null>(null);

  // New Review Form
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    rating: 5,
    title: "",
    comment: "",
    itemSize: "M",
    mediaType: "video" as "photo" | "video",
    mediaUrl: "",
  });

  // Review submission state
  const [reviewSubmitState, setReviewSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [reviewSubmitError, setReviewSubmitError] = useState("");

  // ── Analytics: fire a 'view' event once when the product page loads ──────
  useEffect(() => {
    if (product?.id) {
      analyticsApi.track(product.id, 'view');
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif">Product Not Found</h2>
          <Link href="/shop" className="text-xs uppercase tracking-widest underline">
            Return to Collection
          </Link>
        </div>
      </div>
    );
  }

  const currentColor = product.colors[selectedColorIdx] || product.colors[0];
  const galleryImages = currentColor?.images || [];
  const afterpayInstallment = (product.priceAUD / 4).toFixed(2);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      priceAUD: product.priceAUD,
      color: currentColor.name,
      size: selectedSize,
      image: galleryImages[0] || currentColor.swatchImage,
      quantity: quantity,
    });
    // ── Analytics: fire an 'add_to_bag' event ──────────────────────────────
    analyticsApi.track(product.id, 'add_to_bag');
    setIsAddedToBag(true);
    setTimeout(() => setIsAddedToBag(false), 2500);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.reviewerName || !newReview.comment) {
      alert("Please fill in reviewer name and feedback comment");
      return;
    }

    setReviewSubmitState("submitting");
    setReviewSubmitError("");

    try {
      await addReview(product.id, {
        reviewerName: newReview.reviewerName,
        verified: false,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        itemSize: newReview.itemSize,
        itemColor: currentColor.name,
        mediaType: newReview.mediaUrl ? newReview.mediaType : undefined,
        mediaUrl: newReview.mediaUrl || undefined,
        mediaThumbnail: newReview.mediaUrl ? newReview.mediaUrl : undefined,
      });

      setReviewSubmitState("success");
      setNewReview({
        reviewerName: "",
        rating: 5,
        title: "",
        comment: "",
        itemSize: "M",
        mediaType: "video",
        mediaUrl: "",
      });
    } catch {
      setReviewSubmitState("error");
      setReviewSubmitError("Failed to submit review. Please try again.");
    }
  };

  // Other related products
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Product Container with high-fashion spacing */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 md:px-8 lg:px-12 pt-28 md:pt-36 pb-20">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-6 flex items-center space-x-2">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* 2-Column Product Grid (Left: 6-Image Gallery, Right: Sticky Purchase Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* LEFT COLUMN: UP TO 6 IMAGES GALLERY (2x2 or 2-column aesthetic layout) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {galleryImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveLightboxImg(imgUrl)}
                  className="relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-zoom-in group"
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} - Angle ${idx + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full backdrop-blur-xs">
                    <Maximize2 size={14} />
                  </div>
                  {idx === 0 && product.badge && (
                    <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1">
                      {product.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO & PURCHASE PANEL (Sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-6">
            
            {/* Title & Price Header */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light tracking-wide text-neutral-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline space-x-3 pt-1">
                <span className="text-lg md:text-xl font-mono font-medium text-neutral-900">
                  {formatPrice(product.priceAUD, product.priceLKR)}
                </span>
                {product.preOrder && (
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Pre Order Available
                  </span>
                )}
              </div>

              {/* Afterpay 4 Interest-Free Installments Banner */}
              <div className="flex items-center space-x-1.5 text-xs text-neutral-600 pt-1">
                <span>or 4 interest-free payments of</span>
                <span className="font-mono font-bold text-neutral-900">${afterpayInstallment}</span>
                <span>with</span>
                <span className="bg-[#b2fce4] text-neutral-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  afterpay
                </span>
                <button
                  onClick={() => alert("Afterpay allows you to shop now and pay in 4 equal interest-free fortnightly installments.")}
                  className="text-neutral-400 hover:text-neutral-900 text-[11px]"
                >
                  ⓘ
                </button>
              </div>
            </div>

            {/* COLOR SELECTION (With Swatches) */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">
                  Color: <strong className="text-neutral-900 font-medium font-serif">{currentColor?.name}</strong>
                </span>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  {product.colors.length} {product.colors.length === 1 ? "Option" : "Options"}
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.id || idx}
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`relative w-14 h-16 rounded overflow-hidden border-2 transition-all group ${
                      selectedColorIdx === idx
                        ? "border-black ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-400 opacity-80 hover:opacity-100"
                    }`}
                    title={color.name}
                  >
                    <img
                      src={color.swatchImage || color.images[0]}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTION & SIZE CHART */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">
                  Size: <strong className="text-neutral-900 font-mono">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setIsSizeChartOpen(true)}
                  className="underline text-neutral-600 hover:text-black transition-colors uppercase tracking-wider text-[11px]"
                >
                  Size chart
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs font-mono font-medium border transition-all text-center ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 text-neutral-900 hover:border-neutral-400 bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* RATING SUMMARY */}
            <div className="flex items-center space-x-2 text-xs pt-1">
              <div className="flex text-emerald-900">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(product.rating || 5)
                        ? "fill-emerald-900 text-emerald-900 stroke-none"
                        : "text-neutral-300"
                    }
                  />
                ))}
              </div>
              <a
                href="#reviews"
                className="text-xs font-mono text-neutral-600 underline hover:text-black"
              >
                ({product.reviewCount || product.reviews?.length || 22})
              </a>
            </div>

            {/* QUANTITY & ADD TO CART BUTTON */}
            <div className="space-y-3 pt-2">
              <div className="flex space-x-3">
                {/* Quantity box */}
                <div className="flex items-center border border-neutral-300 w-32 justify-between px-3 py-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-neutral-500 hover:text-black transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-neutral-500 hover:text-black transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Solid Black Add To Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white hover:bg-neutral-800 transition-colors uppercase tracking-[0.2em] text-xs font-bold py-4.5 px-6 text-center"
                >
                  {isAddedToBag ? "Added To Bag ✔" : "Add to cart"}
                </button>
              </div>

              {/* Free shipping & returns note */}
              <p className="text-center text-[11px] text-neutral-500 tracking-wider">
                Free shipping over $200 · Free returns
              </p>
            </div>


            {/* EXPANDABLE ACCORDIONS: DESCRIPTION & SHIPPING */}
            <div className="border-t border-neutral-200 pt-4 divide-y divide-neutral-200">
              
              {/* Description Accordion */}
              <div className="py-4">
                <button
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-sm font-serif tracking-widest uppercase font-medium text-neutral-900">
                    Description
                  </span>
                  <span className="text-neutral-500 group-hover:text-black">
                    {isDescOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {isDescOpen && (
                  <div className="mt-4 space-y-3.5 text-xs text-neutral-700 leading-relaxed animate-fadeIn">
                    {product.descriptionSection?.header && (
                      <h4 className="font-serif font-semibold text-neutral-900 text-sm">
                        {product.descriptionSection.header}
                      </h4>
                    )}
                    <p className="text-neutral-600">
                      {product.descriptionSection?.description ||
                        "Cut for a relaxed drape, this essential piece embodies contemporary minimalism."}
                    </p>

                    {product.descriptionSection?.fit && (
                      <div>
                        <strong className="text-neutral-900 uppercase font-mono text-[10px] tracking-wider block mb-0.5">
                          Fit:
                        </strong>
                        <p className="text-neutral-600">{product.descriptionSection.fit}</p>
                      </div>
                    )}

                    {product.descriptionSection?.fabric && (
                      <div>
                        <strong className="text-neutral-900 uppercase font-mono text-[10px] tracking-wider block mb-0.5">
                          Fabric:
                        </strong>
                        <p className="text-neutral-600">{product.descriptionSection.fabric}</p>
                      </div>
                    )}

                    {product.descriptionSection?.details && (
                      <div>
                        <strong className="text-neutral-900 uppercase font-mono text-[10px] tracking-wider block mb-0.5">
                          Details:
                        </strong>
                        <p className="text-neutral-600">{product.descriptionSection.details}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping Accordion (Matching Screenshot 1: media_1787103558286.png) */}
              <div className="py-4">
                <button
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-sm font-serif tracking-widest uppercase font-medium text-neutral-900">
                    Shipping
                  </span>
                  <span className="text-neutral-500 group-hover:text-black">
                    {isShippingOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {isShippingOpen && (
                  <div className="mt-4 space-y-6 text-xs text-neutral-700 leading-relaxed animate-fadeIn">
                    {product.shippingSections?.map((section, sIdx) => (
                      <div key={sIdx} className="space-y-2.5">
                        {section.header !== "Shipping" && (
                          <h4 className="font-serif font-bold text-neutral-900 text-sm tracking-wide">
                            {section.header}
                          </h4>
                        )}
                        <ul className="space-y-2">
                          {section.points.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start space-x-2 text-neutral-600">
                              <span className="text-neutral-400 select-none">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* CUSTOMER REVIEWS SECTION (Matching Screenshot 2: media_1787103613408.png) */}
        <section id="reviews" className="mt-24 pt-16 border-t border-neutral-200">
          
          {/* Overall Rating Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-neutral-200 gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex text-emerald-900">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-emerald-950 p-1 mr-1 rounded-xs">
                    <Star size={18} className="fill-white text-white stroke-none" />
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-1 font-serif text-2xl font-light text-neutral-900">
                <span>{product.rating?.toFixed(1) || "5.0"}</span>
                <ChevronDown size={18} className="text-neutral-400 cursor-pointer" />
              </div>
            </div>

            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="border border-black text-black hover:bg-black hover:text-white transition-colors uppercase tracking-[0.18em] text-xs font-semibold py-2.5 px-6 rounded-none"
            >
              Write A Review
            </button>
          </div>

          {/* List of Reviews */}
          <div className="divide-y divide-neutral-100">
            {(product.reviews || []).map((review) => (
              <div key={review.id} className="py-8 space-y-3">
                {/* Reviewer Name & Verified Badge */}
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-sm text-neutral-900 tracking-wide">
                    {review.reviewerName}
                  </span>
                  {review.verified && (
                    <span className="flex items-center space-x-1 text-[11px] text-neutral-500 font-sans">
                      <CheckCircle size={13} className="text-neutral-900" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* Review Date */}
                <div className="text-[11px] font-mono text-neutral-400">
                  {review.date}
                </div>

                {/* Star rating icons matching reference green boxes */}
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`p-0.5 rounded-xs ${
                        i < review.rating ? "bg-emerald-950 text-white" : "bg-neutral-200 text-neutral-400"
                      }`}
                    >
                      <Star size={11} className="fill-current stroke-none" />
                    </div>
                  ))}
                </div>

                {/* Review comment text */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-3xl font-serif">
                  {review.comment}
                </p>

                {/* Purchased Size metadata */}
                {review.itemSize && (
                  <div className="text-xs text-neutral-500 font-serif pt-1">
                    <span className="text-neutral-400 block text-[11px]">Item type:</span>
                    <span className="font-mono text-neutral-800">{review.itemSize}</span>
                  </div>
                )}

                {/* Attached Photo or Video Thumbnail with Play Button */}
                {review.mediaUrl && (
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        setActiveMediaModal({
                          url: review.mediaUrl!,
                          type: review.mediaType || "photo",
                          name: review.reviewerName,
                        })
                      }
                      className="relative w-28 aspect-[3/4] bg-neutral-100 rounded-xs overflow-hidden group block cursor-pointer border border-neutral-200"
                    >
                      {review.mediaThumbnail ? (
                        <img
                          src={review.mediaThumbnail}
                          alt="Customer review photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800" />
                      )}
                      {/* Semi-transparent play circle overlay for video */}
                      {review.mediaType === "video" && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-xs flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                            <Play size={16} className="fill-black ml-0.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

        {/* RELATED APPAREL / YOU MAY ALSO LIKE */}
        <section className="mt-24 pt-16 border-t border-neutral-200">
          <h3 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-neutral-900 mb-8 text-center sm:text-left">
            Complete The Look
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relImg1 = rel.colors[0]?.images[0] || rel.colors[0]?.swatchImage;
              const relImg2 = rel.colors[0]?.images[1] || relImg1;
              return (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="group flex flex-col text-center"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3 rounded-xs">
                    <img
                      src={relImg1}
                      alt={rel.name}
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
                    />
                    <img
                      src={relImg2}
                      alt={rel.name}
                      className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    {rel.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest">
                        {rel.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-serif text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    {rel.name}
                  </h4>
                  <span className="text-xs font-mono font-medium text-neutral-700 mt-1">
                    {formatPrice(rel.priceAUD, rel.priceLKR)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

      </main>

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-6 right-6 text-white hover:opacity-70 p-2"
          >
            <X size={28} />
          </button>
          <img
            src={activeLightboxImg}
            alt="High-resolution view"
            className="max-w-full max-h-[90vh] object-contain shadow-2xl animate-scaleUp"
          />
        </div>
      )}

      {/* VIDEO / PHOTO MEDIA VIEWER MODAL */}
      {activeMediaModal && (
        <div
          onClick={() => setActiveMediaModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden animate-scaleUp text-white"
          >
            <div className="p-3 bg-black flex justify-between items-center text-xs font-serif">
              <span>{activeMediaModal.name}&apos;s Media</span>
              <button onClick={() => setActiveMediaModal(null)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black min-h-[360px]">
              {activeMediaModal.type === "video" ? (
                <video src={activeMediaModal.url} controls autoPlay className="max-h-[75vh] w-auto shadow-xl" />
              ) : (
                <img src={activeMediaModal.url} alt="Review media" className="max-h-[75vh] w-auto object-contain shadow-xl" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black max-w-lg w-full p-6 shadow-2xl rounded-sm space-y-4 animate-scaleUp text-xs font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <h3 className="text-base font-serif uppercase tracking-widest">
                Write a Review for {product.name}
              </h3>
              <button onClick={() => setIsWriteReviewOpen(false)} className="text-neutral-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-500 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.reviewerName}
                    onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                    placeholder="e.g. Darius H."
                    className="w-full border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-500 mb-1">
                    Rating
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                  >
                    <option value="5">★★★★★ (5/5 Stars)</option>
                    <option value="4">★★★★☆ (4/5 Stars)</option>
                    <option value="3">★★★☆☆ (3/5 Stars)</option>
                    <option value="2">★★☆☆☆ (2/5 Stars)</option>
                    <option value="1">★☆☆☆☆ (1/5 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-500 mb-1">
                  Item Size
                </label>
                <select
                  value={newReview.itemSize}
                  onChange={(e) => setNewReview({ ...newReview, itemSize: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                >
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      Size {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-500 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="e.g. Loved the shirt!"
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-500 mb-1">
                  Your Review *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Tell others about the fit, texture, drape..."
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                />
              </div>

              {/* Photo or Video attach */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2">
                <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-500">
                  Attach Photo or Video (URL)
                </label>
                <div className="flex space-x-2">
                  <select
                    value={newReview.mediaType}
                    onChange={(e) => setNewReview({ ...newReview, mediaType: e.target.value as any })}
                    className="border border-neutral-300 p-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="video">Video</option>
                    <option value="photo">Photo</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Video MP4 or Image URL..."
                    value={newReview.mediaUrl}
                    onChange={(e) => setNewReview({ ...newReview, mediaUrl: e.target.value })}
                    className="flex-1 border border-neutral-300 p-2 text-xs focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Error feedback */}
              {reviewSubmitState === "error" && (
                <p className="text-red-600 text-xs font-medium">{reviewSubmitError}</p>
              )}

              {/* Success state */}
              {reviewSubmitState === "success" ? (
                <div className="pt-4 border-t border-neutral-200 text-center space-y-3">
                  <div className="text-emerald-600 font-semibold text-sm">✓ Review Submitted!</div>
                  <p className="text-neutral-500 text-xs">
                    Thank you! Your review has been received and will appear after approval.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWriteReviewOpen(false);
                      setReviewSubmitState("idle");
                    }}
                    className="bg-black text-white px-6 py-2 uppercase tracking-widest font-bold text-xs hover:bg-neutral-800"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWriteReviewOpen(false);
                      setReviewSubmitState("idle");
                    }}
                    className="px-4 py-2 text-neutral-500 hover:text-black uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitState === "submitting"}
                    className="bg-black text-white px-6 py-2.5 uppercase tracking-widest font-bold hover:bg-neutral-800 disabled:opacity-60 flex items-center space-x-2"
                  >
                    {reviewSubmitState === "submitting" && (
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    )}
                    <span>{reviewSubmitState === "submitting" ? "Submitting..." : "Submit Review"}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}


      {/* SIZE CHART MODAL */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp text-xs font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <h3 className="text-base font-serif uppercase tracking-widest">
                Size & Measurement Guide (cm)
              </h3>
              <button onClick={() => setIsSizeChartOpen(false)} className="text-neutral-500 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-300 pb-1 text-neutral-500 uppercase">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest</th>
                  <th className="py-2">Length</th>
                  <th className="py-2">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-2 font-bold">XS</td>
                  <td className="py-2">108 cm</td>
                  <td className="py-2">72 cm</td>
                  <td className="py-2">49 cm</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">S</td>
                  <td className="py-2">114 cm</td>
                  <td className="py-2">74 cm</td>
                  <td className="py-2">51 cm</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">M</td>
                  <td className="py-2">120 cm</td>
                  <td className="py-2">76 cm</td>
                  <td className="py-2">53 cm</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">L</td>
                  <td className="py-2">126 cm</td>
                  <td className="py-2">78 cm</td>
                  <td className="py-2">55 cm</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">XL</td>
                  <td className="py-2">132 cm</td>
                  <td className="py-2">80 cm</td>
                  <td className="py-2">57 cm</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">2XL</td>
                  <td className="py-2">138 cm</td>
                  <td className="py-2">82 cm</td>
                  <td className="py-2">59 cm</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-neutral-500 font-serif italic">
              Designed with a relaxed oversize drape. Order your standard size for the intended silhouette.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
