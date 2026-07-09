import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AccessControlHeaderProps {
    isFetching: boolean;
    onRefresh: () => void;
}

// Header giới thiệu mục đích trang và cung cấp nút refresh dữ liệu phân quyền từ backend.
export function AccessControlHeader({
    isFetching,
    onRefresh,
}: AccessControlHeaderProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        Access Control
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
                        Phân quyền nền tảng
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                        Quản lý quyền theo role, kiểm tra scope áp dụng và cấp
                        nhật quyền truy cập cho các khu vực đã triển khai.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={isFetching}
                    onClick={onRefresh}
                >
                    <RefreshCw
                        className={
                            isFetching ? 'size-4 animate-spin' : 'size-4'
                        }
                    />
                    Làm mới
                </Button>
            </div>
        </section>
    );
}
