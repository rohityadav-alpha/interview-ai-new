// src/components/ui/button.tsx
// Skeuomorphic Button primitives — maps shadcn variants to hardware physical buttons.

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — shared structure for all physical buttons
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-['Oswald'] font-semibold tracking-[0.12em] uppercase",
    "border-none outline-none rounded-[5px] cursor-pointer select-none",
    "transition-[transform,box-shadow,background] duration-[150ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "active:translate-y-[4px]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Amber primary — main CTA
        default: [
          "bg-[linear-gradient(180deg,#e09030_0%,#b06010_40%,#c07020_100%)]",
          "text-[#1a0e00] text-shadow-none",
          "border-t border-[#f0b040]",
          "shadow-[0_6px_0_#0a0a0a,0_8px_14px_rgba(0,0,0,0.7)]",
          "hover:bg-[linear-gradient(180deg,#f0a030_0%,#c07020_40%,#d08030_100%)]",
          "hover:shadow-[0_6px_0_#0a0a0a,0_8px_14px_rgba(0,0,0,0.7),0_0_16px_rgba(212,130,10,0.35)]",
          "active:shadow-[0_2px_0_#0a0a0a,0_3px_6px_rgba(0,0,0,0.6)]",
        ].join(" "),

        // Dark red danger
        destructive: [
          "bg-[linear-gradient(180deg,#c03030_0%,#7a1818_40%,#922020_100%)]",
          "text-[#ffe0e0]",
          "border-t border-[#e04040]",
          "shadow-[0_6px_0_#2a0000,0_8px_14px_rgba(0,0,0,0.7)]",
          "hover:bg-[linear-gradient(180deg,#d04040_0%,#8a1818_40%,#a03030_100%)]",
          "hover:shadow-[0_6px_0_#2a0000,0_8px_14px_rgba(0,0,0,0.7),0_0_16px_rgba(200,0,0,0.3)]",
          "active:shadow-[0_2px_0_#2a0000,0_3px_6px_rgba(0,0,0,0.6)]",
        ].join(" "),

        // Chrome outline
        outline: [
          "bg-[linear-gradient(145deg,#3a3a3a,#272727)]",
          "text-[#c0c0c0]",
          "border border-[#1a1a1a] border-t-[#555]",
          "shadow-[2px_2px_6px_rgba(0,0,0,0.7),-1px_-1px_3px_rgba(255,255,255,0.04)]",
          "hover:text-[#f0a830] hover:border-[rgba(212,130,10,0.4)]",
          "hover:shadow-[2px_2px_8px_rgba(0,0,0,0.7),0_0_10px_rgba(212,130,10,0.15)]",
          "active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8)]",
        ].join(" "),

        // Darker chrome secondary
        secondary: [
          "bg-[linear-gradient(180deg,#555_0%,#333_40%,#3e3e3e_100%)]",
          "text-[#c0c0c0]",
          "border-t border-[#666]",
          "shadow-[0_6px_0_#0a0a0a,0_8px_14px_rgba(0,0,0,0.7)]",
          "hover:bg-[linear-gradient(180deg,#666_0%,#444_40%,#505050_100%)]",
          "active:shadow-[0_2px_0_#0a0a0a,0_3px_6px_rgba(0,0,0,0.6)]",
        ].join(" "),

        // Transparent ghost
        ghost: [
          "bg-transparent text-[#888]",
          "border border-transparent",
          "shadow-none",
          "hover:text-[#f0a830] hover:border-[rgba(212,130,10,0.4)]",
          "hover:bg-[rgba(212,130,10,0.08)]",
          "active:translate-y-0",
        ].join(" "),

        // Text link
        link: [
          "bg-transparent text-[#d4820a] underline-offset-4",
          "shadow-none border-none",
          "hover:underline hover:text-[#f0a830]",
          "active:translate-y-0",
        ].join(" "),
      },

      size: {
        default: "text-[0.8rem] px-5 py-[0.65rem]",
        sm: "text-[0.7rem] px-3 py-[0.45rem] rounded-[4px]",
        lg: "text-[0.9rem] px-8 py-[0.9rem]",
        icon: "w-9 h-9 p-0 text-[0.75rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
