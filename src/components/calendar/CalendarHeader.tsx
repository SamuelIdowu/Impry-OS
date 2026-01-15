'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

interface CalendarHeaderProps {
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
    onToday: () => void
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday }: CalendarHeaderProps) {
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
                {/* Future implementation: Filter dropdown or View switcher */}
                <Button variant="outline" size="sm" className="gap-2 text-zinc-600">
                    <Filter className="size-3.5" />
                    <span>Filter</span>
                </Button>
            </div>
        </div>
    )
}
