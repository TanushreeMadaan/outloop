"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            classNames={{
                months: "flex flex-col sm:flex-row gap-4",
                month: "flex flex-col gap-4",
                month_caption: "flex justify-center pt-1 relative items-center h-10 w-full",
                caption_label: "hidden text-sm font-semibold",
                dropdowns: "flex justify-center gap-2 w-full",
                dropdown: "rounded-[0.9rem] border border-border/70 bg-white/70 px-3 py-1.5 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:ring-2 focus:ring-ring/50 cursor-pointer appearance-none",
                dropdown_month: "flex",
                dropdown_year: "flex",
                nav: "flex items-center justify-between absolute inset-x-0 w-full px-4 top-10 -translate-y-1/2 z-50 pointer-events-none",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "pointer-events-auto size-8 rounded-full bg-white/65 p-0 text-muted-foreground hover:bg-white hover:text-foreground"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "pointer-events-auto size-8 rounded-full bg-white/65 p-0 text-muted-foreground hover:bg-white hover:text-foreground"
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "text-muted-foreground rounded-md w-9 h-9 flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.12em]",
                week: "flex w-full mt-1",
                day: cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-[0.9rem] p-0 text-sm transition-all focus-within:z-20 [&:has([aria-selected].day-range-end)]:rounded-r-[0.9rem] [&:has([aria-selected].day-outside)]:bg-accent/40 [&:has([aria-selected])]:bg-accent/55 first:[&:has([aria-selected])]:rounded-l-[0.9rem] last:[&:has([aria-selected])]:rounded-r-[0.9rem]"
                ),
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 rounded-[0.9rem] p-0 font-medium text-[13px] aria-selected:opacity-100 hover:bg-[rgba(171,180,230,0.18)] hover:text-foreground w-full h-full"
                ),
                range_end: "day-range-end",
                selected: "bg-[linear-gradient(135deg,rgba(205,214,248,0.95),rgba(185,197,241,0.92))] text-[rgb(72,82,128)] shadow-[0_14px_28px_-20px_rgba(156,166,220,0.55)] hover:bg-[linear-gradient(135deg,rgba(205,214,248,0.95),rgba(185,197,241,0.92))] hover:text-[rgb(72,82,128)] focus:bg-[linear-gradient(135deg,rgba(205,214,248,0.95),rgba(185,197,241,0.92))] focus:text-[rgb(72,82,128)] rounded-[0.9rem]",
                today: "border border-[rgba(199,208,244,0.7)] bg-[rgba(255,255,255,0.92)] text-accent-foreground font-semibold",
                outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/40 aria-selected:text-muted-foreground aria-selected:opacity-30",
                disabled: "text-muted-foreground opacity-50",
                range_middle: "aria-selected:bg-[rgba(216,223,247,0.65)] aria-selected:text-foreground rounded-none",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                    return <Icon className="h-4 w-4" />;
                },
            }}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear() + 10}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
