import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] border border-transparent text-sm font-medium tracking-[-0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[linear-gradient(135deg,rgba(145,156,226,0.96),rgba(122,136,214,0.92))] text-primary-foreground shadow-[0_18px_36px_-24px_rgba(122,136,214,0.9)] hover:brightness-[1.03] hover:-translate-y-px",
        destructive: "bg-[linear-gradient(135deg,rgba(235,170,164,0.98),rgba(219,136,128,0.92))] text-white shadow-[0_18px_36px_-24px_rgba(219,136,128,0.85)] hover:brightness-[1.03] hover:-translate-y-px",
        outline: "border-border/70 bg-white/72 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:border-border hover:bg-white/88",
        secondary: "border-border/60 bg-secondary/70 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-secondary/90",
        ghost: "text-muted-foreground hover:bg-white/70 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        xs: "h-7 gap-1 rounded-[0.8rem] px-2.5 text-[11px]",
        sm: "h-9 rounded-[0.9rem] px-3.5",
        lg: "h-11 rounded-[1.05rem] px-6",
        icon: "size-10",
        "icon-sm": "size-8 rounded-[0.9rem]",
        "icon-lg": "size-11 rounded-[1.05rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
