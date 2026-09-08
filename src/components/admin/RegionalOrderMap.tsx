"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Order } from "../../data/data";
import { SL_DISTRICTS, AU_STATES } from "../../lib/locations";
import { Globe, MapPin, TrendingUp, DollarSign, Package, Eye, RefreshCw, Layers } from "lucide-react";

interface RegionalOrderMapProps {
  orders: Order[];
  formatPrice: (priceAUD: number) => string;
}

// ─── SRI LANKA 9 PROVINCES & 25 DISTRICTS MAPPING ───────────────────────────
const SL_PROVINCE_MAP: Record<string, { name: string; districts: string[] }> = {
  western: {
    name: "Western Province",
    districts: ["Colombo", "Gampaha", "Kalutara", "Kaḷutara"],
  },
  central: {
    name: "Central Province",
    districts: ["Kandy", "Mahanuvara", "Matale", "Nuwara Eliya"],
  },
  southern: {
    name: "Southern Province",
    districts: ["Galle", "Matara", "Hambantota"],
  },
  northern: {
    name: "Northern Province",
    districts: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  },
  eastern: {
    name: "Eastern Province",
    districts: ["Trincomalee", "Batticaloa", "Ampara"],
  },
  northWestern: {
    name: "North Western Province",
    districts: ["Kurunegala", "Puttalam"],
  },
  northCentral: {
    name: "North Central Province",
    districts: ["Anuradhapura", "Polonnaruwa"],
  },
  uva: {
    name: "Uva Province",
    districts: ["Badulla", "Monaragala"],
  },
  sabaragamuwa: {
    name: "Sabaragamuwa Province",
    districts: ["Ratnapura", "Kegalle"],
  },
};

// ─── AUSTRALIA 8 STATES & TERRITORIES MAPPING ──────────────────────────────
const AU_STATE_MAP: Record<string, { code: string; name: string; aliases: string[] }> = {
  "AU-NSW": { code: "NSW", name: "New South Wales", aliases: ["New South Wales", "NSW", "New South Wales (NSW)"] },
  "AU-VIC": { code: "VIC", name: "Victoria", aliases: ["Victoria", "VIC", "Victoria (VIC)"] },
  "AU-QLD": { code: "QLD", name: "Queensland", aliases: ["Queensland", "QLD", "Queensland (QLD)"] },
  "AU-WA":  { code: "WA",  name: "Western Australia", aliases: ["Western Australia", "WA", "Western Australia (WA)"] },
  "AU-SA":  { code: "SA",  name: "South Australia", aliases: ["South Australia", "SA", "South Australia (SA)"] },
  "AU-TAS": { code: "TAS", name: "Tasmania", aliases: ["Tasmania", "TAS", "Tasmania (TAS)"] },
  "AU-ACT": { code: "ACT", name: "Australian Capital Territory", aliases: ["Australian Capital Territory", "ACT", "Australian Capital Territory (ACT)"] },
  "AU-NT":  { code: "NT",  name: "Northern Territory", aliases: ["Northern Territory", "NT", "Northern Territory (NT)"] },
};

const AUD_TO_LKR_RATE = 210.5;

const formatRegionalPrice = (amountAUD: number, country: "Sri Lanka" | "Australia"): string => {
  if (country === "Sri Lanka") {
    const lkr = Math.round((Number(amountAUD) || 0) * AUD_TO_LKR_RATE);
    return `LKR ${lkr.toLocaleString()}`;
  }
  return `AUD $${(Number(amountAUD) || 0).toFixed(2)}`;
};

