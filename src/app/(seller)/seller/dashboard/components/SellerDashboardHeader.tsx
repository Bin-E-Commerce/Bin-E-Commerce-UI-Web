// Header dashboard hiển thị scope dữ liệu, trạng thái shop và thao tác refresh thủ công.

import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    SellerDashboardRange,
    SellerDashboardSnapshot,
} from '@/services/seller';
import { formatDashboardDate } from '../utils/dashboard-formatters';

interface SellerDashboardHeaderProps {
    snapshot: SellerDashboardSnapshot;
    range: SellerDashboardRange;
    onRangeChange: (value: string) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function SellerDashboardHeader({
    snapshot,
    range,
    onRangeChange,
    onRefresh,
    isRefreshing,
}: SellerDashboardHeaderProps) {
    return (
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                    Tổng quan vận hành
                </h1>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                    Dữ liệu mới nhất:{' '}
                    {formatDashboardDate(snapshot.generatedAt)}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 lg:shrink-0">
                <Select
                    value={range}
                    onValueChange={(value) => {
                        if (value) onRangeChange(value);
                    }}
                >
                    <SelectTrigger className="h-8 min-w-28 bg-white text-xs">
                        <SelectValue>
                            {range === '7d'
                                ? '7 ngày'
                                : range === '90d'
                                  ? '90 ngày'
                                  : '30 ngày'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        alignItemWithTrigger={false}
                    >
                        <SelectItem value="7d">7 ngày</SelectItem>
                        <SelectItem value="30d">30 ngày</SelectItem>
                        <SelectItem value="90d">90 ngày</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    type="button"
                    variant="outline"
                    className="h-8 gap-1.5 bg-white px-3 text-xs"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw
                        className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    Làm mới
                </Button>
                <Link
                    href="/seller/orders"
                    className={buttonVariants({
                        className: 'h-8 gap-1.5 px-3 text-xs',
                    })}
                >
                    Xem đơn hàng
                </Link>
            </div>
        </header>
    );
}
