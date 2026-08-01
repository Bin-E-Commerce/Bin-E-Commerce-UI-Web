'use client';

import { CheckCircle2, Loader2, Pencil, RefreshCw, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ShopProfileDto } from '@/services/seller';
import { formatShopProfileDate } from '../utils/shop-profile-formatters';

interface ShopProfileHeaderProps {
    profile: ShopProfileDto;
    editing: boolean;
    refreshing: boolean;
    onEdit: () => void;
    onRefresh: () => void;
}

// Tóm tắt trạng thái vận hành của shop và đặt các thao tác cấp trang ở vị trí dễ quét trên mọi viewport.
export function ShopProfileHeader({
    profile,
    editing,
    refreshing,
    onEdit,
    onRefresh,
}: ShopProfileHeaderProps) {
    return (
        <header className="flex flex-col gap-5 px-5 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                    <Store className="size-5" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                        Quản lý shop
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-zinc-950">
                            Hồ sơ shop
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
                            <CheckCircle2 className="size-3.5" />
                            Đã xác minh
                        </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                        Quản lý thông tin khách hàng nhìn thấy và kiểm tra hồ sơ
                        pháp lý đã được duyệt.
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                        Xác minh ngày {formatShopProfileDate(profile.shop.verifiedAt)}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
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
                {profile.capabilities.canUpdatePublicProfile && !editing ? (
                    <Button
                        type="button"
                        size="lg"
                        className="bg-zinc-950 px-4 text-white hover:bg-zinc-800"
                        onClick={onEdit}
                    >
                        <Pencil className="size-4" />
                        Chỉnh sửa
                    </Button>
                ) : null}
            </div>
        </header>
    );
}
