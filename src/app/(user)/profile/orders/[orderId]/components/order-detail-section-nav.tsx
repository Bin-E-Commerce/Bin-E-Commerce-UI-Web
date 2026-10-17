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

// Xây mục lục theo những phần đang hiện diện để không tạo lối tắt dẫn tới nội dung bị ẩn.
export function OrderDetailSectionNav({
    itemCount,
    paymentLabel,
    showDeliveryConfirmation,
    showReview,
    showReturns,
}: OrderDetailSectionNavProps) {
    const sections = useMemo(
        () => [
            {
                id: 'order-progress',
                label: 'Lộ trình',
                detail: 'Trạng thái đơn',
                icon: ClipboardList,
            },
            ...(showDeliveryConfirmation
                ? [
                      {
                          id: 'order-delivery-confirmation',
                          label: 'Xác nhận nhận hàng',
                          detail: 'Cần chú ý',
                          icon: PackageCheck,
                          needsAction: true,
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
            showDeliveryConfirmation,
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
            className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-100 via-white to-slate-100/70 p-3 shadow-sm sm:p-4"
        >
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] lg:flex-wrap lg:overflow-visible">
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
                            className={`group h-auto min-w-max justify-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${isActive ? 'border-[#26364b] bg-gradient-to-r from-[#11151d] via-[#192332] to-[#26364b] text-white shadow-md shadow-slate-900/20 hover:from-[#192332] hover:to-[#30445e] hover:text-white' : 'border-white/90 bg-white/80 text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-white'}`}
                        >
                            <span
                                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-white/10 text-zinc-100' : 'bg-gradient-to-br from-zinc-100 to-slate-100 text-zinc-700'}`}
                            >
                                <Icon className="size-4" aria-hidden="true" />
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
                                    className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}
                                >
                                    {section.detail}
                                </span>
                            </span>
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}
