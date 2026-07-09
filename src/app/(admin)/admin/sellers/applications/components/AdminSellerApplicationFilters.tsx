'use client';

import { RefreshCcw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SellerApplicationStatus } from '@/services/seller';

type AdminSellerApplicationStatusFilter = SellerApplicationStatus | 'all';

interface AdminSellerApplicationFiltersProps {
    status: AdminSellerApplicationStatusFilter;
    search: string;
    loading: boolean;
    onStatusChange: (status: AdminSellerApplicationStatusFilter) => void;
    onSearchChange: (search: string) => void;
    onRefresh: () => void;
}

// Filter danh sách hồ sơ theo trạng thái và từ khóa, giữ các điều khiển trong một hàng gọn cho admin thao tác nhanh.
export function AdminSellerApplicationFilters({
    status,
    search,
    loading,
    onStatusChange,
    onSearchChange,
    onRefresh,
}: AdminSellerApplicationFiltersProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onStatusChange('all')}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                            status === 'all'
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                        )}
                    >
                        Tất cả
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusChange('pending_review')}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                            status === 'pending_review'
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                        )}
                    >
                        Chờ duyệt
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusChange('draft')}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                            status === 'draft'
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                        )}
                    >
                        Bản nháp
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusChange('approved')}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                            status === 'approved'
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                        )}
                    >
                        Đã duyệt
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusChange('rejected')}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                            status === 'rejected'
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                        )}
                    >
                        Từ chối
                    </button>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Tìm shop, email, slug..."
                            className="h-10 rounded-lg pl-9"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-lg"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
                        Làm mới
                    </Button>
                </div>
            </div>
        </div>
    );
}
