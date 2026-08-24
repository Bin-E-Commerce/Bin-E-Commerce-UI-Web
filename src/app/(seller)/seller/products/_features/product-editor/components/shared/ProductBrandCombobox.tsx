'use client';

import {
    Check,
    ChevronsUpDown,
    Loader2,
    RefreshCw,
    Search,
} from 'lucide-react';
import { useState, type UIEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ProductBrand } from '@/services/product';
import { useProductBrands } from '../../hooks/useProductBrands';

interface ProductBrandComboboxProps {
    value: ProductBrand | null;
    disabled?: boolean;
    onSelect: (brand: ProductBrand | null) => void;
}

// Hiển thị bộ chọn thương hiệu có tìm kiếm toàn cục và phân trang vô hạn từ Product Service.
export function ProductBrandCombobox({
    value,
    disabled = false,
    onSelect,
}: ProductBrandComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const brandsQuery = useProductBrands(query, open);

    // Xóa từ khóa khi popup đóng để lần mở sau luôn bắt đầu từ danh sách thương hiệu đầy đủ.
    const changeOpen = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
    };

    // Chốt thương hiệu và đóng popup để form tiếp tục ở đúng vị trí hiện tại.
    const chooseBrand = (brand: ProductBrand | null) => {
        onSelect(brand);
        changeOpen(false);
    };

    // Tải trang kế tiếp khi thanh cuộn còn cách đáy một đoạn ngắn, tránh tạo hàng nghìn node DOM cùng lúc.
    const loadMoreWhenNeeded = (event: UIEvent<HTMLDivElement>) => {
        const viewport = event.currentTarget;
        const distanceToBottom =
            viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

        if (
            distanceToBottom <= 56 &&
            brandsQuery.hasNextPage &&
            !brandsQuery.isFetchingNextPage
        ) {
            void brandsQuery.fetchNextPage();
        }
    };

    return (
        <Popover open={open} onOpenChange={changeOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="h-11 w-full justify-between px-3 font-normal"
                >
                    <span className={cn('truncate', !value && 'text-zinc-500')}>
                        {value?.name || 'Tìm hoặc chọn thương hiệu'}
                    </span>
                    <ChevronsUpDown className="size-4 text-zinc-400" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[360px] max-w-[calc(100vw-32px)] p-2"
            >
                <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Tìm tên thương hiệu"
                        className="h-10 pl-9"
                    />
                </div>

                <div
                    className="max-h-72 overflow-y-auto overscroll-contain"
                    onScroll={loadMoreWhenNeeded}
                >
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none"
                        onClick={() => chooseBrand(null)}
                    >
                        Không có thương hiệu
                        {!value ? <Check className="size-4" /> : null}
                    </button>

                    {brandsQuery.isPending ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
                            <Loader2 className="size-4 animate-spin" />
                            Đang tải thương hiệu
                        </div>
                    ) : brandsQuery.isError ? (
                        <div className="flex flex-col items-center gap-3 px-4 py-7 text-center">
                            <p className="text-sm text-zinc-600">
                                Không tải được danh sách thương hiệu.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void brandsQuery.refetch()}
                            >
                                <RefreshCw className="size-4" />
                                Thử lại
                            </Button>
                        </div>
                    ) : brandsQuery.brands.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-zinc-500">
                            Không tìm thấy thương hiệu phù hợp.
                        </p>
                    ) : (
                        <>
                            {brandsQuery.brands.map((brand) => (
                                <button
                                    key={brand.id}
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none"
                                    onClick={() => chooseBrand(brand)}
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-zinc-950">
                                            {brand.name}
                                        </span>
                                        {brand.countryName ? (
                                            <span className="block truncate text-xs text-zinc-500">
                                                {brand.countryName}
                                            </span>
                                        ) : null}
                                    </span>
                                    {value?.id === brand.id ? (
                                        <Check className="size-4 shrink-0" />
                                    ) : null}
                                </button>
                            ))}

                            {brandsQuery.isFetchingNextPage ? (
                                <div className="flex items-center justify-center gap-2 py-3 text-xs text-zinc-500">
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Đang tải thêm
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                {!brandsQuery.isPending && !brandsQuery.isError ? (
                    <p className="border-t border-zinc-100 px-3 pt-2 text-xs text-zinc-500">
                        Đang hiển thị {brandsQuery.brands.length} /{' '}
                        {brandsQuery.total} thương hiệu
                    </p>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}
