// Nút điều hướng tới phần giải thích logic; sở hữu hiệu ứng cuộn và highlight ở phía client.
'use client';

import { ArrowDownRight } from 'lucide-react';
import { handleShowcaseAnchorNavigation } from '../../utils/handleShowcaseAnchorNavigation';

interface ShowcaseLogicLinkProps {
    href: string;
}

// Giữ hành vi tương tác trong Client Component để các flow tài liệu vẫn có thể là Server Component.
export function ShowcaseLogicLink({ href }: ShowcaseLogicLinkProps) {
    return (
        <a href={href} aria-controls={href.slice(1)} onClick={handleShowcaseAnchorNavigation} className="group inline-flex min-h-6 shrink-0 items-center gap-1 text-[10px] font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-zinc-500">
            <span>Xem logic</span>
            <ArrowDownRight aria-hidden="true" className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
        </a>
    );
}
