// Component này giúp Seller nhận biết và cuộn nhanh tới các phần trong chi tiết đơn.
// Mục lục chỉ trỏ tới các section có trên trang; dữ liệu và thao tác vẫn thuộc từng card.

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    ClipboardList,
    CreditCard,
    MapPin,
    MessageSquareText,
    Package,
    RotateCcw,
    Truck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
    SellerOrderDetailSectionNavProps,
} from '../types/seller-order-detail-section-nav.types';

// Tạo các lối tắt theo nội dung trang hiện có để không dẫn Seller tới vùng trống.
export function SellerOrderDetailSectionNav({
    itemCount,
    paymentLabel,
    showShipment,
    showReview,
    showReturns,
}: SellerOrderDetailSectionNavProps) {
    // Chỉ tạo lối tắt khi card đích thật sự được trang chi tiết hiển thị.
    const sections = useMemo(
        () => [
            {
                id: 'order-progress',
                label: 'Lộ trình',
                detail: 'Trạng thái đơn',
                icon: ClipboardList,
            },
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
            ...(showShipment
                ? [
                      {
                          id: 'order-shipment',
                          label: 'Vận chuyển',
                          detail: 'Theo dõi đơn',
                          icon: Truck,
                      },
                  ]
                : []),
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
                          detail: 'Xem đánh giá sản phẩm',
                          icon: MessageSquareText,
                      },
                  ]
                : []),
            ...(showReturns
                ? [
                      {
                          id: 'order-returns',
                          label: 'Đổi trả',
                          detail: 'Có yêu cầu đổi trả',
                          icon: RotateCcw,
                      },
                  ]
                : []),
        ],
        [itemCount, paymentLabel, showShipment, showReview, showReturns],
    );
    const [activeSection, setActiveSection] = useState(
        sections[0]?.id ?? '',
    );

    // Theo dõi section gần đầu vùng nhìn để mục lục thể hiện đúng card Seller đang đọc.
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
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-100 via-white to-slate-100/70 p-3 shadow-sm sm:p-4"
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
                                // Cuộn trong trang để Seller giữ nguyên ngữ cảnh của đơn đang xử lý.
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
                                <span className="text-xs font-semibold">
                                    {section.label}
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
