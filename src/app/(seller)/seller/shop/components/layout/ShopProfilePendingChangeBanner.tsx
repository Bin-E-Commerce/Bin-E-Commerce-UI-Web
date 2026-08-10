import { Clock3, FileCheck2 } from 'lucide-react';

import type {
    ShopProfileChangeRequestDto,
    ShopProfileChangeSection,
} from '@/services/seller';

interface ShopProfilePendingChangeBannerProps {
    request: ShopProfileChangeRequestDto;
}

const SECTION_LABELS: Record<ShopProfileChangeSection, string> = {
    tax: 'Thông tin thuế',
    payout: 'Tài khoản nhận tiền',
    identity: 'Thông tin định danh',
};

// Hiển thị request đang chờ để seller hiểu dữ liệu cũ vẫn có hiệu lực và không gửi trùng yêu cầu.
export function ShopProfilePendingChangeBanner({
    request,
}: ShopProfilePendingChangeBannerProps) {
    return (
        <section className="mx-5 mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 sm:mx-7">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-amber-700 ring-1 ring-amber-200">
                    <Clock3 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-950">
                                Yêu cầu thay đổi đang chờ duyệt
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-zinc-600">
                                Thông tin đã xác minh hiện tại vẫn được sử dụng
                                cho đến khi yêu cầu được chấp thuận.
                            </p>
                        </div>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800">
                            <FileCheck2 className="size-3.5" />
                            Đang kiểm tra
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {request.sections.map((section) => (
                            <span
                                key={section}
                                className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700"
                            >
                                {SECTION_LABELS[section]}
                            </span>
                        ))}
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                        Đã gửi lúc{' '}
                        {new Intl.DateTimeFormat('vi-VN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        }).format(new Date(request.submittedAt))}
                    </p>
                </div>
            </div>
        </section>
    );
}
