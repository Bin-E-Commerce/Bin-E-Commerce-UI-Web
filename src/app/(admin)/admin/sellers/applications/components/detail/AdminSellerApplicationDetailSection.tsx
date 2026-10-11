// Khung và field dùng chung cho các nhóm thông tin seller; chỉ trình bày dữ liệu, không quyết định nghiệp vụ duyệt.

import { cn } from '@/lib/utils';
import type {
    AdminSellerApplicationDetailFieldProps,
    AdminSellerApplicationDetailSectionProps,
} from '../../types/application-detail.types';

// Section chi tiết dùng chung để các nhóm thông tin hồ sơ có cùng nhịp spacing và border.
export function AdminSellerApplicationDetailSection({
    title,
    description,
    children,
    className,
    icon: Icon,
    density = 'default',
}: AdminSellerApplicationDetailSectionProps) {
    return (
        <section
            data-density={density}
            className={cn(
                'group/detail-section overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]',
                className,
            )}
        >
            <div
                className={cn(
                    'flex items-center border-b border-zinc-100',
                    density === 'compact'
                        ? 'gap-2.5 px-3 py-2 sm:px-3.5'
                        : 'gap-3 px-4 py-3.5 sm:px-5',
                )}
            >
                {Icon ? (
                    <span
                        className={cn(
                            'flex shrink-0 items-center justify-center bg-zinc-100 text-zinc-700',
                            density === 'compact'
                                ? 'size-8 rounded-lg'
                                : 'size-9 rounded-xl',
                        )}
                    >
                        <Icon className="size-4" />
                    </span>
                ) : null}
                <div className="min-w-0">
                    <h2
                        className={cn(
                            'font-semibold text-zinc-950',
                            density === 'compact'
                                ? 'text-[13px]'
                                : 'text-sm sm:text-base',
                        )}
                    >
                        {title}
                    </h2>
                    {description ? (
                        <p
                            className={cn(
                                'text-xs text-zinc-500',
                                density === 'compact'
                                    ? 'mt-0 leading-4'
                                    : 'mt-0.5 leading-5 sm:text-sm',
                            )}
                        >
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            <div
                className={density === 'compact' ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'}
            >
                {children}
            </div>
        </section>
    );
}

// Field nhỏ dùng cho dữ liệu key-value để admin scan nhanh mà không cần đọc một đoạn văn dài.
export function AdminSellerApplicationDetailField({
    label,
    value,
    muted = false,
    className,
    compact = false,
}: AdminSellerApplicationDetailFieldProps) {
    return (
        <div
            className={cn(
                'min-w-0 border border-zinc-100 bg-zinc-50/80',
                compact
                    ? 'rounded-lg px-2.5 py-1.5'
                    : 'rounded-xl px-3 py-2.5',
                className,
            )}
        >
            <p
                className={cn(
                    'font-semibold uppercase tracking-[0.08em] text-zinc-400',
                    compact ? 'text-[9px]' : 'text-[10px] sm:text-[11px]',
                )}
            >
                {label}
            </p>
            <div
                className={cn(
                    'break-words font-medium',
                    compact
                        ? 'mt-0.5 text-xs leading-4'
                        : 'mt-1 text-[13px] leading-5 sm:text-sm',
                    muted ? 'text-zinc-500' : 'text-zinc-950',
                )}
            >
                {value}
            </div>
        </div>
    );
}
