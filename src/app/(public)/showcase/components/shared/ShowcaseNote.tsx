// Callout trung tính cho giới hạn, trạng thái cấu hình hoặc quy tắc an toàn quan trọng.
import { Info } from 'lucide-react';

interface ShowcaseNoteProps {
    title: string;
    children: React.ReactNode;
    tone?: 'light' | 'dark' | 'white';
    compact?: boolean;
}

// Dùng cấu trúc chữ và độ tương phản để phân biệt ghi chú, không dựa vào màu trạng thái ngoài hệ màu dự án.
export function ShowcaseNote({
    title,
    children,
    tone = 'light',
    compact = false,
}: ShowcaseNoteProps) {
    const dark = tone === 'dark';
    const white = tone === 'white';

    return (
        <aside
            className={`flex gap-3 border ${compact ? 'rounded-xl p-3' : 'rounded-2xl p-4 sm:p-5'} ${
                dark
                    ? 'border-white/15 bg-white/[0.06] text-zinc-200'
                    : white
                      ? 'border-zinc-200 bg-white text-zinc-700'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700'
            }`}
        >
            <Info
                aria-hidden="true"
                className={`mt-0.5 ${compact ? 'size-3.5' : 'size-4'} shrink-0 ${dark ? 'text-white' : 'text-zinc-700'}`}
            />
            <div>
                <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold ${dark ? 'text-white' : 'text-zinc-950'}`}>
                    {title}
                </p>
                <div className={`${compact ? 'mt-1 text-xs leading-5' : 'mt-1 text-sm leading-6'}`}>{children}</div>
            </div>
        </aside>
    );
}
