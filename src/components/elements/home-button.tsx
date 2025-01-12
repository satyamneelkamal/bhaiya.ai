import { useState, forwardRef, useImperativeHandle } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeButtonProps {
  onNewChat: () => void;
}

// Export the ref type for use in App.tsx
export interface HomeButtonRef {
  triggerAnimation: () => void;
}

export const HomeButton = forwardRef<HomeButtonRef, HomeButtonProps>(({ onNewChat }, ref) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Expose the animation trigger through ref
  useImperativeHandle(ref, () => ({
    triggerAnimation: () => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  }));

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    onNewChat();
  };

  return (
    <div className="flex-1 flex items-center justify-start px-2 py-1.5">
      <button
        onClick={handleClick}
        className={cn(
          // Base layout
          "flex items-center gap-3 w-full",
          "px-4 py-2.5 rounded-lg",
          "text-[15px] font-medium tracking-[-0.01em]",
          
          // Premium gradient background
          "bg-gradient-to-r from-[#10A37F]/10 via-[#10A37F]/5 to-transparent",
          "hover:from-[#10A37F]/20 hover:via-[#10A37F]/10 hover:to-transparent/5",
          
          // Enhanced text color
          "text-white/90 hover:text-white",
          
          // Premium border effect
          "ring-1 ring-white/10 hover:ring-[#10A37F]/20",
          "border border-white/5 hover:border-[#10A37F]/20",
          
          // Premium shadows
          "shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
          "hover:shadow-[0_4px_20px_rgba(16,163,127,0.2)]",
          "backdrop-blur-[2px]",
          
          // Smooth transitions
          "transition-all duration-500",
          "group",
          
          // Premium hover state
          "hover:scale-[1.02]",
          "hover:backdrop-blur-[4px]",
          
          // Animation states
          isAnimating && [
            "relative overflow-hidden",
            // Enhanced shimmer effect
            "before:absolute before:inset-0",
            "before:bg-gradient-to-r before:from-[#10A37F]/30 before:via-transparent before:to-[#10A37F]/30",
            "before:animate-shimmer-premium",
            
            // Enhanced glow effect
            "after:absolute after:inset-0",
            "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
            "after:animate-pulse-premium",
            
            // Enhanced ring and shadow during animation
            "ring-2 ring-[#10A37F]/40",
            "shadow-[0_0_30px_rgba(16,163,127,0.4)]",
            "animate-shake-subtle",
            
            // Additional premium effects during animation
            "bg-gradient-to-r from-[#10A37F]/20 via-[#10A37F]/10 to-transparent",
          ]
        )}
      >
        <div className={cn(
          "relative flex items-center justify-center",
          "w-5 h-5 rounded-[4px] overflow-hidden",
          // Enhanced icon background
          "bg-gradient-to-br from-[#10A37F] via-[#0D8A6F] to-[#0D8A6F]",
          "ring-1 ring-white/20 group-hover:ring-white/30",
          "shadow-[0_2px_8px_rgba(16,163,127,0.3)]",
          "group-hover:shadow-[0_2px_12px_rgba(16,163,127,0.4)]",
          "transition-all duration-500",
          
          // Premium hover effect
          "before:absolute before:inset-0",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:opacity-0 group-hover:before:opacity-100",
          "before:transition-opacity before:duration-500",
          
          // Scale effect
          "group-hover:scale-110",
          "transform-gpu"
        )}>
          <Bot className={cn(
            "w-3.5 h-3.5 text-white/90 group-hover:text-white",
            "transform group-hover:scale-110",
            "transition-all duration-500",
            "drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          )} />
        </div>

        <span className={cn(
          "flex-1 text-left whitespace-nowrap",
          // Premium text gradient
          "bg-gradient-to-r from-white/95 via-white/90 to-white/80",
          "group-hover:from-white group-hover:via-white group-hover:to-white/90",
          "bg-clip-text text-transparent",
          "transition-all duration-500",
          // Text shadow
          "drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
        )}>
          Bhaiya AI
        </span>
      </button>
    </div>
  );
});