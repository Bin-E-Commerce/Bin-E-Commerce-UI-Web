import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}

// Chuẩn hóa khoảng cách label/input và dấu bắt buộc để các bước form hiển thị thống nhất.
export function Field({
    label,
    htmlFor,
    error,
    required = false,
    children,
}: FieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required ? (
                    <span className="ml-1 text-red-500">*</span>
                ) : null}
            </Label>
            {children}
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
    );
}
