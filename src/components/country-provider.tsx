"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CountryContextType = {
  country: "IN" | "US";
  setCountry: (country: "IN" | "US") => void;
  formatPrice: (inrPrice: number | string) => string;
  getRawPrice: (inrPrice: number | string) => number;
  currencySymbol: string;
};

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState<"IN" | "US">("US");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("postpipe-country") as "IN" | "US" | null;
    if (saved) {
      setCountry(saved);
    } else {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
        setCountry("IN");
      }
    }
    setMounted(true);
  }, []);

  const handleSetCountry = (c: "IN" | "US") => {
    setCountry(c);
    localStorage.setItem("postpipe-country", c);
  };

  const getRawPrice = (inrPrice: number | string) => {
    const p = Number(inrPrice);
    if (isNaN(p) || p === 0) return 0;
    const activeCountry = mounted ? country : "US";
    if (activeCountry === "IN") return p;
    // Conversion mapping based on existing Postpipe pricing tiers
    if (p === 399) return 5;
    if (p === 699) return 9;
    if (p === 1899) return 24;
    return Math.round(p / 80);
  };

  const formatPrice = (inrPrice: number | string) => {
    const raw = getRawPrice(inrPrice);
    const activeCountry = mounted ? country : "US";
    if (raw === 0) return activeCountry === "IN" ? "₹0" : "$0";
    return activeCountry === "IN" ? `₹${raw}` : `$${raw}`;
  };

  // Provide defaults before hydration to avoid mismatch, though ideally we suppress hydration warning
  return (
    <CountryContext.Provider value={{
      country: mounted ? country : "US",
      setCountry: handleSetCountry,
      formatPrice,
      getRawPrice,
      currencySymbol: (mounted ? country : "US") === "IN" ? "₹" : "$"
    }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
}
