import { CheckCircle2, LockKeyhole, XCircle } from 'lucide-react';

interface PermissionStatusIconProps {
    active: boolean;
    locked: boolean;
}

// Chọn icon trạng thái cho permission để admin nhìn nhanh quyền đang bật, đang tắt hay bị khóa.
export function PermissionStatusIcon({
    active,
    locked,
}: PermissionStatusIconProps) {
    if (locked) {
        return (
            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-950 text-white">
                <LockKeyhole className="size-3.5" />
            </span>
        );
    }

    if (active) {
        return (
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <CheckCircle2 className="size-3.5" />
            </span>
        );
    }

    return (
        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200">
            <XCircle className="size-3.5" />
        </span>
    );
}
