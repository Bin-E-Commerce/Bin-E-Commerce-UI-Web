'use client';

import {
    ArrowLeft,
    Clock3,
    FilePenLine,
    Loader2,
    RefreshCw,
    Store,
} from 'lucide-react';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useShopProfileChangeRequest } from '../../hooks/useShopProfileChangeRequest';
import { formatChangeDate } from '../../utils/shop-profile-change-formatters';
import { ShopProfileChangeRequestStatusBadge } from '../ShopProfileChangeRequestStatusBadge';
import { ShopProfileChangeComparison } from './ShopProfileChangeComparison';
import { ShopProfileChangeReviewActions } from './ShopProfileChangeReviewActions';

interface ShopProfileChangeRequestDetailClientProps {
    requestId: string;
}

// Tải request theo URL và ghép khu vực đối chiếu với bảng quyết định dành cho admin.
export function ShopProfileChangeRequestDetailClient({
    requestId,
}: ShopProfileChangeRequestDetailClientProps) {
    const query = useShopProfileChangeRequest(requestId);

    if (query.isLoading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center rounded-md border border-zinc-200 bg-white text-sm text-zinc-500">
                <Loader2 className="mr-2 size-5 animate-spin" />
                Đang tải dữ liệu đối chiếu...
            </div>
        );
    }

    if (query.isError || !query.data) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-semibold">Không tải được yêu cầu thay đổi</p>
                <p className="mt-1 text-sm">
                    Yêu cầu không tồn tại, bạn không có quyền xem hoặc dịch vụ
                    đang tạm gián đoạn.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                        href="/admin/sellers/profile-changes"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <ArrowLeft className="size-4" />
                        Quay lại danh sách
                    </Link>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void query.refetch()}
                    >
                        <RefreshCw className="size-4" />
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    const request = query.data;

    return (
        <div className="space-y-5">
            <header className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <Link
                            href="/admin/sellers/profile-changes"
                            className={cn(
                                buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                }),
                                '-ml-3 mb-3',
                            )}
                        >
                            <ArrowLeft className="size-4" />
                            Danh sách yêu cầu
                        </Link>
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                                <FilePenLine className="size-5" />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold text-zinc-950">
                                        Đối chiếu thay đổi hồ sơ
                                    </h1>
                                    <ShopProfileChangeRequestStatusBadge
                                        status={request.status}
                                    />
                                </div>
                                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                    <Store className="size-4" />
                                    {request.shop.name} · {request.shop.slug}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                        <p className="flex items-center gap-2 font-medium text-zinc-900">
                            <Clock3 className="size-4" />
                            Gửi lúc {formatChangeDate(request.submittedAt)}
                        </p>
                        <p className="mt-1 text-xs">Mã yêu cầu: {request.id}</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                <ShopProfileChangeComparison request={request} />

                <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
                    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold text-zinc-950">
                            Lý do thay đổi
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                            {request.requestNote}
                        </p>
                    </section>

                    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold text-zinc-950">
                            Quyết định xử lý
                        </h2>
                        {request.status === 'pending_review' ? (
                            <>
                                <p className="mt-1 text-sm leading-6 text-zinc-500">
                                    Kiểm tra đầy đủ dữ liệu và giấy tờ trước khi
                                    áp dụng thay đổi.
                                </p>
                                <div className="mt-4">
                                    <ShopProfileChangeReviewActions
                                        requestId={request.id}
                                        shopName={request.shop.name}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                <ShopProfileChangeRequestStatusBadge
                                    status={request.status}
                                />
                                <p className="mt-3 text-sm leading-6 text-zinc-600">
                                    {request.reviewNote ||
                                        'Không có ghi chú từ người duyệt.'}
                                </p>
                                {request.reviewedAt ? (
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Xử lý lúc{' '}
                                        {formatChangeDate(request.reviewedAt)}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
}
