// Hero dùng chung cho các trang showcase; hỗ trợ giao diện sáng/tối và không sở hữu header điều hướng của cửa hàng.
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface ShowcaseFeatureHeaderProps {
    category?: string;
    title: string;
    description?: string;
    status?: string;
    variant?: 'dark' | 'light';
    density?: 'regular' | 'compact';
    asideContent?: ReactNode;
    showBackLink?: boolean;
}

// Gom điều hướng và giới thiệu vào hero; biến thể sáng gọn dùng nhãn tài liệu, cỡ chữ tiết chế và nét nối trang trí.
export function ShowcaseFeatureHeader({
    category,
    title,
    description,
    status,
    variant = 'dark',
    density = 'regular',
    asideContent,
    showBackLink = false,
}: ShowcaseFeatureHeaderProps) {
    const isLight = variant === 'light';
    const isCompactLight = isLight && density === 'compact';

    return (
        <header
            className={`${isCompactLight ? 'rounded-[1.5rem] px-5 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-6' : 'rounded-[1.75rem] px-5 py-5 sm:px-8 sm:py-7 lg:px-9 lg:py-8'} ${isLight ? 'border border-zinc-200 bg-white text-zinc-950 shadow-[0_16px_44px_-38px_rgba(24,24,27,0.45)]' : 'bg-zinc-950 text-white shadow-[0_20px_60px_-44px_rgba(0,0,0,0.65)]'}`}
        >
            <div
                className={`flex flex-wrap items-center gap-3 ${status && !isLight ? 'justify-between' : ''}`}
            >
                {showBackLink ? (
                    <Link
                        href="/showcase"
                        className={`inline-flex items-center gap-2 rounded-full border text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${isCompactLight ? 'min-h-8 bg-zinc-50 px-3' : 'min-h-9 px-3'} ${isLight ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-zinc-950' : 'border-white/15 text-zinc-300 hover:border-white/35 hover:text-white focus-visible:outline-white'}`}
                    >
                        <ArrowLeft aria-hidden="true" className="size-3.5" />
                        Tổng quan hệ thống
                    </Link>
                ) : null}

                {status ? (
                    <div
                        className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs sm:text-sm ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-white/15 bg-white/[0.05] text-zinc-300'}`}
                    >
                        <span
                            className={`size-1.5 shrink-0 rounded-full ${isLight ? 'bg-zinc-500' : 'bg-white'}`}
                            aria-hidden="true"
                        />
                        <span>{status}</span>
                    </div>
                ) : null}
            </div>

            <div
                className={`${isCompactLight ? 'mt-5 grid gap-4 sm:mt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.85fr)] lg:items-center lg:gap-8' : isLight ? 'mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:items-end lg:gap-10' : 'mt-6 max-w-4xl sm:mt-7'}`}
            >
                <div>
                    {category ? (
                        <p
                            className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}
                        >
                            {category}
                        </p>
                    ) : null}
                    <h2
                        className={` font-semibold tracking-[-0.04em] ${isCompactLight ? 'text-xl leading-tight sm:text-2xl lg:text-3xl' : 'text-2xl sm:text-2xl lg:text-2xl'} ${isLight ? 'text-zinc-950' : 'text-white'}`}
                    >
                        {title}
                    </h2>
                    {isCompactLight ? (
                        <div
                            aria-hidden="true"
                            className="mt-5 flex max-w-52 items-center gap-2"
                        >
                            <span className="size-2 rounded-full bg-zinc-950" />
                            <span className="h-px flex-1 bg-zinc-300" />
                            <span className="size-2 rounded-full border border-zinc-400 bg-white" />
                            <span className="h-px flex-1 bg-zinc-200" />
                            <span className="size-1.5 rounded-full bg-zinc-400" />
                        </div>
                    ) : null}
                </div>
                {isCompactLight ? (
                    <div className="max-w-2xl lg:border-l lg:border-zinc-200 lg:pl-6">
                        {asideContent ??
                            (description ? (
                                <p className="text-sm leading-6 text-zinc-600 sm:text-[15px]">
                                    {description}
                                </p>
                            ) : null)}
                    </div>
                ) : description ? (
                    <p
                        className={`${isLight ? 'max-w-2xl text-zinc-600 lg:border-l lg:border-zinc-200 lg:pl-6' : 'mt-3 max-w-3xl text-zinc-300'} text-sm leading-6 sm:text-base sm:leading-7`}
                    >
                        {description}
                    </p>
                ) : null}
            </div>
        </header>
    );
}
