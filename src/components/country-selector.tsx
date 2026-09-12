"use client";

import React from "react";
import { useCountry } from "./country-provider";
import { Globe } from "lucide-react";

export function CountrySelector() {
  const { country, setCountry } = useCountry();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value as "IN" | "US")}
        className="bg-transparent text-xs text-muted-foreground focus:outline-none focus:ring-0 cursor-pointer hover:text-foreground transition-colors"
      >
        <option value="IN" className="bg-background text-foreground">India (INR)</option>
        <option value="US" className="bg-background text-foreground">Global (USD)</option>
      </select>
    </div>
  );
}
