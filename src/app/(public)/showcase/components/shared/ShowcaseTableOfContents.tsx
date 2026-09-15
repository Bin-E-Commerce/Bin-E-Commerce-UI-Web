// Mục lục phân cấp dùng chung cho mọi showcase; component chỉ quản lý hiển thị, active anchor và menu mobile.
"use client";

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ListTree } from 'lucide-react';
import { handleShowcaseAnchorNavigation } from '../../utils/handleShowcaseAnchorNavigation';
import type { ShowcaseTocItem } from '../../types/showcase.types';

type ShowcaseTableOfContentsProps = {
    variant: 'desktop' | 'mobile';
    items: ShowcaseTocItem[];
};

type TableOfContentsLinkProps = {
    item: ShowcaseTocItem;
    level: number;
    activeId: string;
};

type TableOfContentsNavigationProps = {
    items: ShowcaseTocItem[];
    activeId: string;
    navRef: RefObject<HTMLElement | null>;
    variant: 'desktop' | 'mobile';
};

// Chuyển cấp sâu của cây mục lục thành độ lớn chữ tương ứng để người đọc nhận ra quan hệ cha-con ngay khi quét nhanh.
function getLevelClassName(level: number) {
    if (level === 0) return 'text-xs font-semibold';
    if (level === 1) return 'text-xs';
    if (level === 2) return 'text-[11px]';
    return 'text-[10px]';
}

// Giữ mỗi mục thành anchor thật để bàn phím, URL hash và thao tác cuộn đều dùng cùng một contract.
function TableOfContentsLink({ item, level, activeId }: TableOfContentsLinkProps) {
    const isActive = activeId === item.id;

    return (
        <a
            href={`#${item.id}`}
            data-toc-target={item.id}
            aria-current={isActive ? 'location' : undefined}
            onClick={handleShowcaseAnchorNavigation}
            className={`-ml-px block rounded-r-md border-l-2 px-3 py-1.5 leading-[1.45] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500 ${getLevelClassName(level)} ${isActive ? 'border-zinc-950 bg-zinc-100 text-zinc-950' : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
        >
            {item.label}
        </a>
    );
}

// Render đệ quy cây mục lục thành các nhánh có đường kẻ; dữ liệu của từng feature được truyền từ trang sở hữu nội dung.
function TableOfContentsItems({ items, activeId, level }: { items: ShowcaseTocItem[]; activeId: string; level: number }): ReactNode {
    return items.map((item) => (
        <li key={item.id} className={level === 0 ? 'pt-1' : undefined}>
            <TableOfContentsLink item={item} level={level} activeId={activeId} />
            {item.children?.length ? (
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-zinc-200 pl-2">
                    <TableOfContentsItems items={item.children} activeId={activeId} level={level + 1} />
                </ul>
            ) : null}
        </li>
    ));
}

// Render cùng một cây phân cấp cho desktop/mobile; anchor ID luôn được feature truyền vào và không bị component tự suy đoán.
function TableOfContentsNavigation({ items, activeId, navRef, variant }: TableOfContentsNavigationProps) {
    return (
        <nav
            ref={navRef}
            aria-label="Mục lục trang"
            className={`mt-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#a1a1aa_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 ${variant === 'desktop' ? 'max-h-[calc(100vh-13rem)]' : 'max-h-[calc(100vh-11rem)]'}`}
        >
            <ul className="space-y-1">
                <TableOfContentsItems items={items} activeId={activeId} level={0} />
            </ul>
        </nav>
    );
}

// Theo dõi vị trí đọc để làm nổi bật mục hiện tại; desktop dùng sidebar sticky còn mobile dùng disclosure tiết kiệm chiều cao.
// Đặt đường quay về showcase trong cùng khu vực điều hướng để tài liệu dài luôn giữ được lối ra rõ ràng.
function ShowcaseBackLink() {
    return (
        <Link
            href="/showcase"
            className="mb-3 flex min-h-8 w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-xs text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
        >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Tổng quan hệ thống
        </Link>
    );
}

export function ShowcaseTableOfContents({ variant, items }: ShowcaseTableOfContentsProps) {
    const firstItemId = items[0]?.id ?? '';
    const [activeId, setActiveId] = useState(firstItemId);
    const navRef = useRef<HTMLElement>(null);
    const mobileDetailsRef = useRef<HTMLDetailsElement>(null);

    // Gom scroll/resize vào một animation frame và bỏ qua anchor đang bị ẩn bởi disclosure để active state không nhảy sai.
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-toc-target]'));
        let animationFrame = 0;
        const updateActiveItem = () => {
            animationFrame = 0;
            const visibleTargets = links.flatMap((link) => {
                const targetId = link.dataset.tocTarget;
                const target = targetId ? document.getElementById(targetId) : null;
                if (!target || target.getClientRects().length === 0) return [];
                return [{ id: targetId!, top: target.getBoundingClientRect().top }];
            });
            const activationLine = Math.min(200, Math.max(112, window.innerHeight * 0.22));
            const passedTarget = visibleTargets.filter((target) => target.top <= activationLine).at(-1);
            const nextActiveId = passedTarget?.id ?? visibleTargets[0]?.id;
            if (nextActiveId) setActiveId((currentId) => currentId === nextActiveId ? currentId : nextActiveId);
        };

        // Một frame cho nhiều sự kiện giúp TOC mượt hơn khi người đọc cuộn nhanh hoặc mở nhiều disclosure liên tiếp.
        const scheduleUpdate = () => {
            if (animationFrame) return;
            animationFrame = window.requestAnimationFrame(updateActiveItem);
        };
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);
        document.addEventListener('toggle', scheduleUpdate, true);
        scheduleUpdate();

        return () => {
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
            document.removeEventListener('toggle', scheduleUpdate, true);
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
        };
    }, [items]);

    // Cập nhật active state ngay lập tức và đóng menu mobile sau khi người dùng chọn anchor để giữ lại không gian đọc.
    const handleTableOfContentsClick = (event: MouseEvent<HTMLDivElement>) => {
        const clickedElement = event.target;
        const link = clickedElement instanceof Element ? clickedElement.closest<HTMLAnchorElement>('[data-toc-target]') : null;
        if (!link) return;
        const targetId = link.dataset.tocTarget;
        if (targetId) setActiveId(targetId);
        mobileDetailsRef.current?.removeAttribute('open');
    };

    const navigation = <TableOfContentsNavigation items={items} activeId={activeId} navRef={navRef} variant={variant} />;

    if (variant === 'mobile') {
        return (
            <details ref={mobileDetailsRef} className="group rounded-2xl border border-zinc-200 bg-white p-3 xl:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-zinc-800 [&::-webkit-details-marker]:hidden">
                    <ListTree aria-hidden="true" className="size-4 text-zinc-500" />
                    Mục lục trang
                    <ChevronDown aria-hidden="true" className="ml-auto size-4 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <div onClick={handleTableOfContentsClick}>
                    <ShowcaseBackLink />
                    {navigation}
                </div>
            </details>
        );
    }

    return (
        <aside className="sticky top-24 hidden min-w-0 self-start xl:block" aria-label="Mục lục trang">
            <div className="max-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <ShowcaseBackLink />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Trên trang này</p>
                {navigation}
            </div>
        </aside>
    );
}
