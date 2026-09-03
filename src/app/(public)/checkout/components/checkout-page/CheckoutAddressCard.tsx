// Card địa chỉ độc lập: vùng chọn địa chỉ và nhóm thao tác được tách để HTML luôn hợp lệ.
// Component không tự gọi API; parent quyết định địa chỉ đang chọn và trạng thái xóa.

import { Check, Loader2, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { UserAddress } from '@/services/auth';

// Hiển thị một địa chỉ với trạng thái chọn, sửa và xóa do checkout page điều khiển.
export function CheckoutAddressCard({
    address,
    selected,
    onSelect,
    onEdit,
    onDelete,
    deleting,
    formatAddress,
}: {
    address: UserAddress;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    deleting: boolean;
    formatAddress: (address: UserAddress) => string;
}) {
    return (
        <article className={`w-full rounded-2xl border p-4 transition ${selected ? 'border-zinc-950 bg-zinc-50 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
            <div className="flex items-start gap-3">
                <button type="button" onClick={onSelect} aria-pressed={selected} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
                    <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 text-transparent'}`}><Check className="size-3" aria-hidden="true" /></div>
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-zinc-950">{address.fullName}</p><span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">{address.label}</span>{address.isDefault ? <span className="inline-flex items-center gap-1 rounded-full border border-zinc-950 bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold text-white"><Check className="size-2.5" aria-hidden="true" />Mặc định</span> : null}</div><p className="mt-1 text-sm text-zinc-600">{address.phone}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{formatAddress(address)}</p></div>
                </button>
                <div className="flex shrink-0 gap-1"><Button type="button" variant="ghost" size="icon" className="size-8 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950" aria-label="Chỉnh sửa địa chỉ" onClick={onEdit}><Pencil className="size-4" aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon" className="size-8 text-zinc-500 hover:bg-red-50 hover:text-red-700" aria-label="Xóa địa chỉ" disabled={deleting} onClick={onDelete}>{deleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}</Button></div>
            </div>
        </article>
    );
}
