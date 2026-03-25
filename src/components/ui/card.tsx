// src/components/ui/card.tsx
// Skeuomorphic Card — brushed dark-metal panel with top-left lighting.

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Brushed metal panel surface
        "relative rounded-[6px] overflow-hidden",
        // Brushed horizontal lines texture
        "[background:repeating-linear-gradient(93deg,rgba(255,255,255,0.014)_0px,rgba(255,255,255,0.014)_1px,transparent_1px,transparent_4px),linear-gradient(170deg,#363636_0%,#2c2c2c_60%,#252525_100%)]",
        // Beveled edges (top-left bright, bottom-right dark)
        "border border-[#1e1e1e] border-t-[#484848] border-l-[#404040]",
        // Physical raised shadow
        "shadow-[6px_6px_20px_rgba(0,0,0,0.8),-2px_-2px_8px_rgba(255,255,255,0.04)]",
        "transition-shadow duration-[150ms]",
        "hover:shadow-[6px_6px_20px_rgba(0,0,0,0.8),-2px_-2px_8px_rgba(255,255,255,0.04),0_0_20px_rgba(212,130,10,0.1)]",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Recessed header strip
        "flex items-center gap-2 px-4 py-3",
        "bg-[linear-gradient(180deg,#3e3e3e,#303030)]",
        "border-b border-[#1a1a1a]",
        "shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-['Oswald'] font-semibold tracking-[0.08em] uppercase text-base",
        // Engraved text effect
        "text-[#d0d0d0] [text-shadow:1px_1px_0_rgba(255,255,255,0.1),-1px_-1px_0_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-['Roboto_Condensed'] text-[0.78rem] tracking-[0.04em] text-[#888]",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "border-t border-[#1a1a1a]",
        "bg-[linear-gradient(180deg,#222,#1a1a1a)]",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
