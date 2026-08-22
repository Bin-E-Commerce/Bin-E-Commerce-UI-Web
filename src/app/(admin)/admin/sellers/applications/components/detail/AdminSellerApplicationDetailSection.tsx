import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminSellerApplicationDetailSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

// Section chi tiết dùng chung để các nhóm thông tin hồ sơ có cùng nhịp spacing và border.
export function AdminSellerApplicationDetailSection({
    title,
    description,
    children,
    className,
}: AdminSellerApplicationDetailSectionProps) {
    return (
        <section
            className={cn(
                'rounded-xl border border-zinc-200 bg-white shadow-sm',
                className,
            )}
        >
            <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
                {description ? (
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

interface AdminSellerApplicationDetailFieldProps {
    label: string;
    value: ReactNode;
    muted?: boolean;
}

// Field nhỏ dùng cho dữ liệu key-value để admin scan nhanh mà không cần đọc một đoạn văn dài.
export function AdminSellerApplicationDetailField({
    label,
    value,
    muted = false,
}: AdminSellerApplicationDetailFieldProps) {
    return (
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {label}
            </p>
            <div
                className={cn(
                    'mt-1 break-words text-sm font-medium leading-6',
                    muted ? 'text-zinc-500' : 'text-zinc-950',
                )}
            >
                {value}
            </div>
        </div>
    );
}
