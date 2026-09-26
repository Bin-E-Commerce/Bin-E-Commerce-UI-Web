// Header của trang list; chỉ sở hữu tiêu đề và hành động refresh, không biết query key hay API.
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AdminUsersHeaderProps {
    isFetching: boolean;
    onRefresh: () => void;
}

// Hiển thị ngữ cảnh Admin Center và khóa nút refresh trong lúc request đang chạy.
export function AdminUsersHeader({
    isFetching,
    onRefresh,
}: AdminUsersHeaderProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        Admin Center
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
                        Quản lý người dùng
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                        Theo dõi tài khoản, role, trạng thái đăng nhập và
                        session. Mọi thay đổi đều cần lý do và được ghi audit.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    type="button"
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                    <RefreshCw
                        className={
                            isFetching ? 'size-4 animate-spin' : 'size-4'
                        }
                    />{' '}
                    Làm mới
                </Button>
            </div>
        </section>
    );
}
