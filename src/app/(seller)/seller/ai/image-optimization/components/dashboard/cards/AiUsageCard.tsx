// Hiển thị quota tối ưu ảnh theo đúng môi trường; component không tự suy đoán quota từ số job.

import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageOptimizationUsage } from '@/services/ai/types/image-optimization.types';

interface AiUsageCardProps {
    usage?: ImageOptimizationUsage;
    className?: string;
}

// Giữ trạng thái loading ngắn gọn và phân biệt rõ dev unlimited với production quota.
export function AiUsageCard({ usage, className }: AiUsageCardProps) {
    const isLimited = usage?.enabled === true && usage.limit !== null;
    const used = usage?.used ?? 0;
    const limit = usage?.limit ?? 0;
    const remaining = usage?.remaining ?? 0;
    const progress = isLimited
        ? Math.min(100, (used / Math.max(1, limit)) * 100)
        : 0;
    const exhausted = isLimited && remaining <= 0;

    return (
        <section
            className={cn(
                'rounded-xl border border-zinc-200 bg-white p-3 shadow-sm',
                className,
            )}
            aria-live="polite"
        >
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center text-zinc-950">
                        <Gauge className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="whitespace-nowrap text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-zinc-500">
                            Lượt tối ưu AI
                        </p>
                        {usage ? (
                            isLimited ? (
                                <p className="mt-1 text-sm font-semibold text-zinc-950">
                                    Đã dùng {used}/{limit} lượt
                                </p>
                            ) : (
                                <p className="mt-1 text-sm font-semibold text-zinc-950">
                                    Không giới hạn ở chế độ dev
                                </p>
                            )
                        ) : (
                            <p className="mt-1 text-sm text-zinc-500">
                                Đang tải quota...
                            </p>
                        )}
                    </div>
                </div>
                {isLimited ? (
                    <span
                        className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${exhausted ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}
                    >
                        Còn {remaining} lượt
                    </span>
                ) : null}
            </div>
            {isLimited ? (
                <div className="mt-4">
                    <div
                        className="h-2 overflow-hidden rounded-full bg-zinc-100"
                        aria-hidden="true"
                    >
                        <div
                            className={`h-full rounded-full transition-all ${exhausted ? 'bg-red-500' : 'bg-zinc-950'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p
                        className={`mt-2 text-xs ${exhausted ? 'text-red-700' : 'text-zinc-500'}`}
                    >
                        {exhausted
                            ? 'Bạn đã dùng hết quota trong cửa sổ hiện tại. Vui lòng thử lại sau.'
                            : 'Quota được tính theo từng tài khoản trong cửa sổ hiện tại.'}
                    </p>
                </div>
            ) : null}
        </section>
    );
}
