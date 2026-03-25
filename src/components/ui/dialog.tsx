// src/components/ui/dialog.tsx
// Skeuomorphic Dialog — dark metal modal panel with inset header & screw corners.

"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      // Dark semi-transparent overlay with subtle vignette
      "bg-[rgba(0,0,0,0.88)]",
      "backdrop-blur-[2px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-lg",
        "translate-x-[-50%] translate-y-[-50%]",
        // Brushed metal panel
        "[background:repeating-linear-gradient(93deg,rgba(255,255,255,0.014)_0px,rgba(255,255,255,0.014)_1px,transparent_1px,transparent_4px),linear-gradient(170deg,#363636_0%,#2c2c2c_60%,#252525_100%)]",
        "border border-[#1e1e1e] border-t-[#484848] border-l-[#404040]",
        "rounded-[6px] overflow-hidden",
        "shadow-[8px_8px_30px_rgba(0,0,0,0.95),-3px_-3px_10px_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.04)]",
        // Animations
        "duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
      {/* Physical X close button */}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-3 top-3 z-10",
          "w-7 h-7 rounded-full flex items-center justify-center",
          "bg-[radial-gradient(circle_at_35%_35%,#c0c0c0,#666)]",
          "border border-[#222]",
          "shadow-[2px_2px_5px_rgba(0,0,0,0.8),-1px_-1px_2px_rgba(255,255,255,0.15)]",
          "text-[#333]",
          "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.8),0_0_8px_rgba(212,130,10,0.3)]",
          "active:translate-y-[1px] active:shadow-[1px_1px_3px_rgba(0,0,0,0.8)]",
          "transition-[box-shadow,transform] duration-[120ms]",
          "outline-none focus:ring-0",
        )}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 px-4 py-3",
      "bg-[linear-gradient(180deg,#3e3e3e,#303030)]",
      "border-b border-[#1a1a1a]",
      "shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      "px-4 py-3",
      "border-t border-[#1a1a1a] bg-[linear-gradient(180deg,#222,#1a1a1a)]",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-['Oswald'] font-semibold tracking-[0.08em] uppercase text-[1rem]",
      "text-[#d0d0d0] [text-shadow:1px_1px_0_rgba(255,255,255,0.1),-1px_-1px_0_rgba(0,0,0,0.6)]",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "font-['Roboto_Condensed'] text-[0.82rem] tracking-[0.03em] text-[#888]",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose,
  DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
}
