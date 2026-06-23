'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, X } from 'lucide-react';

// Thanh thông báo chỉ giữ nội dung mua sắm để header chính không bị lẫn với luồng đăng ký seller.
export function AnnouncementBar() {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="bg-zinc-950 text-xs text-zinc-300">
            <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link
                    href="/support"
                    className="hidden items-center gap-1.5 transition-colors hover:text-white md:inline-flex"
                >
                    <HelpCircle className="size-3.5" />
                    Hỗ trợ
                </Link>

                <div className="min-w-0 flex-1 text-center">
                    <span className="truncate">
                        Flash Sale - Giảm đến 50% hôm nay
                        <span className="mx-2 text-zinc-600">|</span>
                        <Link
                            href="/flash-sale"
                            className="font-semibold text-white underline underline-offset-2 transition-colors hover:text-zinc-300"
                        >
                            Mua ngay
                        </Link>
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="rounded p-0.5 text-zinc-400 transition-colors hover:text-white"
                    aria-label="Đóng thông báo"
                >
                    <X className="size-3.5" />
                </button>
            </div>
        </div>
    );
}
