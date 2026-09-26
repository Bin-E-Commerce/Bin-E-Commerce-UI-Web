// Popup thông báo API/EC2 không phản hồi; component chỉ render trạng thái từ provider.
// Không tự kiểm tra server hoặc quản lý request để tránh trộn UI với hạ tầng theo dõi.

'use client';

import Image from 'next/image';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Headset,
    RefreshCw,
    Server,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { InfrastructureNoticeReason } from '../monitor/infrastructure-status.monitor';

interface InfrastructureStatusDialogProps {
    open: boolean;
    reason: InfrastructureNoticeReason | null;
    onRetry: () => void;
}

// Mở đúng kênh Zalo trong tab mới từ thao tác click của người dùng, đồng thời chặn tab mới truy cập opener.
function openZaloContact(): void {
    window.open('https://zalo.me/0353707544', '_blank', 'noopener,noreferrer');
}

// Render popup ưu tiên cao theo từng khối thông tin để người dùng nhanh chóng hiểu trạng thái,
// biết cần làm gì tiếp theo và tìm được kênh hỗ trợ mà không phải đọc một đoạn văn dài.
export function InfrastructureStatusDialog({
    open,
    reason,
    onRetry,
}: InfrastructureStatusDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={() => undefined}>
            <AlertDialogContent
                overlayClassName="bg-zinc-950/35 backdrop-blur-sm"
                className="w-[calc(100%-2rem)] max-w-[42rem] gap-0 overflow-hidden rounded-[28px] border-zinc-200 bg-white p-0 shadow-[0_28px_90px_-30px_rgba(24,24,27,0.35)]"
            >
                <div className="space-y-6 px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
                    <AlertDialogHeader className="gap-5 text-left">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm sm:size-14">
                                <AlertTriangle
                                    aria-hidden="true"
                                    className="size-5 sm:size-6"
                                />
                            </div>
                            <div className="min-w-0 space-y-2">
                                <AlertDialogTitle className="text-xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-2xl">
                                    Hệ thống tạm thời gián đoạn
                                </AlertDialogTitle>
                                <AlertDialogDescription className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-[15px]">
                                    Máy chủ{' '}
                                    <strong className="font-bold text-zinc-950">
                                        AWS EC2
                                    </strong>{' '}
                                    chỉ bật trong giờ hành chính để tối ưu chi
                                    phí.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <div className="mb-3 flex items-center gap-2 text-zinc-500">
                                <Server aria-hidden="true" className="size-4" />
                                <span className="text-xs font-bold uppercase tracking-[0.12em]">
                                    Trạng thái máy chủ
                                </span>
                            </div>
                            <p className="font-bold text-zinc-950">
                                {reason === 'request-pending'
                                    ? 'AWS EC2 đang khởi động'
                                    : 'AWS EC2 chưa sẵn sàng'}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-zinc-600">
                                Dự án đang chạy trên máy chủ AWS EC2. Hệ thống
                                sẽ hoạt động lại khi máy chủ sẵn sàng.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <div className="mb-3 flex items-center gap-2 text-zinc-500">
                                <Clock3 aria-hidden="true" className="size-4" />
                                <span className="text-xs font-bold uppercase tracking-[0.12em]">
                                    Lịch bật máy chủ
                                </span>
                            </div>
                            <p className="font-bold text-zinc-950">
                                Thứ 2–Thứ 6: 09:00–18:00
                            </p>
                            <p className="mt-1 text-sm leading-5 text-zinc-600">
                                Thứ 7: 09:00–12:00 · Chủ nhật tạm dừng
                            </p>
                            <p className="mt-2 text-xs font-semibold text-zinc-500">
                                Theo giờ Việt Nam (UTC+7)
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-2">
                            <CheckCircle2
                                aria-hidden="true"
                                className="size-4 text-zinc-900"
                            />
                            <p className="font-bold text-zinc-950">
                                Vì sao hệ thống tạm thời không phản hồi?
                            </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            Để tiết kiệm chi phí vận hành, máy chủ AWS EC2 chỉ
                            được bật trong khung giờ hành chính ở trên. Ngoài
                            thời gian này, máy chủ có thể được tạm dừng. Nhấn{' '}
                            <strong className="font-bold text-zinc-950">
                                Thử lại
                            </strong>{' '}
                            để kiểm tra khi máy chủ đã sẵn sàng hoặc liên hệ đội
                            ngũ hỗ trợ qua{' '}
                            <strong className="font-bold text-zinc-950">
                                Zalo 0353 705 754
                            </strong>
                            .
                        </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-zinc-950 px-4 py-4 text-white sm:px-5">
                        <Headset
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-zinc-300"
                        />
                        <p className="text-sm leading-6 text-zinc-300">
                            Cần hỗ trợ nhanh? Hãy nhấn{' '}
                            <strong className="font-bold text-white">
                                Liên hệ Zalo
                            </strong>{' '}
                            để được kiểm tra tình trạng hệ thống.
                        </p>
                    </div>
                </div>

                <AlertDialogFooter className="flex-col gap-2 border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-xl border-zinc-200 bg-white px-5 font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 sm:w-auto"
                        onClick={onRetry}
                    >
                        <RefreshCw aria-hidden="true" className="size-4" />
                        Thử lại
                    </Button>
                    <Button
                        type="button"
                        className="h-11 w-full rounded-xl bg-zinc-950 px-5 font-semibold text-white hover:bg-zinc-800 sm:w-auto"
                        onClick={openZaloContact}
                    >
                        <Image
                            src="/images/icon/zalo.svg"
                            alt="Zalo"
                            width={20}
                            height={20}
                        />
                        Liên hệ Zalo
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
