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
import { SectionPlaceholder } from "../components/SectionPlaceholder";
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
      <FeaturedVideoSection videoSrc="/hero2.mp4" onCtaClick={() => scrollToSection("brand")} />

      {/* New Arrivals Section (3-Product Swipe Slider with Dual Image Hover Effect) */}
      <NewArrivalsSection />

      {/* Shop By Category Section (3 Category Cards with Boxed Overlay Buttons) */}
      <ShopByCategorySection onCategoryClick={() => scrollToSection("shop")} />

      {/* Editorial Background Image Banner Section */}
      <EditorialBannerSection />

      {/* Coming Soon Section (4 Products in One Row Swipe Carousel) */}
      <ComingSoonSection />

      {/* Community Spotlight Section (5 Instagram Lookbook Cards with Floating Arrow) */}
      <CommunitySpotlightSection />

      {/* Section Placeholders as requested */}
      <div className="flex flex-col">
        {/* BRAND / ABOUT US Section Placeholder */}
        <SectionPlaceholder
          id="brand"
          title="ABOUT US & BRAND STORY"
          subtitle="OUR ETHOS"
          description="This is About Us section"
          bgVariant="light"
        />

        {/* SALE Section Placeholder */}
        <SectionPlaceholder
          id="sale"
          title="ARCHIVE & SALE"
          subtitle="LIMITED TIMEFRAME"
          description="This is Sale section"
          bgVariant="light"
        />

        {/* INFO Section Placeholder */}
        <SectionPlaceholder
          id="info"
          title="INFO & CUSTOMER CARE"
          subtitle="SUPPORT & INQUIRIES"
          description="This is Info section"
          bgVariant="white"
        />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
