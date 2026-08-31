//
// Màn hình thiết lập giao nhận cho Seller.
// Page này điều phối dữ liệu settings, mutation và bố cục; các form/list chuyên biệt nằm trong components.
// Page không tự tạo mã địa chỉ, không nhận shopId từ UI và không quản lý credential của nhà vận chuyển.
//
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, CircleAlert, Pencil, Truck, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    createPickupAddress,
    deletePickupAddress,
    getShippingSettings,
    setDefaultPickupAddress,
    updatePickupAddress,
    type PickupAddress,
} from '@/services/seller';
import { PickupAddressFormPanel, type PickupAddressFormValues } from './components/PickupAddressFormPanel';
import { SavedPickupAddressesPanel } from './components/SavedPickupAddressesPanel';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Điều phối trạng thái page và giữ mọi thao tác địa chỉ nằm trong scope shop do backend xác định từ JWT.
export default function ShippingSettingsPage() {
    const queryClient = useQueryClient();
    const settingsQuery = useQuery({
        queryKey: ['seller-shipping-settings'],
        queryFn: getShippingSettings,
    });
    const current = settingsQuery.data;
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [formResetKey, setFormResetKey] = useState(0);

    const defaultAddress = current?.pickupAddresses.find((address) => address.id === current.settings.defaultPickupAddressId)
        ?? current?.pickupAddresses.find((address) => address.isDefault);
    const defaultAddressReady = Boolean(
        defaultAddress &&
            defaultAddress.ghnProvinceId && defaultAddress.ghnDistrictId && defaultAddress.ghnWardCode,
    );

    const addressMutation = useMutation({
        mutationFn: ({ id, values }: { id: string | null; values: PickupAddressFormValues }) => {
            const payload = {
                contactName: values.contactName,
                phone: values.phone,
                provinceId: Number(values.provinceId),
                provinceName: values.provinceName,
                districtId: Number(values.districtId),
                districtName: values.districtName,
                wardCode: values.wardCode,
                wardName: values.wardName,
                addressLine: values.addressLine,
            };

            return id ? updatePickupAddress(id, payload) : createPickupAddress(payload);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['seller-shipping-settings'], data);
            setEditingAddressId(null);
            if (!variables.id) {
                setFormResetKey((previous) => previous + 1);
            }
            toast.success(variables.id ? 'Đã cập nhật địa chỉ lấy hàng.' : 'Đã thêm địa chỉ lấy hàng.');
        },
        onError: () => toast.error('Vui lòng chọn đầy đủ địa chỉ và kiểm tra thông tin liên hệ.'),
    });

    const defaultAddressMutation = useMutation({
        mutationFn: (id: string) => setDefaultPickupAddress(id),
        onSuccess: (data) => {
            queryClient.setQueryData(['seller-shipping-settings'], data);
            toast.success('Đã đổi địa chỉ lấy hàng mặc định.');
        },
        onError: () => toast.error('Không thể đổi địa chỉ mặc định.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePickupAddress(id),
        onSuccess: (data) => {
            queryClient.setQueryData(['seller-shipping-settings'], data);
            setEditingAddressId(null);
            toast.success('Đã xóa địa chỉ lấy hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    if (settingsQuery.isPending) {
        return <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">Đang tải thiết lập giao nhận...</div>;
    }

    if (settingsQuery.isError || !current) {
        return (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <CircleAlert className="mx-auto size-7 text-red-600" />
                <h1 className="mt-3 font-semibold text-red-950">Không thể tải thiết lập giao nhận</h1>
                <p className="mt-1 text-sm text-red-700">Vui lòng thử lại sau giây lát.</p>
                <Button variant="outline" className="mt-5 cursor-pointer border-red-200 bg-white" onClick={() => settingsQuery.refetch()}>Thử lại</Button>
            </section>
        );
    }

    // Chuyển Seller đến đúng khu vực thao tác; trên mobile form nằm phía dưới nên cần cuộn tới form.
    const handleEditAddress = (address: PickupAddress) => {
        setEditingAddressId(address.id);
        window.requestAnimationFrame(() => {
            document.getElementById('pickup-address-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    // Dialog ở danh sách đã xác nhận hành động; page chỉ phát mutation trong scope shop hiện tại.
    const handleDeleteAddress = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <div className="min-w-0 space-y-6">
            <header className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Vận hành giao nhận</p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Thiết lập giao nhận</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Quản lý nơi lấy hàng của shop để đơn được tạo vận đơn chính xác.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                            <CheckCircle2 className="size-5 text-zinc-800" />
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">{defaultAddressReady ? 'Sẵn sàng nhận đơn' : 'Cần đối chiếu địa chỉ'}</p>
                                <p className="mt-0.5 text-xs text-zinc-500">{defaultAddressReady ? 'Địa chỉ lấy hàng đã được chọn' : 'Chọn khu vực GHN cho kho mặc định'}</p>
                            </div>
                        </div>
                        <Link href="/seller/shipping/providers" className="inline-flex h-[58px] cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
                            <Truck className="size-4" />
                            Đơn vị vận chuyển
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="min-w-0 space-y-6">
                    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                    <Warehouse className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Địa chỉ ưu tiên</p>
                                    <h2 className="mt-1 text-lg font-semibold text-zinc-950">Địa chỉ lấy hàng mặc định</h2>
                                    <p className="mt-1 text-sm leading-6 text-zinc-500">Địa chỉ này sẽ được dùng khi tạo báo giá và vận đơn.</p>
                                </div>
                            </div>
                            {defaultAddress ? (
                                <button type="button" className="inline-flex h-9 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950" onClick={() => handleEditAddress(defaultAddress)}>
                                    <Pencil className="size-3.5" /> Chỉnh sửa
                                </button>
                            ) : null}
                        </div>

                        {defaultAddress ? (
                            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 sm:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                        <span className="flex size-7 items-center justify-center rounded-full bg-zinc-950 text-white">
                                            <CheckCircle2 className="size-4" />
                                        </span>
                                        Đang được sử dụng làm địa chỉ mặc định
                                    </div>
                                        <span className="text-xs text-zinc-500">{defaultAddressReady ? 'Dùng cho báo giá và vận đơn' : 'Chưa đủ mã khu vực GHN'}</span>
                                </div>
                                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(180px,0.7fr)_minmax(180px,0.7fr)_minmax(280px,1.6fr)]">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Người liên hệ</p>
                                        <p className="mt-2 font-semibold text-zinc-950">{defaultAddress.contactName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Số điện thoại</p>
                                        <p className="mt-2 font-semibold text-zinc-950">{defaultAddress.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Địa chỉ lấy hàng</p>
                                        <p className="mt-2 font-medium leading-6 text-zinc-900">{defaultAddress.addressLine}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">Chưa có địa chỉ lấy hàng. Tạo địa chỉ đầu tiên ở khu vực bên phải để bắt đầu nhận đơn.</div>
                        )}
                    </section>

                    <SavedPickupAddressesPanel
                        addresses={current.pickupAddresses}
                        defaultAddressId={current.settings.defaultPickupAddressId}
                        isDeleting={deleteMutation.isPending}
                        isSettingDefault={defaultAddressMutation.isPending}
                        onEdit={handleEditAddress}
                        onDelete={handleDeleteAddress}
                        onSetDefault={(id) => defaultAddressMutation.mutate(id)}
                    />

                    <div id="pickup-address-form" className="scroll-mt-6">
                        <PickupAddressFormPanel
                            key={`${editingAddressId ?? 'new-pickup-address'}-${formResetKey}`}
                            editingAddress={editingAddressId ? current.pickupAddresses.find((address) => address.id === editingAddressId) : undefined}
                            isPending={addressMutation.isPending}
                            onCancelEdit={() => setEditingAddressId(null)}
                            onSubmit={(values) => addressMutation.mutate({ id: editingAddressId, values })}
                        />
                    </div>
            </main>
        </div>
    );
}
