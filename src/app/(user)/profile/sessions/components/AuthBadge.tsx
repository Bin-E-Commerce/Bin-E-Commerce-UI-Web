import { KeyRound } from 'lucide-react';

const LOGIN_METHOD_LABEL: Record<string, string> = {
    password: 'Mật khẩu',
    google: 'Google',
    facebook: 'Facebook',
};

// Hiển thị phương thức đăng nhập của phiên bằng nhãn nhỏ trong thẻ phiên.
export function AuthBadge({ loginMethod }: { loginMethod: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
            <KeyRound className="h-2.5 w-2.5" />
            {LOGIN_METHOD_LABEL[loginMethod] ?? loginMethod}
        </span>
    );
}
