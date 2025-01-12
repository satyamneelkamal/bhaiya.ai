import { Bot } from 'lucide-react';
import { cn } from "@/lib/utils";

interface HomeButtonProps {
  isNewChat?: boolean;
  onNewChat: () => void;
}

export function HomeButton({ isNewChat = false, onNewChat }: HomeButtonProps) {
  const handleClick = () => {
    if (!isNewChat) {
      onNewChat();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-start px-2 py-1.5">
      <button
        onClick={handleClick}
        className={cn(
          // Base styles
          "flex items-center gap-3 w-full",
          "px-4 py-2.5 rounded-lg",
          "text-[15px] font-medium tracking-[-0.01em]",
          
          // Text colors
          "text-white/85 hover:text-white",
          
          // Background effects
          "bg-gradient-to-r from-[#10A37F]/5 to-transparent",
          "hover:from-[#10A37F]/10 hover:to-transparent/5",
          
          // Border effects
          "ring-1 ring-white/5 hover:ring-white/10",
          
          // Transitions
          "transition-all duration-500",
          "hover:shadow-lg hover:shadow-[#10A37F]/5",
          
          // Group hover effects
          "group"
        )}
      >
        {/* Logo container with premium effects */}
        <div className={cn(
          "relative flex items-center justify-center",
          "w-5 h-5 rounded-[4px] overflow-hidden",
          "bg-gradient-to-br from-[#10A37F] to-[#0D8A6F]",
          "ring-1 ring-white/10 group-hover:ring-white/20",
          "transition-all duration-500",
          
          // Shine effect
          "before:absolute before:inset-0",
          "before:bg-gradient-to-br before:from-white/10 before:to-transparent",
          "before:opacity-0 group-hover:before:opacity-100",
          "before:transition-opacity before:duration-500"
        )}>
          <Bot className={cn(
            "w-3.5 h-3.5 text-white/90 group-hover:text-white",
            "transform group-hover:scale-110",
            "transition-all duration-500"
          )} />
        </div>

        {/* Text with proper spacing and gradient effect */}
        <span className={cn(
          "flex-1 text-left whitespace-nowrap",
          "bg-gradient-to-r from-white/90 to-white/80",
          "bg-clip-text text-transparent",
          "group-hover:from-white group-hover:to-white/90",
          "transition-all duration-500"
        )}>
          Bhaiya AI
        </span>
      </button>
    </div>
  );
}