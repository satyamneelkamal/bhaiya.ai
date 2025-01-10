import { cn } from "../../lib/utils";
import { shadowStyles } from "../../lib/utils";

interface ShadowContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof shadowStyles;
  children: React.ReactNode;
}

export function ShadowContainer({
  variant = "md",
  children,
  className,
  ...props
}: ShadowContainerProps) {
  return (
    <div
      className={cn(
        "transition-shadow duration-200",
        shadowStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 