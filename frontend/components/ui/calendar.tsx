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
                caption_label: "text-sm font-semibold hidden",
                dropdowns: "flex justify-center gap-2 w-full",
                dropdown: "rounded-md p-1 border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-purple-200 outline-none cursor-pointer appearance-none px-2",
                dropdown_month: "flex",
                dropdown_year: "flex",
                nav: "flex items-center justify-between absolute inset-x-0 w-full px-4 top-10 -translate-y-1/2 z-50 pointer-events-none",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto"
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] h-9 flex items-center justify-center",
                week: "flex w-full mt-1",
                day: cn(
                    "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center rounded-md transition-all"
                ),
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-100 hover:text-purple-900 transition-colors w-full h-full"
                ),
                range_end: "day-range-end",
                selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-700 focus:text-white rounded-md",
                today: "bg-accent text-accent-foreground font-bold border-2 border-purple-200",
                outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                disabled: "text-muted-foreground opacity-50",
                range_middle: "aria-selected:bg-purple-50 aria-selected:text-purple-900 rounded-none",
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
