"use client"

import * as React from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
    /** The currently selected date */
    value?: Date
    /** Callback when a date is selected */
    onChange?: (date: Date | undefined) => void
    /** Placeholder text when no date is selected */
    placeholder?: string
    /** Display format for the selected date (default: "PPP" e.g., "18 gennaio 2026") */
    dateFormat?: string
    /** Whether the picker is disabled */
    disabled?: boolean
    /** Variant: "default" shows full button, "icon" shows compact icon-only button */
    variant?: "default" | "icon"
    /** Additional class names for the trigger button */
    className?: string
    /** Alignment of the popover */
    align?: "start" | "center" | "end"
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Seleziona data",
    dateFormat = "PPP",
    disabled = false,
    variant = "default",
    className,
    align = "start",
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (date: Date | undefined) => {
        onChange?.(date)
        if (date) {
            setOpen(false)
        }
    }

    const isToday = value && value.toDateString() === new Date().toDateString()

    if (variant === "icon") {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        className={cn(
                            "h-8 w-8 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            value && !isToday && "text-primary bg-primary/10",
                            className
                        )}
                        title={value ? format(value, "P", { locale: it }) : placeholder}
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, dateFormat, { locale: it }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