export const RegionalOrderMap: React.FC<RegionalOrderMapProps> = ({ orders, formatPrice }) => {
  const [selectedCountry, setSelectedCountry] = useState<"Sri Lanka" | "Australia">("Sri Lanka");
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoadingSvg, setIsLoadingSvg] = useState(true);
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    provinceName?: string;
    count: number;
    revenue: number;
    subtext?: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch MapSVG XML file on country switch ───────────────────────────────
  useEffect(() => {
    setIsLoadingSvg(true);
    const fileName = selectedCountry === "Sri Lanka" ? "/maps/sri-lanka.svg" : "/maps/australia.svg";

    fetch(fileName)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map");
        return res.text();
      })
      .then((text) => {
        setSvgContent(text);
      })
      .catch((err) => {
        console.error("Error loading SVG:", err);
      })
      .finally(() => {
        setIsLoadingSvg(false);
      });
  }, [selectedCountry]);

  // ─── Sri Lanka Province & District Orders Aggregation ─────────────────────
  const slStats = useMemo(() => {
    const slOrders = orders.filter(
      (o) =>
        o.country === "Sri Lanka" ||
        (!o.country && (o.shippingAddress?.includes("Sri Lanka") || o.shippingAddress?.includes("Colombo")))
    );

    const districtCounts: Record<string, { count: number; revenue: number }> = {};
    const provinceCounts: Record<string, { count: number; revenue: number }> = {};

    Object.keys(SL_PROVINCE_MAP).forEach((provKey) => {
      provinceCounts[provKey] = { count: 0, revenue: 0 };
    });

    slOrders.forEach((o) => {
      const orderDistrict = o.district || "Colombo";
      const total = Number(o.totalAUD || 0);

      // District tally
      const cleanDist = orderDistrict.toLowerCase();
      districtCounts[cleanDist] = {
        count: (districtCounts[cleanDist]?.count || 0) + 1,
        revenue: (districtCounts[cleanDist]?.revenue || 0) + total,
      };

      // Province tally
      let foundProvKey = Object.keys(SL_PROVINCE_MAP).find((k) =>
        SL_PROVINCE_MAP[k].districts.some(
          (d) => d.toLowerCase() === cleanDist || o.shippingAddress?.toLowerCase().includes(d.toLowerCase())
        )
      );

      if (!foundProvKey) foundProvKey = "western"; // Default

      provinceCounts[foundProvKey].count += 1;
      provinceCounts[foundProvKey].revenue += total;
    });

    const maxDistrictCount = Math.max(1, ...Object.values(districtCounts).map((v) => v.count));
    const maxProvinceCount = Math.max(1, ...Object.values(provinceCounts).map((v) => v.count));

    return { districtCounts, provinceCounts, totalOrders: slOrders.length, maxDistrictCount, maxProvinceCount };
  }, [orders]);

  // ─── Australia State Orders Aggregation ───────────────────────────────────
  const auStats = useMemo(() => {
    const auOrders = orders.filter(
      (o) =>
        o.country === "Australia" ||
        (!o.country &&
          (o.shippingAddress?.includes("Australia") ||
            o.shippingAddress?.includes("NSW") ||
            o.shippingAddress?.includes("VIC") ||
            o.shippingAddress?.includes("QLD")))
    );

    const stateCounts: Record<string, { count: number; revenue: number }> = {};

    Object.keys(AU_STATE_MAP).forEach((key) => {
      stateCounts[key] = { count: 0, revenue: 0 };
    });

    auOrders.forEach((o) => {
      const orderText = (o.district || o.shippingAddress || "").toLowerCase();
      const total = Number(o.totalAUD || 0);

      let foundKey = Object.keys(AU_STATE_MAP).find((k) =>
        AU_STATE_MAP[k].aliases.some((alias) => orderText.includes(alias.toLowerCase()))
      );

      if (!foundKey) foundKey = "AU-NSW"; // Default

      stateCounts[foundKey].count += 1;
      stateCounts[foundKey].revenue += total;
    });

    const maxCount = Math.max(1, ...Object.values(stateCounts).map((v) => v.count));
    return { stateCounts, totalOrders: auOrders.length, maxCount };
  }, [orders]);

  // ─── Color Helper based on order density ─────────────────────────────────
  const getDensityColor = (count: number, max: number) => {
    if (count === 0) return "#1c1c1c"; // Clean dark slate
    const r = count / max;
    if (r >= 0.7) return "#047857"; // Deep Emerald
    if (r >= 0.3) return "#059669"; // Emerald
    return "#065f46"; // Subtle Emerald
  };

  // ─── Attach Interactivity & Visible Order Count Badges to SVG DOM ──────────
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    // Calibrated viewBox for full height clarity
    if (selectedCountry === "Sri Lanka") {
      svgElement.setAttribute("viewBox", "0 0 450 793");
    } else {
      svgElement.setAttribute("viewBox", "0 0 443 416");
    }

    svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgElement.setAttribute("class", "w-full h-full max-h-[620px] lg:max-h-[660px] transition-all duration-300 drop-shadow-2xl mx-auto block");

    // Remove any previously appended overlay groups
    const existingLabelsGroup = svgElement.querySelector("#order-count-overlay-group");
    if (existingLabelsGroup) existingLabelsGroup.remove();

    // Create a new overlay group for visible order count badges
    const overlayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    overlayGroup.setAttribute("id", "order-count-overlay-group");

    const paths = svgElement.querySelectorAll("path");

    paths.forEach((path) => {
      const pathId = path.getAttribute("id") || "";
      const pathTitle = path.getAttribute("title") || pathId;

      let count = 0;
      let revenue = 0;
      let provinceLabel = "";

      if (selectedCountry === "Sri Lanka") {
        // Match district by title / ID
        const cleanTitle = pathTitle.toLowerCase().replace(/[^a-z]/g, "");
        const matchedDistKey = Object.keys(slStats.districtCounts).find(
          (k) => k.replace(/[^a-z]/g, "") === cleanTitle || cleanTitle.includes(k.replace(/[^a-z]/g, ""))
        );

        if (matchedDistKey) {
          count = slStats.districtCounts[matchedDistKey].count;
          revenue = slStats.districtCounts[matchedDistKey].revenue;
        }

        // Find Province
        const provKey = Object.keys(SL_PROVINCE_MAP).find((pk) =>
          SL_PROVINCE_MAP[pk].districts.some(
            (d) => d.toLowerCase().replace(/[^a-z]/g, "") === cleanTitle
          )
        );
        if (provKey) {
          provinceLabel = SL_PROVINCE_MAP[provKey].name;
        }

        const fillColor = getDensityColor(count, slStats.maxDistrictCount);
        path.setAttribute("fill", fillColor);
        // Clear high-contrast borders
        path.setAttribute("stroke", count > 0 ? "#34d399" : "#444444");
        path.setAttribute("stroke-width", count > 0 ? "1.8" : "0.9");
        path.style.cursor = "pointer";
        path.style.transition = "all 0.2s ease";

        // Centroid calculation for high-visibility order count pins
        try {
          const bbox = path.getBBox();
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y + bbox.height / 2;

          if (count > 0 && bbox.width > 5 && bbox.height > 5) {
            const badgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            badgeGroup.setAttribute("class", "cursor-pointer");

            // Outer Pulse Glow Circle
            const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pulseCircle.setAttribute("cx", cx.toString());
            pulseCircle.setAttribute("cy", cy.toString());
            pulseCircle.setAttribute("r", "20");
            pulseCircle.setAttribute("fill", "rgba(16, 185, 129, 0.25)");
            pulseCircle.setAttribute("class", "animate-ping");

            // Pin badge background
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", cx.toString());
            circle.setAttribute("cy", cy.toString());
            circle.setAttribute("r", "16");
            circle.setAttribute("fill", "#10b981");
            circle.setAttribute("stroke", "#ffffff");
            circle.setAttribute("stroke-width", "2.5");
            circle.setAttribute("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.8))");

            // Text Count Number
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", cx.toString());
            text.setAttribute("y", (cy + 5).toString());
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "#000000");
            text.setAttribute("font-size", "13");
            text.setAttribute("font-weight", "900");
            text.setAttribute("font-family", "monospace");
            text.textContent = count.toString();

            // District Name Pill Tag
            const tagGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const tagRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const tagText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            
            tagRect.setAttribute("x", (cx - 36).toString());
            tagRect.setAttribute("y", (cy + 19).toString());
            tagRect.setAttribute("width", "72");
            tagRect.setAttribute("height", "16");
            tagRect.setAttribute("rx", "4");
            tagRect.setAttribute("fill", "#000000");
            tagRect.setAttribute("stroke", "#10b981");
            tagRect.setAttribute("stroke-width", "1");

            tagText.setAttribute("x", cx.toString());
            tagText.setAttribute("y", (cy + 30.5).toString());
            tagText.setAttribute("text-anchor", "middle");
            tagText.setAttribute("fill", "#ffffff");
            tagText.setAttribute("font-size", "9");
            tagText.setAttribute("font-weight", "bold");
            tagText.textContent = `${pathTitle}`;

            tagGroup.appendChild(tagRect);
            tagGroup.appendChild(tagText);

            badgeGroup.appendChild(pulseCircle);
            badgeGroup.appendChild(circle);
            badgeGroup.appendChild(text);
            badgeGroup.appendChild(tagGroup);

            badgeGroup.onmouseenter = () => {
              setHoveredInfo({
                title: `${pathTitle} District`,
                provinceName: provinceLabel || "Sri Lanka",
                count,
                revenue,
                subtext: `Orders: ${count} • Revenue: ${formatRegionalPrice(revenue, "Sri Lanka")}`,
              });
            };

            overlayGroup.appendChild(badgeGroup);
          }
        } catch {
          /* ignore */
        }

        // Hover events on district path
        path.onmouseenter = () => {
          path.setAttribute("fill", "#047857");
          path.setAttribute("stroke", "#ffffff");
          path.setAttribute("stroke-width", "2.5");
          setHoveredInfo({
            title: `${pathTitle} District`,
            provinceName: provinceLabel || "Sri Lanka",
            count,
            revenue,
            subtext: `Orders: ${count} • Revenue: ${formatRegionalPrice(revenue, "Sri Lanka")}`,
          });
        };

        path.onmouseleave = () => {
          path.setAttribute("fill", fillColor);
          path.setAttribute("stroke", count > 0 ? "#34d399" : "#444444");
          path.setAttribute("stroke-width", count > 0 ? "1.8" : "0.9");
        };
      } else {
        // Australia State matching
        const stateKey = pathId;
        const stateData = AU_STATE_MAP[stateKey] || { name: pathTitle, code: pathId };
        const data = auStats.stateCounts[stateKey] || { count: 0, revenue: 0 };
        count = data.count;
        revenue = data.revenue;

        const fillColor = getDensityColor(count, auStats.maxCount);
        path.setAttribute("fill", fillColor);
        path.setAttribute("stroke", count > 0 ? "#34d399" : "#444444");
        path.setAttribute("stroke-width", count > 0 ? "1.8" : "0.9");
        path.style.cursor = "pointer";
        path.style.transition = "all 0.2s ease";

        // Centroid & Badge calculation
        try {
          const bbox = path.getBBox();
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y + bbox.height / 2;

          if (count > 0 && bbox.width > 10 && bbox.height > 10) {
            const badgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            badgeGroup.setAttribute("class", "cursor-pointer");

            const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pulseCircle.setAttribute("cx", cx.toString());
            pulseCircle.setAttribute("cy", cy.toString());
            pulseCircle.setAttribute("r", "22");
            pulseCircle.setAttribute("fill", "rgba(16, 185, 129, 0.25)");
            pulseCircle.setAttribute("class", "animate-ping");

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", cx.toString());
            circle.setAttribute("cy", cy.toString());
            circle.setAttribute("r", "16");
            circle.setAttribute("fill", "#10b981");
            circle.setAttribute("stroke", "#ffffff");
            circle.setAttribute("stroke-width", "2.5");

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", cx.toString());
            text.setAttribute("y", (cy + 5).toString());
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "#000000");
            text.setAttribute("font-size", "13");
            text.setAttribute("font-weight", "900");
            text.setAttribute("font-family", "monospace");
            text.textContent = count.toString();

            badgeGroup.appendChild(pulseCircle);
            badgeGroup.appendChild(circle);
            badgeGroup.appendChild(text);

            badgeGroup.onmouseenter = () => {
              setHoveredInfo({
                title: stateData.name,
                provinceName: `${stateData.code} Territory`,
                count,
                revenue,
                subtext: `Orders: ${count} • Revenue: ${formatRegionalPrice(revenue, "Australia")}`,
              });
            };

            overlayGroup.appendChild(badgeGroup);
          }
        } catch {
          /* ignore */
        }

        path.onmouseenter = () => {
          path.setAttribute("fill", "#047857");
          path.setAttribute("stroke", "#ffffff");
          path.setAttribute("stroke-width", "2.5");
          setHoveredInfo({
            title: stateData.name,
            provinceName: `${stateData.code} Territory`,
            count,
            revenue,
            subtext: `Orders: ${count} • Revenue: ${formatRegionalPrice(revenue, "Australia")}`,
          });
        };

        path.onmouseleave = () => {
          path.setAttribute("fill", fillColor);
          path.setAttribute("stroke", count > 0 ? "#34d399" : "#444444");
          path.setAttribute("stroke-width", count > 0 ? "1.8" : "0.9");
        };
      }
    });

    svgElement.appendChild(overlayGroup);
  }, [svgContent, selectedCountry, slStats, auStats, formatPrice]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 sm:p-7 space-y-6 text-white animate-fadeIn shadow-2xl">
      
      {/* Header & Map Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Globe size={20} className="text-emerald-400" />
            <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white">
              MapSVG Regional Order Intelligence
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Calibrated MapSVG vectors displaying district boundaries and active order counts
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-neutral-950 p-1.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => {
              setSelectedCountry("Sri Lanka");
              setHoveredInfo(null);
            }}
            className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all ${
              selectedCountry === "Sri Lanka"
                ? "bg-white text-black shadow-lg font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>🇱🇰</span>
            <span>Sri Lanka (25 Districts)</span>
            <span className="ml-1.5 px-2 py-0.5 text-[11px] rounded bg-neutral-800 text-neutral-200 font-mono font-bold">
              {slStats.totalOrders}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedCountry("Australia");
              setHoveredInfo(null);
            }}
            className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all ${
              selectedCountry === "Australia"
                ? "bg-white text-black shadow-lg font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>🇦🇺</span>
            <span>Australia (8 States)</span>
            <span className="ml-1.5 px-2 py-0.5 text-[11px] rounded bg-neutral-800 text-neutral-200 font-mono font-bold">
              {auStats.totalOrders}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Enlarged High-Clarity SVG Canvas & Provincial Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ─── MAP CANVAS (7 COLS) — ENLARGED HEIGHT & BOLD CLARITY ────────── */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-xl p-6 relative flex flex-col items-center justify-between min-h-[580px] lg:min-h-[660px] overflow-hidden shadow-inner">
          
          {/* Subheader Overlay */}
          <div className="w-full flex justify-between items-start z-10 pointer-events-none mb-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block font-semibold">
                {selectedCountry === "Sri Lanka" ? "MapSVG • Sri Lanka Full Geography" : "MapSVG • Australia Full Geography"}
              </span>
              <span className="text-sm font-serif font-bold text-neutral-200">
                {selectedCountry === "Sri Lanka" ? "25 Administrative Districts • 9 Provinces" : "8 States & Territories"}
              </span>
            </div>
            <div className="bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-md text-[11px] font-mono text-neutral-300">
              Total Dispatches: <span className="text-emerald-400 font-bold">{selectedCountry === "Sri Lanka" ? slStats.totalOrders : auStats.totalOrders}</span>
            </div>
          </div>

          {/* Interactive Floating Tooltip */}
          {hoveredInfo && (
            <div className="absolute top-16 right-6 z-30 bg-neutral-900/95 border border-emerald-500 p-4 rounded-xl shadow-2xl backdrop-blur text-xs space-y-1.5 animate-scaleUp pointer-events-none min-w-[230px]">
              <div className="flex items-center justify-between font-bold text-white border-b border-neutral-800 pb-1.5">
                <span className="text-sm">{hoveredInfo.title}</span>
                <span className="text-emerald-400 font-mono text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                  {hoveredInfo.count} {hoveredInfo.count === 1 ? "Order" : "Orders"}
                </span>
              </div>
              {hoveredInfo.provinceName && (
                <div className="text-[11px] text-neutral-400 font-medium">
                  {hoveredInfo.provinceName}
                </div>
              )}
              <div className="text-xs text-neutral-300 font-mono pt-1">
                Total Revenue: <span className="text-white font-bold">{formatRegionalPrice(hoveredInfo.revenue, selectedCountry)}</span>
              </div>
            </div>
          )}

          {/* Render MapSVG Container */}
          <div className="w-full flex-1 flex items-center justify-center my-auto py-2">
            {isLoadingSvg ? (
              <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono py-32">
                <RefreshCw size={20} className="animate-spin text-emerald-400" />
                <span>Loading High-Resolution Vector...</span>
              </div>
            ) : (
              <div
                ref={containerRef}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="w-full h-full flex items-center justify-center"
              />
            )}
          </div>

          {/* Heatmap Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 border-t border-neutral-800/90 pt-3 w-full gap-2 mt-2">
            <div className="flex items-center space-x-4">
              <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Density:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-[#1c1c1c] border border-neutral-700"></span>
                <span>0 Orders</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-[#065f46] border border-emerald-700"></span>
                <span>Active</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-[#059669] border border-emerald-400"></span>
                <span>High Volume</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Glowing number badges indicate orders</span>
            </div>
          </div>
        </div>

        {/* ─── PROVINCES / STATES LEDGER (5 COLS) ─────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col">
          
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800 text-xs">
              <span className="font-serif font-bold uppercase tracking-wider text-white text-sm">
                {selectedCountry === "Sri Lanka" ? "Sri Lanka Provincial Ledger (9)" : "Australian States Ledger (8)"}
              </span>
              <span className="font-mono text-emerald-400 text-xs font-bold">
                {selectedCountry === "Sri Lanka" ? `${slStats.totalOrders} Orders` : `${auStats.totalOrders} Orders`}
              </span>
            </div>

            {/* List of Regions */}
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[560px] pr-1">
              {selectedCountry === "Sri Lanka"
                ? Object.keys(SL_PROVINCE_MAP).map((provKey) => {
                    const prov = SL_PROVINCE_MAP[provKey];
                    const data = slStats.provinceCounts[provKey] || { count: 0, revenue: 0 };
                    const percent =
                      slStats.totalOrders > 0 ? Math.round((data.count / slStats.totalOrders) * 100) : 0;

                    return (
                      <div
                        key={provKey}
                        className={`border rounded-lg p-3 text-xs space-y-1.5 transition-all ${
                          data.count > 0
                            ? "bg-neutral-900 border-emerald-700/80 shadow-md ring-1 ring-emerald-500/20"
                            : "bg-neutral-900/60 border-neutral-800/90 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white flex items-center gap-2 text-[13px]">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                data.count > 0 ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-neutral-600"
                              }`}
                            ></span>
                            {prov.name}
                          </span>
                          <span
                            className={`font-mono font-bold px-2.5 py-1 rounded border text-xs ${
                              data.count > 0
                                ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                                : "bg-neutral-950 text-neutral-400 border-neutral-800"
                            }`}
                          >
                            {data.count} {data.count === 1 ? "Order" : "Orders"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-neutral-400 font-mono pt-0.5">
                          <span className="truncate max-w-[190px] text-neutral-400">{prov.districts.slice(0, 3).join(", ")}{prov.districts.length > 3 ? "..." : ""}</span>
                          <span className="text-neutral-200 font-bold">{formatRegionalPrice(data.revenue, "Sri Lanka")} ({percent}%)</span>
                        </div>
                      </div>
                    );
                  })
                : Object.keys(AU_STATE_MAP).map((key) => {
                    const state = AU_STATE_MAP[key];
                    const data = auStats.stateCounts[key] || { count: 0, revenue: 0 };
                    const percent =
                      auStats.totalOrders > 0 ? Math.round((data.count / auStats.totalOrders) * 100) : 0;

                    return (
                      <div
                        key={key}
                        className={`border rounded-lg p-3 text-xs space-y-1.5 transition-all ${
                          data.count > 0
                            ? "bg-neutral-900 border-emerald-700/80 shadow-md ring-1 ring-emerald-500/20"
                            : "bg-neutral-900/60 border-neutral-800/90 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white flex items-center gap-2 text-[13px]">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                data.count > 0 ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-neutral-600"
                              }`}
                            ></span>
                            {state.name} ({state.code})
                          </span>
                          <span
                            className={`font-mono font-bold px-2.5 py-1 rounded border text-xs ${
                              data.count > 0
                                ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                                : "bg-neutral-950 text-neutral-400 border-neutral-800"
                            }`}
                          >
                            {data.count} {data.count === 1 ? "Order" : "Orders"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-neutral-400 font-mono pt-0.5">
                          <span>{state.code} Territory</span>
                          <span className="text-neutral-200 font-bold">{formatRegionalPrice(data.revenue, "Australia")} ({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
