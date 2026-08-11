"use client";

import React from "react";
import { RotateCcw, Plane, Clock, Globe } from "lucide-react";

export const ValuePropsSection: React.FC = () => {
  const valueProps = [
    {
      icon: <RotateCcw size={22} strokeWidth={1.2} className="text-neutral-800" />,
      title: "FREE RETURNS AND REFUNDS AVAILABLE",
    },
    {
      icon: <Plane size={22} strokeWidth={1.2} className="text-neutral-800" />,
      title: "EXPRESS SHIPPING",
    },
    {
      icon: <Clock size={22} strokeWidth={1.2} className="text-neutral-800" />,
      title: "BUY NOW PAY LATER",
    },
    {
      icon: <Globe size={22} strokeWidth={1.2} className="text-neutral-800" />,
      title: "DESIGNED WITH PRECISION, AVAILABLE WORLDWIDE",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-white text-black border-b border-neutral-100">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {valueProps.map((prop, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center space-y-4 px-2">
              <div className="p-3 rounded-full bg-neutral-50 flex items-center justify-center">
                {prop.icon}
              </div>
              <h4 className="text-[11px] md:text-xs font-serif tracking-[0.22em] uppercase text-neutral-800 leading-relaxed max-w-[210px]">
                {prop.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
