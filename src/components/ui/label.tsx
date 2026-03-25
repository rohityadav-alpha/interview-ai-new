// src/components/ui/label.tsx
// Skeuomorphic Label — engraved uppercase stencil text.

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  [
    "font-['Oswald'] text-[0.65rem] font-medium",
    "tracking-[0.15em] uppercase",
    "text-[#888]",
    // Engraved depth effect
    "[text-shadow:0_1px_0_rgba(0,0,0,0.8),0_-1px_0_rgba(255,255,255,0.05)]",
    "leading-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  ].join(" ")
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
