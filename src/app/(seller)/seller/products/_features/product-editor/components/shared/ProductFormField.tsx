// File này chuẩn hóa label, hint và lỗi cho các field trong wizard sản phẩm.
// Component không sở hữu business validation; chỉ nhận nội dung trình bày và action phụ từ section gọi nó.

import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

interface ProductFormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    labelExtra?: ReactNode;
    children: ReactNode;
}

// Chuẩn hóa label, dấu bắt buộc, gợi ý và lỗi để mọi section của form có cùng nhịp hiển thị.
export function ProductFormField({
    label,
    htmlFor,
    required = false,
    error,
    hint,
    labelExtra,
    children,
}: ProductFormFieldProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={htmlFor} className="text-sm text-zinc-900">
                    {label}
                    {required ? <span className="ml-1 text-red-600">*</span> : null}
                </Label>
                {labelExtra}
            </div>
            {children}
            {error ? (
                <p className="text-xs leading-5 text-red-600">{error}</p>
            ) : hint ? (
                <p className="text-xs leading-5 text-zinc-500">{hint}</p>
            ) : null}
        </div>
    );
}
