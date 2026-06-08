import { Monitor } from 'lucide-react';

// Hiển thị trạng thái rỗng khi API không trả về phiên đăng nhập nào.
export function EmptySessions() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center">
            <Monitor className="mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-medium text-zinc-500">
                Không có phiên nào đang hoạt động
            </p>
            <p className="mt-1 text-sm text-zinc-400">
                Thử đăng nhập lại để bắt đầu phiên mới
            </p>
        </div>
    );
}
