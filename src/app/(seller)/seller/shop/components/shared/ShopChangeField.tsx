import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface ShopChangeFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}

// Chuẩn hóa label và lỗi cho các form compliance để mọi field có cùng nhịp dọc và trạng thái truy cập.
export function ShopChangeField({
    label,
    required = false,
    error,
    children,
}: ShopChangeFieldProps) {
    return (
        <div>
            <p className="text-sm font-medium text-zinc-900">
                {label}{' '}
                {required ? <span className="text-red-600">*</span> : null}
            </p>
            <div className="mt-2">{children}</div>
            {error ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {error}
                </p>
            ) : null}
        </div>
    );
}
