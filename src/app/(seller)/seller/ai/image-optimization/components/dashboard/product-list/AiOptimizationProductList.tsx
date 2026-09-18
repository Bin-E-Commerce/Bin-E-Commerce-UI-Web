// Danh sách và vùng thao tác tối ưu ảnh của Seller Center.
// Component chỉ nhận dữ liệu/callback từ dashboard; không gọi API và không sở hữu business state.

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Package,
    RefreshCw,
    Search,
} from 'lucide-react';
import type { ImageOptimizationProduct } from '@/services/ai/types/image-optimization.types';

interface AiOptimizationProductListProps {
    visibleProducts: ImageOptimizationProduct[];
    selectedIds: string[];
    searchValue: string;
    page: number;
    totalPages: number;
    totalItems: number;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    onSearchChange: (value: string) => void;
    onSearch: (value: string) => void;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
    onToggleProduct: (productId: string) => void;
}

// Render product selection, preview inputs and CTA trong cùng một boundary để dashboard không phải chứa markup dài.
// Component giữ toàn bộ text hiển thị tại JSX, còn dashboard chỉ điều phối query, mutation và state lifecycle.
export function AiOptimizationProductList({
    visibleProducts,
    selectedIds,
    searchValue,
    page,
    totalPages,
    totalItems,
    isLoading,
    isError,
    isFetching,
    onSearchChange,
    onSearch,
    onPageChange,
    onRefresh,
    onToggleProduct,
}: AiOptimizationProductListProps) {
    return (
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="mx-5 flex flex-col gap-2 border-b border-zinc-200 py-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-zinc-950 sm:text-xl">
                        Chọn một sản phẩm để tối ưu
                    </h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="self-start rounded-lg sm:self-auto"
                >
                    <RefreshCw
                        className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                    />
                    Làm mới
                </Button>
            </div>

            <form
                className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSearch(searchValue);
                }}
            >
                <div className="flex min-w-0 flex-1 gap-2">
                    <div className="relative min-w-0 flex-1">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                            aria-hidden="true"
                        />
                        <Input
                            value={searchValue}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            placeholder="Tìm theo tên sản phẩm"
                            aria-label="Tìm theo tên sản phẩm"
                            className="h-10 rounded-xl pl-9"
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="outline"
                        disabled={isFetching}
                        className="h-10 shrink-0 rounded-xl"
                    >
                        Tìm kiếm
                    </Button>
                </div>
                <div className="flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 sm:ml-auto sm:self-auto">
                    <Package
                        className="size-3.5 text-zinc-400"
                        aria-hidden="true"
                    />
                    <span>
                        <strong className="font-semibold text-zinc-900">
                            {totalItems}
                        </strong>{' '}
                        sản phẩm
                    </span>
                </div>
            </form>

            {isError ? (
                <div className="m-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle
                        className="size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <p>
                        Không tải được danh sách sản phẩm. Vui lòng thử lại sau.
                    </p>
                </div>
            ) : null}

            <div className="divide-y divide-zinc-100">
                {visibleProducts.map((product) => (
                    <div key={product.id}>
                        <label className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 sm:px-6">
                            <input
                                type="radio"
                                name="ai-optimization-product"
                                checked={selectedIds[0] === product.id}
                                onChange={() => onToggleProduct(product.id)}
                                className="size-4 accent-zinc-950"
                                aria-label={`Chọn ${product.name}`}
                            />
                            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                {product.thumbnailUrl ? (
                                    <img
                                        src={product.thumbnailUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Package
                                        className="size-6 text-zinc-300"
                                        aria-hidden="true"
                                    />
                                )}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-zinc-950">
                                    {product.name}
                                </span>
                                <span className="mt-1 block text-xs text-zinc-500">
                                    {product.totalSold} đã bán · cập nhật{' '}
                                    {new Date(
                                        product.updatedAt,
                                    ).toLocaleDateString('vi-VN')}
                                </span>
                            </span>
                        </label>
                    </div>
                ))}
                {!isLoading && visibleProducts.length === 0 ? (
                    <div className="p-10 text-center text-sm text-zinc-500">
                        {searchValue
                            ? 'Không tìm thấy sản phẩm phù hợp.'
                            : 'Chưa có sản phẩm để tối ưu.'}
                    </div>
                ) : null}
            </div>

            {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4 sm:px-6">
                    <p className="text-xs text-zinc-500">
                        Trang {page} / {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Trang trước"
                            title="Trang trước"
                            disabled={isFetching || page <= 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            <ChevronLeft
                                className="size-4"
                                aria-hidden="true"
                            />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Trang sau"
                            title="Trang sau"
                            disabled={isFetching || page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                        >
                            <ChevronRight
                                className="size-4"
                                aria-hidden="true"
                            />
                        </Button>
                    </div>
                </div>
            ) : null}

            <div className="border-t border-zinc-200 px-5 py-4 text-xs text-zinc-500 sm:px-6">
                <span className="font-medium text-zinc-700">Lưu ý:</span> ảnh
                gốc không bị xóa. Seller phải xem trước và xác nhận trước khi áp
                dụng.
            </div>
        </section>
    );
}
