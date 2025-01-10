import { cn } from "../../lib/utils";
import React from "react";

interface GlassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "danger" | "default";
  className?: string;
}

export function GlassDialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  className,
}: GlassDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Premium backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" 
        onClick={onClose}
      />

      {/* Dialog container with enhanced drop shadow */}
      <div className={cn(
        "relative w-full max-w-md mx-4 animate-content-reveal", 
        className
      )}>
        <div className={cn(
          "p-5 rounded-xl text-left",
          // Premium gradient background with refined colors
          "bg-gradient-to-b from-[#1E1F2E]/95 via-[#242535]/95 to-[#1A1B27]/95",
          "backdrop-blur-2xl",
          // Refined border
          "ring-[0.5px] ring-white/[0.15]",
          "group relative overflow-hidden isolate",
          
          // Premium hover effects
          "transition-all duration-500",
          "hover:ring-white/[0.2]",
          "hover:shadow-[0_8px_32px_rgb(0_0_0/0.4)]",
          "hover:bg-gradient-to-b hover:from-[#1E1F2E]/98 hover:via-[#242535]/98 hover:to-[#1A1B27]/98",
          
          // Enhanced shadow for depth
          "shadow-[0_8px_32px_rgb(0_0_0/0.3)]",
          
          // Refined bottom gradient
          "before:absolute before:inset-0",
          "before:rounded-xl",
          "before:bg-gradient-to-b before:from-white/[0.02] before:via-transparent before:to-black/20",
          "before:pointer-events-none before:-z-10",
          
          // Premium glow effect
          "after:absolute after:-inset-[100px]",
          "after:bg-gradient-radial after:from-purple-500/5 after:via-transparent after:to-transparent",
          "after:pointer-events-none after:-z-20",
          "after:opacity-0",
          "after:transition-opacity after:duration-500",
          "group-hover:after:opacity-100",
          
          // Premium shine effect
          "[background-image:linear-gradient(to_bottom,rgba(30,31,46,0.95),rgba(36,37,53,0.95),rgba(26,27,39,0.95)),linear-gradient(to_right,transparent,rgba(255,255,255,0.01)_50%,transparent)]",
          "hover:[background-image:linear-gradient(to_bottom,rgba(30,31,46,0.98),rgba(36,37,53,0.98),rgba(26,27,39,0.98)),linear-gradient(to_right,transparent,rgba(255,255,255,0.03)_50%,transparent)]"
        )}>
          {/* Content container with enhanced styling */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              {/* Enhanced icon container */}
              {icon && (
                <div className="w-10 h-10 bg-black/20 backdrop-blur-xl
                  rounded-lg flex items-center justify-center
                  ring-1 ring-white/[0.05] relative overflow-hidden
                  group-hover:ring-white/[0.1] transition-all duration-500"
                >
                  {/* Icon gradient with premium colors */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-premium opacity-80 transition-opacity duration-500 group-hover:opacity-90",
                    variant === 'danger' 
                      ? "from-red-500/30 via-red-600/30 to-red-700/30"
                      : "from-indigo-500/30 via-indigo-600/30 to-indigo-700/30"
                  )} />
                  <div className="relative z-10">
                    {icon}
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-white/80 group-hover:text-white/90 transition-colors duration-500">
                {title}
              </h2>
            </div>
            
            <p className="text-white/50 group-hover:text-white/60 mb-6 leading-relaxed transition-colors duration-500">
              {description}
            </p>

            <div className="flex justify-end gap-3">
              {/* Enhanced cancel button */}
              <button
                onClick={onClose}
                className="px-4 py-2 text-white/50 hover:text-white/80
                  bg-white/[0.02] hover:bg-white/[0.04] rounded-lg 
                  ring-1 ring-white/[0.02] hover:ring-white/[0.05]
                  backdrop-blur-xl transition-all duration-300"
              >
                {cancelText}
              </button>
              {/* Premium action button */}
              <button
                onClick={onConfirm}
                className="px-4 py-2 relative group/btn overflow-hidden
                  rounded-lg ring-1 ring-white/[0.05] hover:ring-white/[0.1]
                  transition-all duration-300"
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-90 group-hover/btn:opacity-100 transition-opacity duration-300",
                  variant === 'danger'
                    ? "from-red-500/50 via-red-600/50 to-red-700/50"
                    : "from-indigo-500/50 via-indigo-600/50 to-indigo-700/50"
                )} />
                <span className="relative z-10 text-white/90 group-hover/btn:text-white transition-colors duration-300">
                  {confirmText}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 