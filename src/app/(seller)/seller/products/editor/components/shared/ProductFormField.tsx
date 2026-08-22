import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

interface ProductFormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: ReactNode;
}

// Chuẩn hóa label, dấu bắt buộc, gợi ý và lỗi để mọi section của form có cùng nhịp hiển thị.
export function ProductFormField({
    label,
    htmlFor,
    required = false,
    error,
    hint,
    children,
}: ProductFormFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor} className="text-sm text-zinc-900">
                {label}
                {required ? <span className="ml-1 text-red-600">*</span> : null}
            </Label>
            {children}
            {error ? (
                <p className="text-xs leading-5 text-red-600">{error}</p>
            ) : hint ? (
                <p className="text-xs leading-5 text-zinc-500">{hint}</p>
            ) : null}
        </div>
    );
}
