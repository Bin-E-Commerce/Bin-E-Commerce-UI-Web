// Header hồ sơ shop chỉ trình bày trạng thái xác minh và thao tác trang; dữ liệu vẫn do hook cha sở hữu.
'use client';

import { CheckCircle2, Loader2, Pencil, RefreshCw, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ShopProfileDto } from '@/services/seller';
import { formatShopProfileDate } from '../../utils/shop-profile-formatters';

interface ShopProfileHeaderProps {
    profile: ShopProfileDto;
    editing: boolean;
    canEdit: boolean;
    editLabel: string;
    refreshing: boolean;
    onEdit: () => void;
    onRefresh: () => void;
}

// Tóm tắt hồ sơ với nhịp dọc gọn để tiêu đề, mô tả và ngày xác minh không chiếm quá nhiều chiều cao.
export function ShopProfileHeader({
    profile,
    editing,
    canEdit,
    editLabel,
    refreshing,
    onEdit,
    onRefresh,
}: ShopProfileHeaderProps) {
    return (
        <header className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    <Store className="size-5" />
                </span>
                <div className="min-w-0">
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold leading-6 text-zinc-950">
                            Hồ sơ shop
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                            <CheckCircle2 className="size-3" />
                            Đã xác minh
                        </span>
                    </div>

                    <p className="mt-0.5 text-[11px] leading-4 text-zinc-400">
                        Xác minh ngày{' '}
                        {formatShopProfileDate(profile.shop.verifiedAt)}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:self-center">
                <Button
                    type="button"
                    variant="outline"
                    size="default"
                    aria-label="Làm mới hồ sơ shop"
                    disabled={refreshing || editing}
                    onClick={onRefresh}
                >
                    {refreshing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <RefreshCw className="size-4" />
                    )}
                    Làm mới
                </Button>
                {canEdit && !editing ? (
                    <Button
                        type="button"
                        size="default"
                        className="bg-zinc-950 px-4 text-white hover:bg-zinc-800"
                        onClick={onEdit}
                    >
                        <Pencil className="size-4" />
                        {editLabel}
                    </Button>
                ) : null}
            </div>
        </header>
    );
}
