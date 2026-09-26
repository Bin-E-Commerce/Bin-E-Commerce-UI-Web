import { Button } from '@/components/ui/button';
// Pagination dùng chung cho bảng user; chỉ biết metadata và phát sự kiện chuyển trang.
interface AdminUsersPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    isFetching: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

// Hiển thị vị trí trang và vô hiệu hóa nút khi đang ở biên hoặc đang tải dữ liệu mới.
export function AdminUsersPagination({
    page,
    totalPages,
    total,
    isFetching,
    onPrevious,
    onNext,
}: AdminUsersPaginationProps) {
    return (
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500">
            <span>
                Trang {page} / {totalPages} · {total} user
            </span>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    type="button"
                    onClick={onPrevious}
                    disabled={page <= 1 || isFetching}
                    className="rounded-lg border border-zinc-200 px-3 py-2 disabled:opacity-40"
                >
                    Trước
                </Button>
                <Button
                    variant="ghost"
                    type="button"
                    onClick={onNext}
                    disabled={page >= totalPages || isFetching}
                    className="rounded-lg border border-zinc-200 px-3 py-2 disabled:opacity-40"
                >
                    Sau
                </Button>
            </div>
        </div>
    );
}
