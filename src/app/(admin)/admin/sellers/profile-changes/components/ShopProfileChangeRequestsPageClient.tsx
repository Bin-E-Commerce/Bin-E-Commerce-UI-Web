'use client';

import { Loader2, RefreshCw, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ShopProfileChangeRequestStatus } from '@/services/seller';
import { useShopProfileChangeRequests } from '../hooks/useShopProfileChangeRequests';
import {
    formatChangeDate,
    formatChangeSection,
} from '../utils/shop-profile-change-formatters';
import { ShopProfileChangeRequestStatusBadge } from './ShopProfileChangeRequestStatusBadge';

type StatusFilter = ShopProfileChangeRequestStatus | 'all';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
    { value: 'pending_review', label: 'Chờ duyệt' },
    { value: 'all', label: 'Tất cả' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
];

// Điều phối filter, phân trang và trạng thái tải cho hàng đợi thay đổi hồ sơ shop.
export function ShopProfileChangeRequestsPageClient() {
    const [status, setStatus] = useState<StatusFilter>('pending_review');
    const [page, setPage] = useState(1);
    const query = useShopProfileChangeRequests({ status, page, pageSize: 20 });

    // Đổi filter luôn quay về trang đầu để không rơi vào một page không còn dữ liệu.
    const handleStatusChange = (nextStatus: StatusFilter) => {
        setStatus(nextStatus);
        setPage(1);
    };

    return (
        <div className="space-y-5">
            <header className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                            Người bán
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-zinc-950">
                            Thay đổi hồ sơ shop
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                            Kiểm tra thay đổi thuế, tài khoản nhận tiền và định
                            danh trước khi áp dụng vào hồ sơ đang hoạt động.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={query.isFetching}
                        onClick={() => void query.refetch()}
                    >
                        {query.isFetching ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="size-4" />
                        )}
                        Làm mới
                    </Button>
                </div>
            </header>

            <section className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
                <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 p-4">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            className={cn(
                                'h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors',
                                status === filter.value
                                    ? 'border-zinc-950 bg-zinc-950 text-white'
                                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                            )}
                            onClick={() => handleStatusChange(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {query.isLoading ? (
                    <div className="flex min-h-64 items-center justify-center text-sm text-zinc-500">
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Đang tải yêu cầu thay đổi...
                    </div>
                ) : query.isError ? (
                    <div className="m-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        Không tải được danh sách yêu cầu. Vui lòng kiểm tra
                        quyền truy cập hoặc thử lại.
                    </div>
                ) : query.data?.items.length ? (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[820px] text-left">
                                <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-3">Shop</th>
                                        <th className="px-5 py-3">
                                            Nội dung đổi
                                        </th>
                                        <th className="px-5 py-3">
                                            Trạng thái
                                        </th>
                                        <th className="px-5 py-3">
                                            Thời gian gửi
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {query.data.items.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="hover:bg-zinc-50/70"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-zinc-950">
                                                    {request.shop.name}
                                                </p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {request.shop.slug}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {request.sections.map(
                                                        (section) => (
                                                            <span
                                                                key={section}
                                                                className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600"
                                                            >
                                                                {formatChangeSection(
                                                                    section,
                                                                )}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <ShopProfileChangeRequestStatusBadge
                                                    status={request.status}
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-sm text-zinc-600">
                                                {formatChangeDate(
                                                    request.submittedAt,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/admin/sellers/profile-changes/${request.id}`}
                                                    className={buttonVariants({
                                                        variant: 'outline',
                                                        size: 'sm',
                                                    })}
                                                >
                                                    Xem đối chiếu
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-zinc-200 md:hidden">
                            {query.data.items.map((request) => (
                                <article
                                    key={request.id}
                                    className="space-y-3 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-zinc-950">
                                                {request.shop.name}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {formatChangeDate(
                                                    request.submittedAt,
                                                )}
                                            </p>
                                        </div>
                                        <ShopProfileChangeRequestStatusBadge
                                            status={request.status}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {request.sections.map((section) => (
                                            <span
                                                key={section}
                                                className="rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-600"
                                            >
                                                {formatChangeSection(section)}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/admin/sellers/profile-changes/${request.id}`}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'outline',
                                            }),
                                            'w-full',
                                        )}
                                    >
                                        Xem đối chiếu
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                        <SearchX className="size-9 text-zinc-300" />
                        <p className="mt-3 font-semibold text-zinc-950">
                            Chưa có yêu cầu phù hợp
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Yêu cầu mới sẽ xuất hiện tại đây sau khi seller gửi
                            duyệt.
                        </p>
                    </div>
                )}

                {query.data && query.data.meta.totalPages > 1 ? (
                    <footer className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500">
                        <span>
                            Trang {query.data.meta.page}/
                            {query.data.meta.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                            >
                                Trước
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page >= query.data.meta.totalPages}
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                            >
                                Sau
                            </Button>
                        </div>
                    </footer>
                ) : null}
            </section>
        </div>
    );
}
