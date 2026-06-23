import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
}

// Chuẩn hóa khoảng cách label/input để các bước form không bị lệch nhịp hiển thị.
export function Field({ label, htmlFor, error, children }: FieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
    );
}
