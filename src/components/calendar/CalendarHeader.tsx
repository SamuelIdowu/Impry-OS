'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import type { CalendarEventType } from '@/lib/calendar'

interface CalendarHeaderProps {
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
    onToday: () => void
    selectedFilters: CalendarEventType[]
    onFilterChange: (filters: CalendarEventType[]) => void
}

const filterOptions: { label: string; value: CalendarEventType }[] = [
    { label: 'Project Deadlines', value: 'project_deadline' },
    { label: 'Project Starts', value: 'project_start' },
    { label: 'Payments', value: 'payment_due' },
    { label: 'Reminders', value: 'reminder' },
    { label: 'Notes', value: 'note' },
]

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday, selectedFilters, onFilterChange }: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 table-fixed">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-zinc-50 rounded-lg p-1 border border-zinc-200">
                    <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-7 w-7 text-zinc-500 hover:text-zinc-900">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onToday} className="h-7 px-3 text-xs font-medium text-zinc-700 hover:text-zinc-900">
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-7 w-7 text-zinc-500 hover:text-zinc-900">
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
                <h2 className="text-lg font-semibold text-zinc-900 w-48">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-zinc-600">
                            <Filter className="size-3.5" />
                            <span>Filter</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {filterOptions.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={selectedFilters.includes(option.value)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        onFilterChange([...selectedFilters, option.value])
                                    } else {
                                        onFilterChange(selectedFilters.filter(f => f !== option.value))
                                    }
                                }}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
