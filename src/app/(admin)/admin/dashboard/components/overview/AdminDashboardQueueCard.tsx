// Thẻ hàng đợi dashboard; trạng thái lỗi/loading được phân biệt để không biến lỗi API thành số 0.
'use client';

import Link from 'next/link';
import { ArrowUpRight, CircleAlert } from 'lucide-react';
import type { AdminDashboardQueueCardProps } from '../../types/overview/admin-dashboard-queue-card.types';

// Hiển thị một số đếm có thể mở thẳng module tương ứng mà không lộ thêm dữ liệu cá nhân trên dashboard.
export function AdminDashboardQueueCard({
    href,
    icon: Icon,
    value,
    state,
    title,
    description,
}: AdminDashboardQueueCardProps) {
    return (
        <Link
            href={href}
            className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
            <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                    <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-zinc-950">
                        {title}
                    </h2>
                    <p className="mt-0.5 truncate text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
                <ArrowUpRight
                    aria-hidden="true"
                    className="ml-auto size-4 shrink-0 text-zinc-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-700"
                />
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-zinc-100 pt-3">
                {state === 'loading' ? (
                    <span
                        aria-label="Đang tải số lượng"
                        className="h-7 w-12 animate-pulse rounded-lg bg-zinc-100"
                    />
                ) : state === 'error' ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        <CircleAlert aria-hidden="true" className="size-3.5" />
                        Lỗi tải
                    </span>
                ) : (
                    <span className="shrink-0 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                        {value ?? 0}
                    </span>
                )}
                {state === 'ready' ? (
                    <span className="text-xs font-medium text-zinc-500">
                        {value === 0
                            ? 'Không có yêu cầu chờ'
                            : 'Mở danh sách xử lý'}
                    </span>
                ) : state === 'error' ? (
                    <span className="text-xs text-red-700">
                        Thử cập nhật lại
                    </span>
                ) : null}
            </div>
        </Link>
    );
}
