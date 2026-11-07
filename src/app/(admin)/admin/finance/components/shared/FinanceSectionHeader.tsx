// Header dùng chung cho các bảng tài chính trong Admin Center.
'use client';

import type { FinanceSectionHeaderProps } from '../../types/shared/finance-section-header.types';

// Giữ icon, tiêu đề, mô tả, bộ đếm và thao tác ở cùng vị trí trên các bảng.
// Nội dung đếm được truyền từ chủ sở hữu dữ liệu nên header không tự suy diễn trạng thái.
export function FinanceSectionHeader({
    icon: Icon,
    title,
    description,
    countLabel,
    actions,
}: FinanceSectionHeaderProps) {
    return (
        <header className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                    <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-5 tracking-tight text-zinc-950">
                        {title}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-600">
                        {description}
                    </p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {countLabel ? (
                    <span className="inline-flex min-h-9 items-center rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 shadow-sm">
                        <span aria-live="polite">{countLabel}</span>
                    </span>
                ) : null}
                {actions}
            </div>
        </header>
    );
}
