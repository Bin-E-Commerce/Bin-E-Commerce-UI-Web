// Phân trang danh sách shop nội bộ với giao diện đồng bộ cùng trang gợi ý sản phẩm.
// Component chỉ trình bày và phát sự kiện đổi trang; query backend thuộc về component cha.

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShopDirectoryPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

type PageItem = number | 'ellipsis';

// Giữ trang đầu, trang cuối và vùng quanh trang hiện tại để danh sách số không bị kéo dài.
function getPageItems(currentPage: number, totalPages: number): PageItem[] {
    const visiblePages = new Set<number>();
    const firstAndLastPageCount = Math.min(totalPages, 2);

    for (let page = 1; page <= firstAndLastPageCount; page += 1) {
        visiblePages.add(page);
    }
    for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page += 1) {
        visiblePages.add(page);
    }
    for (let page = Math.max(1, totalPages - 1); page <= totalPages; page += 1) {
        visiblePages.add(page);
    }

    const sortedPages = Array.from(visiblePages).sort((left, right) => left - right);
    return sortedPages.reduce<PageItem[]>((items, page, index) => {
        const previousPage = sortedPages[index - 1];
        if (previousPage && page - previousPage > 1) items.push('ellipsis');
        items.push(page);
        return items;
    }, []);
}

// Hiển thị số dòng đang xem và các nút điều hướng, khóa nút khi không còn trang hợp lệ.
export function ShopDirectoryPagination({ page, totalPages, totalItems, onPageChange }: ShopDirectoryPaginationProps) {
    if (totalItems === 0) return null;

    const safeTotalPages = Math.max(totalPages, 1);
    const pageItems = getPageItems(page, safeTotalPages);

    return (
        <nav aria-label="Phân trang shop nội bộ" className="mt-8 border-t border-zinc-200 px-0 pt-6">
            <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                <p className="text-sm text-zinc-500">Trang <strong className="font-semibold text-zinc-900">{page}</strong> / {safeTotalPages}</p>
                <div className="flex items-center gap-1.5">
                    <Button type="button" variant="outline" size="icon" aria-label="Trang trước" title="Trang trước" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={cn('h-9 min-w-9 rounded-lg px-2 transition-colors', page <= 1 ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-300 disabled:pointer-events-auto' : 'cursor-pointer border-zinc-200 bg-white text-zinc-600 hover:border-zinc-950 hover:text-zinc-950')}><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="hidden items-center gap-1.5 sm:flex">
                        {pageItems.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} aria-hidden="true" className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-zinc-400">…</span> : <Button key={item} type="button" variant="ghost" aria-label={`Đến trang ${item}`} aria-current={item === page ? 'page' : undefined} disabled={item === page} onClick={() => onPageChange(item)} className={cn('h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition-colors', item === page ? 'cursor-default border-zinc-950 bg-zinc-950 text-white opacity-100 hover:bg-zinc-950 hover:text-white disabled:pointer-events-auto disabled:opacity-100' : 'cursor-pointer border-zinc-200 text-zinc-600 hover:border-zinc-950 hover:text-zinc-950')}>{item}</Button>)}
                    </div>
                    <Button type="button" variant="outline" size="icon" aria-label="Trang sau" title="Trang sau" disabled={page >= safeTotalPages} onClick={() => onPageChange(page + 1)} className={cn('h-9 min-w-9 rounded-lg px-2 transition-colors', page >= safeTotalPages ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-300 disabled:pointer-events-auto' : 'cursor-pointer border-zinc-200 bg-white text-zinc-600 hover:border-zinc-950 hover:text-zinc-950')}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </nav>
    );
}
