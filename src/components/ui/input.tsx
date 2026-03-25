// src/components/ui/input.tsx
// Skeuomorphic Input — engraved inset field on dark metal surface.

import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Inset engraved appearance
          "flex w-full",
          "bg-[#111]",
          // Beveled inset border — dark top/left (depth), light bottom/right
          "border border-[#1a1a1a] border-t-[#0a0a0a] border-l-[#0e0e0e] border-r-[#333] border-b-[#333]",
          "rounded-[4px]",
          "shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8),inset_-1px_-1px_4px_rgba(255,255,255,0.06)]",
          // Typography
          "font-['Roboto_Condensed'] text-[0.9rem] text-[#e0e0e0]",
          "placeholder:text-[#555] placeholder:italic",
          // Sizing
          "h-10 px-3 py-2",
          // Focus — amber glow ring
          "outline-none",
          "focus:border-[#d4820a]",
          "focus:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.9),inset_-1px_-1px_2px_rgba(255,255,255,0.04),0_0_0_2px_rgba(212,130,10,0.2)]",
          "transition-[box-shadow,border-color] duration-[150ms]",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-40",
          // File input
          "file:border-0 file:bg-transparent file:font-['Roboto_Condensed'] file:text-[#888]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
