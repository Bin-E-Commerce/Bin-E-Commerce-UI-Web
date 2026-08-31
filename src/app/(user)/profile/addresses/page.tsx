// Trang quản lý địa chỉ Customer dùng master data GHN giống checkout.

'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import { Button } from '@/components/ui/button';
import { authService, type CreateAddressPayload, type UserAddress } from '@/services/auth';
import { AddressForm } from '@/app/(public)/checkout/components/address-form/AddressForm';

const ADDRESS_QUERY_KEY = ['profile-addresses'];

// Chuyển bản ghi địa chỉ đã lưu thành payload đầy đủ để cập nhật địa chỉ mặc định.
function toAddressPayload(address: UserAddress): CreateAddressPayload | null {
    if (!address.ghnProvinceId || !address.ghnProvinceName || !address.ghnDistrictId || !address.ghnDistrictName || !address.ghnWardCode || !address.ghnWardName) return null;
    return { label: address.label, fullName: address.fullName, phone: address.phone, province: address.ghnProvinceName, ghnProvinceId: address.ghnProvinceId, ghnProvinceName: address.ghnProvinceName, district: address.ghnDistrictName, ghnDistrictId: address.ghnDistrictId, ghnDistrictName: address.ghnDistrictName, ward: address.ghnWardName, ghnWardCode: address.ghnWardCode, ghnWardName: address.ghnWardName, street: address.street, isDefault: address.isDefault };
}

// Hiển thị một địa chỉ với trạng thái GHN và thao tác quản lý rõ ràng.
function AddressCard({ address, onEdit, onDelete, onSetDefault, deleting }: { address: UserAddress; onEdit: () => void; onDelete: () => void; onSetDefault: () => void; deleting: boolean }) {
    const area = [address.street, address.ghnWardName ?? address.ward, address.ghnDistrictName ?? address.district, address.ghnProvinceName ?? address.province].filter(Boolean).join(', ');
    const canSetDefault = Boolean(address.ghnProvinceId && address.ghnDistrictId && address.ghnWardCode);
    return <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white"><MapPin className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-zinc-950">{address.fullName}</h3>{address.isDefault ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"><Check className="size-3" /> Mặc định</span> : null}</div><p className="mt-1 text-sm text-zinc-500">{address.phone}</p><p className="mt-3 text-sm leading-6 text-zinc-700">{area}</p></div></div><div className="flex shrink-0 gap-2"><Button variant="outline" size="icon" onClick={onEdit} aria-label="Chỉnh sửa địa chỉ"><Pencil className="size-4" /></Button><Button variant="outline" size="icon" onClick={onDelete} disabled={deleting} aria-label="Xóa địa chỉ"><Trash2 className="size-4" /></Button></div></div>{!address.isDefault ? <Button variant="ghost" size="sm" className="mt-4 text-zinc-700" onClick={onSetDefault} disabled={!canSetDefault}>Đặt làm địa chỉ mặc định</Button> : <p className="mt-4 text-xs text-zinc-500">Địa chỉ này được dùng khi tạo báo giá và vận đơn.</p>}{!canSetDefault ? <p className="mt-2 text-xs text-amber-700">Địa chỉ chưa đủ mã GHN. Vui lòng chỉnh sửa trước khi đặt hàng.</p> : null}</article>;
}

// Điều phối query và mutation cho danh sách địa chỉ của tài khoản hiện tại.
export default function AddressesPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();
    const addressesQuery = useQuery({ queryKey: ADDRESS_QUERY_KEY, queryFn: async () => (await authService.getAddresses()).data, staleTime: 60_000 });
    const saveMutation = useMutation({ mutationFn: async ({ payload, id }: { payload: CreateAddressPayload; id?: string }) => id ? authService.updateAddress(id, payload) : authService.createAddress(payload), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }); setShowForm(false); setEditingAddress(undefined); toast.success('Đã lưu địa chỉ.'); } });
    const deleteMutation = useMutation({ mutationFn: (id: string) => authService.deleteAddress(id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }); toast.success('Đã xóa địa chỉ.'); } });
    const defaultMutation = useMutation({ mutationFn: async (address: UserAddress) => { const payload = toAddressPayload(address); if (!payload) throw new Error('Địa chỉ chưa đủ mã GHN.'); return authService.updateAddress(address.id, { ...payload, isDefault: true }); }, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }); toast.success('Đã đổi địa chỉ mặc định.'); }, onError: () => toast.error('Không thể đổi địa chỉ mặc định.') });
    const addresses = addressesQuery.data ?? [];

    // Lưu mới hoặc cập nhật địa chỉ sau khi AddressForm đã kiểm tra đủ ba mã GHN.
    async function handleSubmit(payload: CreateAddressPayload): Promise<boolean> {
        try { await saveMutation.mutateAsync({ payload, id: editingAddress?.id }); return true; } catch { toast.error('Không thể lưu địa chỉ.'); return false; }
    }

    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-0 lg:px-0"><div className="flex flex-col gap-8 md:flex-row"><ProfileSidebar /><main className="min-w-0 flex-1"><section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Tài khoản</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Địa chỉ giao hàng</h1><p className="mt-2 text-sm leading-6 text-zinc-500">Quản lý địa chỉ dùng khi checkout. Khu vực được chọn theo danh sách GHN.</p></div><Button onClick={() => { setEditingAddress(undefined); setShowForm((value) => !value); }}><Plus className="mr-2 size-4" /> Thêm địa chỉ</Button></div>{showForm ? <AddressForm key={editingAddress?.id ?? 'new'} pending={saveMutation.isPending} initialAddress={editingAddress} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditingAddress(undefined); }} /> : null}</section><section className="mt-6 space-y-3">{addressesQuery.isPending ? <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">Đang tải địa chỉ...</p> : addresses.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center"><MapPin className="mx-auto size-10 text-zinc-300" /><h2 className="mt-3 font-semibold text-zinc-900">Chưa có địa chỉ nào</h2><p className="mt-1 text-sm text-zinc-500">Thêm địa chỉ GHN để checkout nhanh và chính xác hơn.</p></div> : addresses.map((address) => <AddressCard key={address.id} address={address} deleting={deleteMutation.isPending && deleteMutation.variables === address.id} onEdit={() => { setEditingAddress(address); setShowForm(true); }} onDelete={() => deleteMutation.mutate(address.id)} onSetDefault={() => defaultMutation.mutate(address)} />)}</section></main></div></div>;
}
