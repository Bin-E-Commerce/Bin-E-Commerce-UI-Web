// Trang cấu hình GHN Test, điều phối dữ liệu và bố cục hai vùng cân đối cho Seller.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CircleAlert, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getShippingSettings, updateShippingSettings } from '@/services/seller';
import { ShippingProviderConnectionCard } from './components/ShippingProviderConnectionCard';
import { ShippingProviderSettingsPanel } from '../settings/components/ShippingProviderSettingsPanel';
import { ShippingProviderWorkflowCard } from './components/ShippingProviderWorkflowCard';

// Chuẩn hóa time PostgreSQL về nhãn HH:mm để Seller dễ đọc và chỉnh sửa.
function formatTimeLabel(value: string | undefined, fallback: string): string {
    return value?.slice(0, 5) || fallback;
}

// Tách khung giờ Seller nhập thành hai giá trị hợp lệ trước khi gửi API.
function splitPickupWindow(value: string): { start: string; end: string } {
    const [start, end] = value.split('-').map((part) => part.trim());
    return { start: start || '08:00', end: end || '18:00' };
}

// Trang này chỉ giữ state của form và cache API; phần nội dung tĩnh được tách thành card chuyên biệt.
export default function ShippingProvidersPage() {
    const queryClient = useQueryClient();
    const settingsQuery = useQuery({ queryKey: ['seller-shipping-settings'], queryFn: getShippingSettings });
    const current = settingsQuery.data;
    const [preparationTime, setPreparationTime] = useState<string | null>(null);
    const [pickupWindow, setPickupWindow] = useState<string | null>(null);

    const preparationTimeHours = preparationTime ?? String(current?.settings.preparationTimeHours ?? 24);
    const pickupWindowValue = pickupWindow ?? `${formatTimeLabel(current?.settings.pickupWindowStart, '08:00')} - ${formatTimeLabel(current?.settings.pickupWindowEnd, '18:00')}`;
    const hasDefaultPickupAddress = Boolean(
        current?.pickupAddresses.some(
            (address) =>
                address.id === current.settings.defaultPickupAddressId ||
                address.isDefault,
        ),
    );

    // Lưu lịch bàn giao rồi cập nhật cache dùng chung để các trang Seller không phải gọi lại dữ liệu ngay lập tức.
    const saveMutation = useMutation({
        mutationFn: () => {
            const window = splitPickupWindow(pickupWindowValue);
            return updateShippingSettings({
                preparationTimeHours: Number(preparationTimeHours),
                pickupWindowStart: window.start,
                pickupWindowEnd: window.end,
                enabled: true,
            });
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['seller-shipping-settings'], data);
            toast.success('Đã lưu cấu hình vận chuyển.');
        },
        onError: () => toast.error('Không thể lưu cấu hình vận chuyển.'),
    });

    if (settingsQuery.isPending) {
        return <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">Đang tải cấu hình vận chuyển...</div>;
    }

    if (settingsQuery.isError || !current) {
        return (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <CircleAlert className="mx-auto size-7 text-red-600" />
                <h1 className="mt-3 font-semibold text-red-950">Không thể tải cấu hình vận chuyển</h1>
                <p className="mt-1 text-sm text-red-700">Vui lòng thử lại sau giây lát.</p>
                <Button variant="outline" className="mt-5 cursor-pointer border-red-200 bg-white" onClick={() => settingsQuery.refetch()}>Thử lại</Button>
            </section>
        );
    }

    return (
        <div className="min-w-0 pb-10">
            <Link href="/seller/shipping/settings" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950">
                <ArrowLeft className="size-4" />
                Thiết lập giao nhận
            </Link>

            <header className="mt-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                            <Truck className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Vận hành giao nhận</p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Đơn vị vận chuyển</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Một nơi để kiểm tra kết nối GHN và thiết lập lịch bàn giao của shop.</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-zinc-950 text-white">
                            <Truck className="size-4" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">GHN Test</p>
                            <p className="mt-0.5 text-xs text-zinc-500">Môi trường kiểm thử</p>
                        </div>
                    </div>
                </div>

                <nav aria-label="Các bước cấu hình vận chuyển" className="mt-6 grid gap-2 border-t border-zinc-200 pt-5 sm:grid-cols-3">
                    <a href="#connection" className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-zinc-50">
                        <span className="flex size-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">01</span>
                        <span><span className="block text-sm font-semibold text-zinc-950">Kết nối</span><span className="block text-xs text-zinc-500">GHN Test</span></span>
                    </a>
                    <a href="#handoff" className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-zinc-50">
                        <span className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">02</span>
                        <span><span className="block text-sm font-semibold text-zinc-950">Bàn giao</span><span className="block text-xs text-zinc-500">Lịch xử lý hàng</span></span>
                    </a>
                    <a href="#workflow" className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-zinc-50">
                        <span className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">03</span>
                        <span><span className="block text-sm font-semibold text-zinc-950">Theo dõi</span><span className="block text-xs text-zinc-500">Luồng đơn hàng</span></span>
                    </a>
                </nav>
            </header>

            <main className="mx-auto mt-5 max-w-6xl">
                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
                    <div className="min-w-0 space-y-5">
                        <div id="connection">
                            <ShippingProviderConnectionCard />
                        </div>

                        <section id="handoff" className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">02</span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.17em] text-zinc-400">Thiết lập bàn giao</p>
                                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Lịch chuẩn bị và nhận hàng</h2>
                                    <p className="mt-1 text-sm leading-6 text-zinc-500">Cài đặt thời gian để Seller chủ động chuẩn bị trước khi đơn vị vận chuyển đến nhận hàng.</p>
                                </div>
                            </div>

                            <ShippingProviderSettingsPanel
                                preparationTimeHours={preparationTimeHours}
                                pickupWindow={pickupWindowValue}
                                isPending={saveMutation.isPending}
                                onPreparationTimeChange={setPreparationTime}
                                onPickupWindowChange={setPickupWindow}
                                onSave={() => saveMutation.mutate()}
                            />
                        </section>
                    </div>

                    <aside id="workflow" className="min-w-0">
                        <ShippingProviderWorkflowCard hasDefaultPickupAddress={hasDefaultPickupAddress} />
                    </aside>
                </div>
            </main>
        </div>
    );
}
