import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] border border-transparent text-sm font-medium tracking-[-0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_16px_30px_-18px_rgba(31,122,140,0.52)] hover:bg-[#176878] hover:-translate-y-px",
        destructive: "bg-destructive text-white shadow-[0_16px_30px_-18px_rgba(215,101,101,0.42)] hover:bg-[#c45757] hover:-translate-y-px",
        outline: "border-border bg-card text-foreground shadow-sm hover:border-primary/45 hover:bg-secondary/24",
        secondary: "border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-[#afd1f3]",
        ghost: "text-muted-foreground hover:bg-secondary/28 hover:text-foreground",
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
