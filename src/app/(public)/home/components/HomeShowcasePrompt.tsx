'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const HOME_SHOWCASE_PROMPT_KEY = 'bin-home-showcase-prompt-date';

// Lấy ngày theo múi giờ của trình duyệt để lời nhắc chỉ xuất hiện một lần trong mỗi ngày người dùng trải nghiệm homepage.
function getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Đọc localStorage an toàn vì chế độ riêng tư hoặc chính sách trình duyệt có thể chặn storage mà không nên làm hỏng homepage.
function shouldShowShowcasePrompt() {
    try {
        return (
            window.localStorage.getItem(HOME_SHOWCASE_PROMPT_KEY) !==
            getTodayKey()
        );
    } catch {
        return false;
    }
}

// Ghi nhận khi popup thực sự mở để React Strict Mode không đánh dấu đã xem trước khi người dùng nhìn thấy modal.
function markShowcasePromptAsSeen() {
    try {
        window.localStorage.setItem(HOME_SHOWCASE_PROMPT_KEY, getTodayKey());
    } catch {
        // Không có storage thì vẫn giữ trải nghiệm hiện tại, không chặn người dùng vào homepage.
    }
}

// Mời người dùng khám phá phần giới thiệu hệ thống mà không chen vào SSR; state chỉ tồn tại ở client và không gọi API.
export function HomeShowcasePrompt() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!shouldShowShowcasePrompt()) return;

        const openTimer = window.setTimeout(() => {
            markShowcasePromptAsSeen();
            setOpen(true);
        }, 0);

        return () => window.clearTimeout(openTimer);
    }, []);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent
                overlayClassName="bg-zinc-950/20 backdrop-blur-md"
                className="max-w-[34rem] overflow-hidden rounded-[28px] border-zinc-300 bg-white p-0 shadow-[0_28px_90px_-30px_rgba(24,24,27,0.28)] gap-0"
            >
                <div className="overflow-hidden bg-white px-6 pb-2 pt-6 text-zinc-950 sm:px-8 sm:pb-3 sm:pt-7">
                    <AlertDialogHeader className="gap-5 text-left">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/logo/logo_no_background.png"
                                alt="Bin E-Commerce"
                                width={112}
                                height={36}
                                className="h-9 w-auto object-contain object-left"
                            />
                            <div className="border-l border-zinc-200 pl-3">
                                <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-950">
                                    System tour
                                </span>
                                <span className="mt-1 block text-[11px] text-zinc-500">
                                    Tổng quan hệ thống
                                </span>
                            </div>
                        </div>
                        <div>
                            <AlertDialogTitle className="max-w-lg text-2xl leading-[1.12] tracking-tight text-zinc-950 sm:text-[2rem]">
                                Bạn muốn xem những tính năng nổi bật của hệ
                                thống?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                                Một góc nhìn khác đang chờ bạn, nơi những trải
                                nghiệm quen thuộc được giải thích từ phía sau hệ
                                thống.
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <div
                        aria-hidden="true"
                        className="mx-1 mt-3 h-px bg-zinc-200 sm:mt-4"
                    />
                </div>

                <div className="px-5 pb-4 pt-1 sm:px-8 sm:pb-5 sm:pt-2">
                    <AlertDialogFooter className="gap-2 sm:flex-row sm:justify-between">
                        <AlertDialogCancel className="order-2 mt-0 min-h-11 rounded-xl border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 sm:order-1">
                            Ở lại trang chủ
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => router.push('/showcase')}
                            className="order-1 min-h-11 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 sm:order-2"
                        >
                            Xem ngay
                            <ArrowRight
                                aria-hidden="true"
                                className="size-3.5"
                            />
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
