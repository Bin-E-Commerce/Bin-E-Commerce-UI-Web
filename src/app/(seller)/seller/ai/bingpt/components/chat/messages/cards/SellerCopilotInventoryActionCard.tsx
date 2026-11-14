// Card preview cho tác vụ tồn kho; cho phép xác minh lại proposal processing mà không tạo action mới.
'use client';

import {
    AlertTriangle,
    Check,
    Clock3,
    LoaderCircle,
    Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SellerCopilotInventoryActionCardProps } from '../../../../types/chat/answer-components.types';

// Tách preview khỏi câu trả lời; pending cần xác nhận, còn processing cho seller đối soát lại cùng một proposal.
export function SellerCopilotInventoryActionCard({
    proposal,
    onConfirm,
}: SellerCopilotInventoryActionCardProps) {
    const isConfirmable =
        proposal.status === 'pending' || proposal.status === 'processing';
    const statusLabel = {
        pending: 'Chờ xác nhận',
        processing: 'Cần xác minh kết quả',
        completed: 'Đã cập nhật',
        failed: 'Không cập nhật được',
        expired: 'Đề xuất đã hết hạn',
    }[proposal.status];

    return (
        <section className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium text-zinc-900">
                    <Package className="size-4 text-indigo-700" />
                    Xem trước thay đổi tồn kho
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-zinc-600">
                    {statusLabel}
                </span>
            </div>
            <p className="mt-3 font-medium text-zinc-900">
                {proposal.productName} · {proposal.variantName}
            </p>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-indigo-100 bg-white px-3 py-2.5">
                <div>
                    <p className="text-xs text-zinc-500">
                        Tồn khả dụng hiện tại
                    </p>
                    <p className="mt-0.5 font-semibold tabular-nums">
                        {proposal.currentAvailable}
                    </p>
                </div>
                <span aria-hidden="true" className="text-zinc-400">
                    →
                </span>
                <div>
                    <p className="text-xs text-zinc-500">Sau khi cập nhật</p>
                    <p className="mt-0.5 font-semibold tabular-nums">
                        {proposal.nextAvailable}
                    </p>
                </div>
            </div>
            {proposal.resultMessage ? (
                <p className="mt-3 flex items-start gap-2 text-xs text-zinc-700">
                    {proposal.status === 'completed' ? (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
                    ) : (
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-700" />
                    )}
                    {proposal.resultMessage}
                </p>
            ) : proposal.status === 'processing' ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
                    <Clock3 className="size-3.5" />
                    Lượt xác nhận trước bị gián đoạn. Bấm “Kiểm tra lại” để đối
                    soát kết quả.
                </p>
            ) : isConfirmable ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock3 className="size-3.5" />
                    Đề xuất hết hạn lúc{' '}
                    {new Date(proposal.expiresAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    . Chỉ cập nhật khi bạn xác nhận.
                </p>
            ) : null}
            {isConfirmable ? (
                <div className="mt-3 flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        onClick={onConfirm}
                        disabled={proposal.isConfirming}
                    >
                        {proposal.isConfirming ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : proposal.status === 'processing' ? (
                            'Kiểm tra lại'
                        ) : (
                            'Xác nhận cập nhật tồn'
                        )}
                    </Button>
                </div>
            ) : null}
        </section>
    );
}
