'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function AnnouncementBar() {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="relative flex items-center justify-center bg-zinc-950 px-10 py-2 text-xs text-zinc-300">
            <span>
                Flash Sale — Giảm đến 50% hôm nay&nbsp;&nbsp;·&nbsp;&nbsp;
                <Link
                    href="/flash-sale"
                    className="cursor-pointer font-semibold text-white underline underline-offset-2 hover:text-zinc-300 transition-colors"
                >
                    Mua ngay
                </Link>
            </span>
            <button
                onClick={() => setVisible(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-zinc-400 hover:text-white transition-colors"
                aria-label="Đóng thông báo"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
