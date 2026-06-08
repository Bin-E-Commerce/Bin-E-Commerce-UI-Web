import { KeyRound } from 'lucide-react';

// Hiển thị phương thức đăng nhập của phiên bằng nhãn nhỏ trong thẻ phiên.
export function AuthBadge({ clientId }: { clientId: string | null }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
            <KeyRound className="h-2.5 w-2.5" />
            {clientId ? 'Google' : 'Mật khẩu'}
        </span>
    );
}
