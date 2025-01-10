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
        "w-full relative isolate overflow-hidden rounded-md bg-[#40414F]",
        
        // Primary shimmer animation layer
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_5s_cubic-bezier(0.17,0.55,0.55,1)_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent",
        "before:via-white/[0.08]",
        "before:to-transparent",
        
        // Secondary gradient glow
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r",
        "after:from-transparent",
        "after:via-white/[0.03]",
        "after:to-transparent",
        
        // Ambient radial pulse effect
        "[&>div]:absolute [&>div]:inset-0",
        "[&>div]:bg-gradient-radial",
        "[&>div]:from-white/[0.04]",
        "[&>div]:via-transparent",
        "[&>div]:to-transparent",
        "[&>div]:animate-[pulse_4s_ease-in-out_infinite]",
        
        // Apply any custom classes
        className
      )}
      {...props}
    >
      <div />
    </div>
  )
}

export { Skeleton } 