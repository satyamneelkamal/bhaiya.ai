import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Predefined shadow styles that can be used across the app
export const shadowStyles = {
  sm: "shadow-[0_2px_4px_0_rgba(0,0,0,0.15)]",
  md: "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_2px_4px_-2px_rgba(0,0,0,0.1)]",
  lg: "shadow-[0_10px_15px_-3px_rgba(0,0,0,0.25),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
  xl: "shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_8px_10px_-6px_rgba(0,0,0,0.1)]",
  inner: "shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]",
  colored: "shadow-[0_4px_14px_0_rgba(0,0,0,0.25)]",
  glow: "shadow-[0_0_15px_rgba(16,163,127,0.5)]",
  // New aceternity-style shadow
  aceternity: `
    shadow-[0_8px_16px_rgb(0_0_0/0.4)]
    dark:shadow-[0_8px_16px_rgb(0_0_0/0.4)]
    before:absolute before:inset-0
    before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-black/20
    before:pointer-events-none before:-z-10
    after:absolute after:-inset-[100px]
    after:bg-gradient-radial after:from-slate-500/20 after:via-transparent after:to-transparent
    after:pointer-events-none after:-z-20
    after:opacity-50
  `.replace(/\s+/g, ' ').trim(),
} as const;