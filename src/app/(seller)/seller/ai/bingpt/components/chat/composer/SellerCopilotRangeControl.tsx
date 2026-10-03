// Control chọn khoảng thời gian phân tích; menu chỉ phát range mới lên composer cha.
'use client';

import { CalendarDays } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SellerCopilotRangeControlProps } from '../../../types/composer.types';

// Render range selector với tooltip được điều khiển từ composer để tránh tooltip treo khi Select mở.
export function SellerCopilotRangeControl({
    range,
    isOpen,
    activeTooltip,
    onOpenChange,
    onTooltipOpenChange,
    onRangeChange,
}: SellerCopilotRangeControlProps) {
    return (
        <TooltipProvider delayDuration={180}>
            <Select
                value={range}
                open={isOpen}
                onOpenChange={onOpenChange}
                onValueChange={(value) => {
                    if (value) onRangeChange(value as typeof range);
                }}
            >
                <Tooltip
                    open={!isOpen && activeTooltip === 'range'}
                    onOpenChange={onTooltipOpenChange}
                >
                    <TooltipTrigger asChild>
                        <span className="inline-flex shrink-0 cursor-pointer">
                            <SelectTrigger
                                className="mb-1 size-9 h-9 w-9 shrink-0 cursor-pointer justify-center rounded-full border border-zinc-300 bg-zinc-50 p-0 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 data-[size=default]:h-9 data-[size=default]:w-9 [&>svg:last-child]:hidden"
                                aria-label={`Khoảng thời gian phân tích: ${range === '7d' ? '7 ngày' : range === '90d' ? '90 ngày' : '30 ngày'}`}
                            >
                                <SelectValue className="justify-center">
                                    <CalendarDays className="size-4" />
                                </SelectValue>
                            </SelectTrigger>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        className="border border-zinc-200 bg-white text-zinc-950 shadow-xl"
                        arrowClassName="fill-white stroke-zinc-200 stroke-1"
                    >
                        Khoảng thời gian phân tích
                    </TooltipContent>
                </Tooltip>
                <SelectContent
                    side="top"
                    sideOffset={8}
                    align="end"
                    alignItemWithTrigger={false}
                >
                    <SelectItem value="7d">7 ngày</SelectItem>
                    <SelectItem value="30d">30 ngày</SelectItem>
                    <SelectItem value="90d">90 ngày</SelectItem>
                </SelectContent>
            </Select>
        </TooltipProvider>
    );
}
