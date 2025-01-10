import { cn } from "../../lib/utils"

// Skeleton component for loading states
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#40414F]", className)}
      {...props}
    />
  )
}

export { Skeleton } 