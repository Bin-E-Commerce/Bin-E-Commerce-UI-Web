import { CheckCircle2, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { SellerApplicationStatus } from '@/services/seller';

interface SellerRegisterHeroProps {
    currentStep: number;
    isLastStep: boolean;
    totalSteps: number;
    applicationStatus: SellerApplicationStatus | null;
}

// Banner mở đầu chỉ giữ thông tin định hướng, tránh chiếm chỗ của form đăng ký chính bên dưới.
export function SellerRegisterHero({
    currentStep,
    isLastStep,
    totalSteps,
    applicationStatus,
}: SellerRegisterHeroProps) {
    const status = getSellerApplicationStatusView(applicationStatus, isLastStep);

    return (
        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
                <div>
                    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                        Đăng ký người bán
                    </div>

                    <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                        Hoàn thiện hồ sơ shop để bắt đầu bán hàng trên Bin.
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                        Điền thông tin theo từng bước ngay bên dưới. Hồ sơ đầy đủ
                        giúp quá trình duyệt nhanh hơn và hạn chế phải bổ sung lại.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    <div className="flex items-center gap-3 bg-zinc-950 p-4 text-white">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-white text-zinc-950">
                            <FileText className="size-5" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold">
                                {status.title}
                            </p>
                            <p className="text-xs text-zinc-300">
                                Bước {currentStep + 1} / {totalSteps}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 p-3 text-sm">
                        <StatusRow
                            label="Thông tin hiện tại"
                            value={status.progress}
                            highlight={isLastStep || status.highlight}
                        />
                        <StatusRow
                            label="Trạng thái"
                            value={status.label}
                            highlight={status.highlight}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

interface StatusRowProps {
    label: string;
    value: string;
    highlight?: boolean;
}

// Dòng trạng thái dùng độ tương phản cao hơn để người dùng nhìn ra tiến độ hồ sơ nhanh hơn.
function StatusRow({ label, value, highlight = false }: StatusRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2.5 ring-1 ring-zinc-100">
            <span className="text-zinc-500">{label}</span>
            <span
                className={cn(
                    'inline-flex items-center gap-1 font-semibold',
                    highlight ? 'text-zinc-950' : 'text-zinc-700',
                )}
            >
                {highlight ? <CheckCircle2 className="size-4" /> : null}
                {value}
            </span>
        </div>
    );
}

// Gom label trạng thái ở một nơi để hero không phải biết chi tiết enum backend đang được đặt tên thế nào.
function getSellerApplicationStatusView(
    status: SellerApplicationStatus | null,
    isLastStep: boolean,
) {
    if (status === 'pending_review') {
        return {
            title: 'Hồ sơ đang chờ duyệt',
            progress: 'Đã gửi đầy đủ',
            label: 'Chờ duyệt',
            highlight: true,
        };
    }

    if (status === 'approved') {
        return {
            title: 'Hồ sơ đã được duyệt',
            progress: 'Sẵn sàng bán hàng',
            label: 'Đã duyệt',
            highlight: true,
        };
    }

    if (status === 'rejected') {
        return {
            title: 'Hồ sơ cần bổ sung',
            progress: 'Đang chỉnh sửa',
            label: 'Cần cập nhật',
            highlight: false,
        };
    }

    return {
        title: 'Hồ sơ bản nháp',
        progress: isLastStep ? 'Sẵn sàng gửi' : 'Đang hoàn thiện',
        label: 'Chưa gửi duyệt',
        highlight: false,
    };
}
