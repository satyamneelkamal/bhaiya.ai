import { cn } from "@/lib/utils";
import React from "react";
// Temporarily comment out unused import
// import { motion } from "framer-motion";

interface Background3DProps {
  children?: React.ReactNode;
  className?: string;
  // Comment out unused props while the feature is disabled
  // intensity?: "subtle" | "medium" | "high";
  // interactive?: boolean;
}

export function Background3D({
  children,
  className,
  // Comment out unused parameters
  // intensity = "subtle",
  // interactive = true,
}: Background3DProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
} 