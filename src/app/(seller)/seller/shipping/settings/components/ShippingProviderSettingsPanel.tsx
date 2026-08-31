// Form chỉnh lịch bàn giao cho GHN Test, được dùng trong vùng nội dung chính.

'use client';

import { Clock3, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ShippingProviderSettingsPanelProps {
    preparationTimeHours: string;
    pickupWindow: string;
    isPending: boolean;
    onPreparationTimeChange: (value: string) => void;
    onPickupWindowChange: (value: string) => void;
    onSave: () => void;
}

// Hiển thị các trường Seller được phép chỉnh, giữ provider và credential platform ở chế độ read-only.
export function ShippingProviderSettingsPanel({
    preparationTimeHours,
    pickupWindow,
    isPending,
    onPreparationTimeChange,
    onPickupWindowChange,
    onSave,
}: ShippingProviderSettingsPanelProps) {
    return (
        <div className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-700">
                    Thời gian chuẩn bị hàng
                    <span className="relative mt-2 block">
                        <input
                            className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-16 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                            type="number"
                            min="0"
                            max="168"
                            value={preparationTimeHours}
                            onChange={(event) => onPreparationTimeChange(event.target.value)}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-zinc-400">giờ</span>
                    </span>
                    <span className="mt-1.5 block text-xs font-normal text-zinc-500">Thời gian shop cần để đóng gói trước khi bàn giao.</span>
                </label>

                <label className="block text-sm font-medium text-zinc-700">
                    Khung giờ nhận hàng
                    <input
                        className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                        value={pickupWindow}
                        onChange={(event) => onPickupWindowChange(event.target.value)}
                        placeholder="08:00 - 18:00"
                    />
                    <span className="mt-1.5 block text-xs font-normal text-zinc-500">Khoảng thời gian đơn vị vận chuyển đến nhận hàng.</span>
                </label>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                <Clock3 className="mt-1 size-4 shrink-0 text-zinc-500" />
                <p>Phí giao hàng được tính theo từng shop tại checkout, sau khi khách chọn địa chỉ nhận.</p>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-zinc-500">Cấu hình có thể cập nhật bất cứ lúc nào.</p>
                <Button className="w-full cursor-pointer sm:w-auto" disabled={isPending} onClick={onSave}>
                    <Save className="size-4" />
                    {isPending ? 'Đang lưu...' : 'Lưu thiết lập'}
                </Button>
            </div>
        </div>
    );
}
