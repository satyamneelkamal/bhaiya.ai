import { cn } from "../../lib/utils"

/**
 * Premium dynamic skeleton loading animation with:
 * - Smooth horizontal shimmer effect
 * - Secondary subtle gradient glow
 * - Ambient radial pulse effect
 * - Configurable dimensions via className prop
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base styles
        "relative isolate overflow-hidden rounded-md",
        "bg-gradient-premium from-[#40414F] via-[#343541] to-[#40414F]",
        
        // Premium shimmer animation
        "before:absolute before:inset-0",
        "before:bg-shimmer-gradient",
        "before:animate-premium-shimmer",
        "before:bg-[length:200%_100%]",
        
        // Custom classes
        className
      )}
      {...props}
    />
  )
}

export { Skeleton } 