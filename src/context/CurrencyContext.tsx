"use client";

import React, { createContext, useContext, useState } from "react";

export type Currency = "AUD" | "LKR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInAUD: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Approximate AUD to LKR conversion factor for realistic e-commerce pricing
const AUD_TO_LKR_RATE = 210.5;

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>("AUD");

  const formatPrice = (priceInAUD: number): string => {
    if (currency === "LKR") {
      const priceInLKR = Math.round(priceInAUD * AUD_TO_LKR_RATE);
      return `LKR ${priceInLKR.toLocaleString()}`;
    }
    return `AUD $${priceInAUD.toFixed(2)}`;
  };

  const symbol = currency === "AUD" ? "AUD $" : "LKR Rs";

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
