'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface DatePickerProps {
    date: string
}

export function DatePicker({ date }: DatePickerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    function handleSelect(date: Date | undefined) {
        if (!date) return
        const params = new URLSearchParams(searchParams)
        params.set('date', date.toISOString().split('T')[0])
        router.push(`/muster-roll?${params.toString()}`)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(new Date(date), 'PPP') : 'Pick a date'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="single"
                    selected={date ? new Date(date) : undefined}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
} 