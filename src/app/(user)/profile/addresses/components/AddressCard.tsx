// Component hiển thị một địa chỉ giao hàng và các thao tác quản lý cơ bản.
// Component không gọi API; mọi mutation được truyền từ hook của feature qua callback.

'use client';

import { Check, MapPin, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { UserAddress } from '@/services/auth';
import { getAddressLocation } from '../utils/address-payload';

interface AddressCardProps {
    address: UserAddress;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
    deleting: boolean;
}

// Render địa chỉ cùng trạng thái mã GHN để người dùng biết bản ghi có thể dùng cho checkout hay chưa.
export function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    deleting,
}: AddressCardProps) {
    const canSetDefault = Boolean(
        address.ghnProvinceId && address.ghnDistrictId && address.ghnWardCode,
    );

    return (
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <MapPin className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-zinc-950">
                                {address.fullName}
                            </h3>
                            {address.isDefault ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-zinc-950 bg-zinc-950 px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-zinc-950/10">
                                    <Check className="size-3 text-white" /> Mặc định
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                            {address.phone}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-zinc-700">
                            {getAddressLocation(address)}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onEdit}
                        aria-label="Chỉnh sửa địa chỉ"
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onDelete}
                        disabled={deleting}
                        aria-label="Xóa địa chỉ"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
            {!address.isDefault ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-zinc-700"
                    onClick={onSetDefault}
                    disabled={!canSetDefault}
                >
                    Đặt làm địa chỉ mặc định
                </Button>
            ) : (
                <p className="mt-4 text-xs text-zinc-500">
                    Địa chỉ này được dùng khi tạo báo giá và vận đơn.
                </p>
            )}
            {!canSetDefault ? (
                <p className="mt-2 text-xs text-amber-700">
                    Địa chỉ chưa đủ mã GHN. Vui lòng chỉnh sửa trước khi đặt
                    hàng.
                </p>
            ) : null}
        </article>
    );
}
