// Trang quản lý địa chỉ Customer dùng master data GHN giống checkout.
// Page chỉ compose layout và feature components; query/mutation nằm trong hook riêng.

'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';

import { AddressForm } from '@/app/(public)/checkout/components/address-form/AddressForm';
import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import { Button } from '@/components/ui/button';
import { type CreateAddressPayload, type UserAddress } from '@/services/auth';
import { useAppSelector } from '@/store/hooks';
import { AddressCard } from './components/AddressCard';
import { useUserAddresses } from './hooks/useUserAddresses';

// Điều phối trạng thái mở form và nối các callback UI với hook quản lý địa chỉ.
export default function AddressesPage() {
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<
        UserAddress | undefined
    >();
    const {
        addresses,
        addressesQuery,
        deleteAddress,
        deletingAddressId,
        isSaving,
        saveAddress,
        setDefaultAddress,
    } = useUserAddresses(userId);

    // Lưu form theo đúng bản ghi đang chỉnh sửa; form tự reset khi callback trả true.
    async function handleSubmit(
        payload: CreateAddressPayload,
    ): Promise<boolean> {
        return saveAddress(payload, editingAddress?.id);
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-0 lg:px-0">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />
                <main className="min-w-0 flex-1">
                    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                                    Địa chỉ giao hàng
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">
                                    Quản lý địa chỉ dùng khi checkout. Khu vực
                                    được chọn theo danh sách GHN.
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    setEditingAddress(undefined);
                                    setShowForm((value) => !value);
                                }}
                            >
                                <Plus className="mr-2 size-4" /> Thêm địa chỉ
                            </Button>
                        </div>
                        {showForm ? (
                            <AddressForm
                                key={editingAddress?.id ?? 'new'}
                                pending={isSaving}
                                initialAddress={editingAddress}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingAddress(undefined);
                                }}
                            />
                        ) : null}
                    </section>
                    <section className="mt-6 space-y-3">
                        {addressesQuery.isPending ? (
                            <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
                                Đang tải địa chỉ...
                            </p>
                        ) : addressesQuery.isError ? (
                            <p className="rounded-2xl border border-dashed border-red-200 p-8 text-center text-sm text-red-600">
                                Không thể tải danh sách địa chỉ. Vui lòng thử
                                lại sau.
                            </p>
                        ) : addresses.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
                                <MapPin className="mx-auto size-10 text-zinc-300" />
                                <h2 className="mt-3 font-semibold text-zinc-900">
                                    Chưa có địa chỉ nào
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Thêm địa chỉ GHN để checkout nhanh và chính
                                    xác hơn.
                                </p>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <AddressCard
                                    key={address.id}
                                    address={address}
                                    deleting={deletingAddressId === address.id}
                                    onEdit={() => {
                                        setEditingAddress(address);
                                        setShowForm(true);
                                    }}
                                    onDelete={() => deleteAddress(address.id)}
                                    onSetDefault={() =>
                                        setDefaultAddress(address)
                                    }
                                />
                            ))
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
