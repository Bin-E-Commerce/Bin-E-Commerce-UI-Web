// Thanh tìm kiếm shop nội bộ; component chỉ phát sự kiện submit/clear, không tự quản lý query.

import type { FormEvent } from 'react';
import { Search, Store, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Hiển thị tiêu đề, số kết quả và ô tìm kiếm theo một API callback đơn giản.
export function ShopDirectorySearchBar({
    search,
    resultLabel,
    isFetching,
    onSearchChange,
    onSubmit,
    onClear,
}: {
    search: string;
    resultLabel: string;
    isFetching: boolean;
    onSearchChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClear: () => void;
}) {
    return (
        <Card className="border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                            <Store className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                                Khám phá shop nội bộ
                            </h2>
                            <p className="mt-1 truncate text-sm text-zinc-500">
                                {resultLabel}
                            </p>
                        </div>
                    </div>
                    <form
                        className="flex w-full gap-2 xl:w-[440px] xl:shrink-0"
                        onSubmit={onSubmit}
                    >
                        <label
                            className="sr-only"
                            htmlFor="internal-shop-search"
                        >
                            Tìm kiếm shop nội bộ
                        </label>
                        <div className="relative flex min-w-0 flex-1 items-center rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 transition-colors focus-within:border-zinc-400 focus-within:bg-white">
                            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                            <Input
                                id="internal-shop-search"
                                value={search}
                                onChange={(event) =>
                                    onSearchChange(event.target.value)
                                }
                                placeholder="Tên shop, mô tả hoặc khu vực..."
                                autoComplete="off"
                                enterKeyHint="search"
                                className="h-10 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
                            />
                            {search ? (
                                <button
                                    type="button"
                                    aria-label="Xóa từ khóa tìm kiếm"
                                    className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
                                    onClick={onClear}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                        <Button
                            type="submit"
                            className="h-10 rounded-xl bg-zinc-950 px-5 hover:bg-zinc-800"
                        >
                            {isFetching ? 'Đang tìm' : 'Tìm kiếm'}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
