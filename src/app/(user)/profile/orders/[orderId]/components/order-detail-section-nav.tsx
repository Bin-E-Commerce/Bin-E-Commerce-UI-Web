// Component này giúp khách nhận biết và nhảy nhanh giữa các phần của trang chi tiết đơn hàng.
// Component chỉ điều hướng tới id có sẵn trong trang, không sở hữu dữ liệu hay trạng thái nghiệp vụ của đơn.
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    ClipboardList,
    CreditCard,
    MapPin,
    MessageSquareText,
    Package,
    PackageCheck,
    RotateCcw,
    Truck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { OrderDetailSectionNavProps } from '../types/order-detail-section-nav.types';

// Xây mục lục theo phần đang hiện diện và đặt slot thao tác bên phải trên màn rộng.
// Trên màn hẹp, các tab vẫn cuộn ngang còn hành động xuống dòng riêng để không bị cắt.
export function OrderDetailSectionNav({
    itemCount,
    paymentLabel,
    customerActionLabel,
    customerActionNeedsAttention,
    showReview,
    showReturns,
    actions,
}: OrderDetailSectionNavProps) {
    const sections = useMemo(
        () => [
            {
                id: 'order-progress',
                label: 'Lộ trình',
                detail: 'Trạng thái đơn',
                icon: ClipboardList,
            },
            // Giữ mục lục khớp với hành động thực tế: đơn đã hoàn tất chuyển nhãn sang yêu cầu trả hàng.
            ...(customerActionLabel
                ? [
                      {
                          id: 'order-delivery-confirmation',
                          label: customerActionLabel,
                          detail: customerActionNeedsAttention
                              ? 'Cần chú ý'
                              : 'Còn thời hạn',
                          icon: PackageCheck,
                          needsAction: customerActionNeedsAttention,
                      },
                  ]
                : []),
            {
                id: 'order-products',
                label: 'Sản phẩm',
                detail: `${itemCount} mặt hàng`,
                icon: Package,
            },
            {
                id: 'order-address',
                label: 'Địa chỉ nhận',
                detail: 'Thông tin nhận hàng',
                icon: MapPin,
            },
            {
                id: 'order-shipment',
                label: 'Vận chuyển',
                detail: 'Theo dõi đơn',
                icon: Truck,
            },
            {
                id: 'order-payment',
                label: 'Thanh toán',
                detail: paymentLabel,
                icon: CreditCard,
            },
            ...(showReview
                ? [
                      {
                          id: 'order-review',
                          label: 'Đánh giá',
                          detail: 'Chia sẻ trải nghiệm',
                          icon: MessageSquareText,
                      },
                  ]
                : []),
            ...(showReturns
                ? [
                      {
                          id: 'order-returns',
                          label: 'Đổi trả',
                          detail: 'Yêu cầu hoàn hàng',
                          icon: RotateCcw,
                      },
                  ]
                : []),
        ],
        [
            itemCount,
            paymentLabel,
            customerActionLabel,
            customerActionNeedsAttention,
            showReview,
            showReturns,
        ],
    );
    const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

    // Theo dõi phần đang nằm trong vùng đọc để mục lục phản hồi khi khách cuộn thủ công.
    useEffect(() => {
        const elements = sections
            .map((section) => document.getElementById(section.id))
            .filter((element): element is HTMLElement => element !== null);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (first, second) =>
                            first.boundingClientRect.top -
                            second.boundingClientRect.top,
                    )[0];
                if (visibleEntry) setActiveSection(visibleEntry.target.id);
            },
            { rootMargin: '-18% 0px -68% 0px', threshold: 0 },
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [sections]);

    return (
        <nav
            aria-label="Mục lục đơn hàng"
            className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-white p-3 shadow-sm sm:p-4"
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] lg:min-w-0 lg:flex-1">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <Button
                                key={section.id}
                                type="button"
                                variant="ghost"
                                aria-current={isActive ? 'location' : undefined}
                                onClick={() => {
                                    // Dùng cuộn nội trang thay vì thay URL để giữ nguyên ngữ cảnh đơn hàng.
                                    document
                                        .getElementById(section.id)
                                        ?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        });
                                    setActiveSection(section.id);
                                }}
                                className={`group h-auto min-w-max justify-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${isActive ? 'border-zinc-950 bg-zinc-950 text-white shadow-md shadow-zinc-900/15 hover:bg-zinc-800 hover:text-white' : 'border-zinc-200 bg-white/90 text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-white'}`}
                            >
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-white/10 text-zinc-100' : 'bg-zinc-100 text-zinc-700'}`}
                                >
                                    <Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="flex flex-col items-start gap-0.5">
                                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                                        {section.label}
                                        {'needsAction' in section &&
                                        section.needsAction ? (
                                            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold leading-none text-zinc-800">
                                                Cần chú ý
                                            </span>
                                        ) : null}
                                    </span>
                                    <span
                                        className={`text-[10px] ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}
                                    >
                                        {section.detail}
                                    </span>
                                </span>
                            </Button>
                        );
                    })}
                </div>
                {actions ? (
                    <div className="flex shrink-0 items-center justify-end border-t border-zinc-100 pt-3 lg:border-l lg:border-t-0 lg:border-zinc-200 lg:pl-3 lg:pt-0">
                        {actions}
                    </div>
                ) : null}
            </div>
        </nav>
    );
}
