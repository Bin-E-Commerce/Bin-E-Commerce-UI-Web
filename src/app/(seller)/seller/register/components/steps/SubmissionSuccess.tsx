import { CheckCircle2, Clock3 } from 'lucide-react';

import type { SellerApplicationStatus } from '@/services/seller';

interface SubmissionSuccessProps {
    status: SellerApplicationStatus | null;
}

// Màn hình trạng thái dùng cả sau submit và sau refresh khi backend đã có hồ sơ đang chờ duyệt.
export function SubmissionSuccess({ status }: SubmissionSuccessProps) {
    const approved = status === 'approved';
    const Icon = approved ? CheckCircle2 : Clock3;

    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-950 text-white">
                <Icon className="size-7" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-zinc-950">
                {approved ? 'Hồ sơ đã được duyệt' : 'Hồ sơ đang chờ duyệt'}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                {approved
                    ? 'Shop của bạn đã được kích hoạt. Bạn có thể vào Seller Center để tiếp tục thiết lập vận hành.'
                    : 'Bin đã nhận hồ sơ đăng ký người bán của bạn. Chúng tôi sẽ gửi email xác nhận và thông báo tiếp khi hồ sơ được duyệt hoặc cần bổ sung thông tin.'}
            </p>
        </div>
    );
}
