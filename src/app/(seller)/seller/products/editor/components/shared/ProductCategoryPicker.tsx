'use client';

import { Check, ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    catalogService,
    type CatalogCategory,
} from '@/services/catalog';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface ProductCategoryPickerProps {
    value: { id: string; name: string; path: string | null } | null;
    error?: string;
    disabled?: boolean;
    onSelect: (category: CatalogCategory) => void | Promise<void>;
}

// Cho phép tìm nhanh category lá hoặc duyệt cây nhiều cấp mà không hard-code số level của catalog.
export function ProductCategoryPicker({
    value,
    error,
    disabled = false,
    onSelect,
}: ProductCategoryPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [columns, setColumns] = useState<CatalogCategory[][]>([]);
    const [trail, setTrail] = useState<CatalogCategory[]>([]);
    const [searchResults, setSearchResults] = useState<CatalogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!open || columns.length > 0) return;
        void loadRootCategories();
    }, [open, columns.length]);

    useEffect(() => {
        if (!open || query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void searchLeafCategories(query.trim());
        }, 300);
        return () => window.clearTimeout(timeoutId);
    }, [open, query]);

    // Tải cấp gốc khi mở lần đầu để người bán có thể duyệt category mà không cần nhập từ khóa.
    const loadRootCategories = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await catalogService.listCategories({
                level: 0,
                page: 1,
                pageSize: 100,
            });
            setColumns([response.items]);
        } catch (requestError) {
            setLoadError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    };

    // Tìm trực tiếp category lá để kết quả luôn hợp lệ với rule tạo sản phẩm của backend.
    const searchLeafCategories = async (search: string) => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await catalogService.listCategories({
                search,
                isLeaf: true,
                page: 1,
                pageSize: 50,
            });
            setSearchResults(response.items);
        } catch (requestError) {
            setLoadError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    };

    // Mở cột con kế tiếp hoặc chốt category khi người dùng chọn node lá.
    const chooseCategory = async (
        category: CatalogCategory,
        columnIndex: number,
    ) => {
        const nextTrail = [...trail.slice(0, columnIndex), category];
        setTrail(nextTrail);
        if (category.isLeaf) {
            await onSelect(category);
            setOpen(false);
            setQuery('');
            return;
        }

        setLoading(true);
        setLoadError('');
        try {
            const response = await catalogService.listCategories({
                parentId: category.id,
                page: 1,
                pageSize: 100,
            });
            setColumns([
                ...columns.slice(0, columnIndex + 1),
                response.items,
            ]);
        } catch (requestError) {
            setLoadError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    };

    // Chọn kết quả tìm kiếm mà không cần đi lại từng cấp trong cây.
    const chooseSearchResult = async (category: CatalogCategory) => {
        await onSelect(category);
        setOpen(false);
        setQuery('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    className="h-11 w-full justify-between px-3 text-left font-normal"
                >
                    <span className={cn('truncate', !value && 'text-zinc-500')}>
                        {value?.path || value?.name || 'Chọn ngành hàng cấp cuối'}
                    </span>
                    <ChevronDown className="size-4 text-zinc-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[min(920px,calc(100vw-32px))] p-0"
            >
                <div className="border-b border-zinc-200 p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Tìm ngành hàng theo tên"
                            className="h-10 pl-9"
                        />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                        Chọn đúng ngành hàng giúp hệ thống hiển thị chính xác thuộc tính sản phẩm.
                    </p>
                </div>

                {loadError ? (
                    <div className="p-5 text-sm text-red-600">{loadError}</div>
                ) : query.trim().length >= 2 ? (
                    <div className="max-h-96 overflow-y-auto p-2">
                        {loading ? (
                            <LoadingState />
                        ) : searchResults.length > 0 ? (
                            searchResults.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-3 text-left hover:bg-zinc-100"
                                    onClick={() =>
                                        void chooseSearchResult(category)
                                    }
                                >
                                    <span>
                                        <span className="block text-sm font-medium text-zinc-950">
                                            {category.name}
                                        </span>
                                        <span className="mt-1 block text-xs text-zinc-500">
                                            {category.path}
                                        </span>
                                    </span>
                                    {value?.id === category.id ? (
                                        <Check className="size-4 shrink-0" />
                                    ) : null}
                                </button>
                            ))
                        ) : (
                            <p className="p-6 text-center text-sm text-zinc-500">
                                Không tìm thấy ngành hàng phù hợp.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex min-h-80 max-w-full overflow-x-auto">
                        {columns.map((categories, columnIndex) => (
                            <div
                                key={columnIndex}
                                className="w-72 shrink-0 border-r border-zinc-200 p-2 last:border-r-0"
                            >
                                <div className="max-h-80 overflow-y-auto">
                                    {categories.map((category) => {
                                        const selected =
                                            trail[columnIndex]?.id === category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                className={cn(
                                                    'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm hover:bg-zinc-100',
                                                    selected &&
                                                        'bg-zinc-100 font-semibold text-zinc-950',
                                                )}
                                                onClick={() =>
                                                    void chooseCategory(
                                                        category,
                                                        columnIndex,
                                                    )
                                                }
                                            >
                                                <span className="truncate">
                                                    {category.name}
                                                </span>
                                                {category.isLeaf ? (
                                                    value?.id === category.id ? (
                                                        <Check className="size-4" />
                                                    ) : null
                                                ) : (
                                                    <ChevronRight className="size-4 shrink-0 text-zinc-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {loading ? <LoadingState /> : null}
                    </div>
                )}

                <div className="border-t border-zinc-200 px-4 py-3 text-xs text-zinc-500">
                    Đã chọn: {value?.path || value?.name || 'Chưa chọn ngành hàng'}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Hiển thị loading đồng nhất trong cả chế độ tìm kiếm và duyệt cây.
function LoadingState() {
    return (
        <div className="flex min-h-28 min-w-48 flex-1 items-center justify-center gap-2 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            Đang tải ngành hàng
        </div>
    );
}
