//
// Khu vực hiển thị các địa chỉ lấy hàng đã lưu của Seller.
// Component này chịu trách nhiệm trình bày, chọn mặc định và phát sự kiện sửa/xóa.
// Component không tự gọi mutation để ownership và cập nhật cache vẫn do page quản lý.
//
'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    Check,
    Info,
    Loader2,
    MapPin,
    MapPinned,
    Pencil,
    Phone,
    Star,
    Trash2,
} from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { PickupAddress } from '@/services/seller';

interface SavedPickupAddressesPanelProps {
    addresses: PickupAddress[];
    defaultAddressId: string | null;
    isDeleting: boolean;
    isSettingDefault: boolean;
    onEdit: (address: PickupAddress) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
}

// Tạo danh sách location duy nhất để hiển thị tên địa lý mà không expose UUID cho Seller.
// Hiển thị danh sách kho theo một luồng rõ ràng: kho mặc định được ưu tiên, các kho còn lại có hành động chọn.
export function SavedPickupAddressesPanel({
    addresses,
    defaultAddressId,
    isDeleting,
    isSettingDefault,
    onEdit,
    onDelete,
    onSetDefault,
}: SavedPickupAddressesPanelProps) {
    const [pendingDeleteAddress, setPendingDeleteAddress] = useState<PickupAddress | null>(null);
    const orderedAddresses = [...addresses].sort((first, second) => {
        if (first.id === defaultAddressId) return -1;
        if (second.id === defaultAddressId) return 1;
        return first.contactName.localeCompare(second.contactName, 'vi');
    });

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <MapPin className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Kho lấy hàng
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                            Địa chỉ đã lưu
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Quản lý nơi shipper sẽ đến nhận hàng.
                        </p>
                    </div>
                </div>
                <span className="self-start rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 sm:self-auto">
                    {addresses.length} địa chỉ
                </span>
            </div>

            {orderedAddresses.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                        <MapPin className="size-5" />
                    </div>
                    <p className="mt-4 font-medium text-zinc-950">
                        Chưa có địa chỉ lấy hàng
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                        Thêm địa chỉ đầu tiên ở khu vực bên dưới.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-zinc-100">
                    {orderedAddresses.map((address) => {
                        const isDefault =
                            address.id === defaultAddressId ||
                            address.isDefault;
                        const areaNames = [address.ghnWardName, address.ghnDistrictName, address.ghnProvinceName].filter((name): name is string => Boolean(name));

                        return (
                            <article
                                key={address.id}
                                className="px-5 py-5 sm:px-6"
                            >
                                <div
                                    className={`rounded-2xl border p-5 transition sm:p-6 ${isDefault ? 'border-zinc-300 bg-zinc-50/70' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                                <MapPin className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <h3 className="font-semibold text-zinc-950">
                                                        {address.contactName}
                                                    </h3>
                                                    {isDefault ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700">
                                                            <Check className="size-3.5" />{' '}
                                                            Đang dùng
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 text-sm text-zinc-500">
                                                    Địa chỉ lấy hàng của shop
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                            {!isDefault ? (
                                                <button
                                                    type="button"
                                                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-50"
                                                    disabled={isSettingDefault}
                                                    onClick={() =>
                                                        onSetDefault(address.id)
                                                    }
                                                >
                                                    <Star className="size-3.5" />{' '}
                                                    Đặt làm mặc định
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-950 hover:text-zinc-950"
                                                aria-label="Chỉnh sửa địa chỉ"
                                                onClick={() => onEdit(address)}
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-red-300 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                                                aria-label="Xóa địa chỉ"
                                                disabled={isDeleting}
                                                onClick={() => setPendingDeleteAddress(address)}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 border-t border-zinc-200 pt-5 sm:grid-cols-[minmax(180px,0.65fr)_minmax(0,1.35fr)]">
                                        <div className="rounded-xl bg-white p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                                <Phone className="size-3.5" />{' '}
                                                Liên hệ
                                            </div>
                                            <p className="mt-3 font-medium text-zinc-950">
                                                {address.contactName}
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-600">
                                                {address.phone}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                                <MapPinned className="size-3.5" />{' '}
                                                Vị trí lấy hàng
                                            </div>
                                            <p className="mt-3 font-medium leading-6 text-zinc-900">
                                                {address.addressLine}
                                            </p>
                                            {areaNames.length > 0 ? (
                                                <p className="mt-1 text-sm leading-6 text-zinc-500">
                                                    {areaNames.join(' · ')}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <AlertDialog
                open={Boolean(pendingDeleteAddress)}
                onOpenChange={(open) => !open && setPendingDeleteAddress(null)}
            >
                <AlertDialogContent className="max-w-[520px] gap-0 overflow-hidden rounded-[28px] border-zinc-200 bg-white p-0 shadow-2xl">
                    <AlertDialogHeader className="border-b border-zinc-100 px-6 py-6 text-left sm:px-7 sm:py-7">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
                                <AlertTriangle className="size-5" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                                <AlertDialogTitle className="text-xl tracking-tight">
                                    Xóa địa chỉ lấy hàng?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="mt-2 max-w-[390px] leading-6">
                                    Địa chỉ này sẽ được gỡ khỏi danh sách lấy hàng của shop.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    {pendingDeleteAddress ? (
                        <div className="px-6 py-5 sm:px-7">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-200">
                                            <MapPin className="size-4" />
                                        </span>
                                        <p className="truncate font-semibold text-zinc-950">
                                            {pendingDeleteAddress.contactName}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Địa chỉ lấy hàng</span>
                                </div>
                                <div className="mt-4 space-y-1 border-t border-zinc-200 pt-4 text-sm">
                                    <p className="font-medium text-zinc-800">{pendingDeleteAddress.phone}</p>
                                    <p className="leading-6 text-zinc-600">{pendingDeleteAddress.addressLine}</p>
                                </div>
                            </div>
                            <p className="mt-3 flex items-start gap-2 px-1 text-xs leading-5 text-zinc-500">
                                <Info className="mt-0.5 size-3.5 shrink-0" />
                                Ghi chú: Các shipment đã tạo trước đó vẫn giữ nguyên thông tin địa chỉ.
                            </p>
                        </div>
                    ) : null}

                    <AlertDialogFooter className="border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:px-7">
                        <AlertDialogCancel className="h-10 cursor-pointer rounded-xl px-4" disabled={isDeleting}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                type="button"
                                className="h-10 cursor-pointer rounded-xl bg-zinc-950 px-4 text-white hover:bg-zinc-800"
                                disabled={isDeleting}
                                onClick={() => {
                                    if (!pendingDeleteAddress) return;
                                    onDelete(pendingDeleteAddress.id);
                                    setPendingDeleteAddress(null);
                                }}
                            >
                                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                {isDeleting ? 'Đang xóa...' : 'Xóa địa chỉ'}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
