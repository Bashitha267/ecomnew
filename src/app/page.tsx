"use client";

import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { FeaturedVideoSection } from "../components/FeaturedVideoSection";
import { NewArrivalsSection } from "../components/NewArrivalsSection";
import { ShopByCategorySection } from "../components/ShopByCategorySection";
import { EditorialBannerSection } from "../components/EditorialBannerSection";
import { ComingSoonSection } from "../components/ComingSoonSection";
import { CommunitySpotlightSection } from "../components/CommunitySpotlightSection";
import { ValuePropsSection } from "../components/ValuePropsSection";
import { Footer } from "../components/Footer";

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      {/* Top Fixed Navbar */}
      <Navbar onNavClick={scrollToSection} />

      {/* Hero Section with Video Background */}
      <Hero videoSrc="/hero1.mp4" onExploreClick={() => scrollToSection("shop")} />

      {/* Featured Video Section (Left Video + Minimal Authentic Text on Right) */}
      <FeaturedVideoSection videoSrc="/hero2.mp4" onCtaClick={() => scrollToSection("shop")} />

      {/* New Arrivals Section (3-Product Swipe Slider with Dual Image Hover Effect) */}
      <NewArrivalsSection />

      {/* Shop By Category Section (3 Category Cards with Boxed Overlay Buttons) */}
      <ShopByCategorySection onCategoryClick={() => scrollToSection("shop")} />

      {/* Editorial Background Image Banner Section (Fullscreen Height & Width) */}
      <EditorialBannerSection />

      {/* Coming Soon Section (4 Products in One Row Swipe Carousel) */}
      <ComingSoonSection />

      {/* Community Spotlight Section (5 Instagram Lookbook Cards with Floating Arrow) */}
      <CommunitySpotlightSection />

      {/* Value Props & Features Bar Section (4 Columns: Returns, Shipping, Buy Now Pay Later, Worldwide) */}
      <ValuePropsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
