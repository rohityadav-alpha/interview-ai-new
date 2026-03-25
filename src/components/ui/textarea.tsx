// src/components/ui/textarea.tsx
// Skeuomorphic Textarea — deep engraved writing surface on metal.

import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full",
          "bg-[#111]",
          "border border-[#1a1a1a] border-t-[#0a0a0a] border-l-[#0e0e0e] border-r-[#333] border-b-[#333]",
          "rounded-[4px]",
          "shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8),inset_-1px_-1px_4px_rgba(255,255,255,0.06)]",
          "font-['Roboto_Condensed'] text-[0.9rem] leading-relaxed text-[#e0e0e0]",
          "placeholder:text-[#555] placeholder:italic",
          "min-h-[100px] px-3 py-2",
          "outline-none resize-y",
          "focus:border-[#d4820a]",
          "focus:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.9),inset_-1px_-1px_2px_rgba(255,255,255,0.04),0_0_0_2px_rgba(212,130,10,0.2)]",
          "transition-[box-shadow,border-color] duration-[150ms]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
