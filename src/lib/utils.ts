import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a URL has a protocol (http or https).
 * If no protocol is found, it defaults to https://
 */
export function ensureFullUrl(url: string | null | undefined): string {
  if (!url || url === 'PENDING') return url || '';
  
  // Clean trailing slash
  const cleanUrl = url.replace(/\/$/, "");
  
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  return `https://${cleanUrl}`;
}

/**
 * Formats a percentage value smartly so small non-zero values (like 6 / 50,000 = 0.012%)
 * accurately display with sufficient precision instead of misleadingly rounding to "0.0%".
 */
export function formatUsagePercent(percent: number): string {
  if (percent <= 0) return "0%";
  if (percent < 0.001) return "<0.001%";
  if (percent < 0.1) {
    // Up to 3 decimal places without trailing zeros (e.g. 0.012%, 0.05%)
    return `${parseFloat(percent.toFixed(3))}%`;
  }
  if (percent < 10) {
    // Up to 2 decimal places without trailing zeros (e.g. 1.25%, 5.5%)
    return `${parseFloat(percent.toFixed(2))}%`;
  }
  // Up to 1 decimal place (e.g. 24.5%, 100%)
  return `${parseFloat(percent.toFixed(1))}%`;
}
