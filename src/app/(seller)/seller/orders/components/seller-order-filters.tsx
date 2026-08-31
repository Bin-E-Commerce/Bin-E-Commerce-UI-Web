// Bộ lọc Seller chia theo công việc vận hành thay vì lặp lại badge trạng thái kỹ thuật.
import { ClipboardList, RefreshCw, RotateCcw, Search, Truck, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SellerOrderStatus } from '@/services/order/seller-order.api';

interface SellerOrderFiltersProps { status: SellerOrderStatus | undefined; search: string; refreshing: boolean; onStatusChange: (status: SellerOrderStatus | undefined) => void; onSearchChange: (search: string) => void; onRefresh: () => void; }

const tabs: Array<{ label: string; value: SellerOrderStatus | undefined; icon: typeof Truck }> = [
    { label: 'Tất cả', value: undefined, icon: ClipboardList },
    { label: 'Cần xử lý', value: 'TO_SHIP', icon: ClipboardList },
    { label: 'Vận chuyển', value: 'SHIPPING', icon: Truck },
    { label: 'Chờ giao hàng', value: 'SHIPPING', icon: Truck },
    { label: 'Hoàn thành', value: 'COMPLETED', icon: ClipboardList },
    { label: 'Đã hủy', value: 'CANCELLED', icon: RotateCcw },
    { label: 'Trả hàng/Hoàn tiền', value: 'RETURN_REFUND', icon: WalletCards },
];

// Render tab nghiệp vụ và ô search mã đơn trong một vùng ngang có thể cuộn trên mobile.
export function SellerOrderFilters({ status, search, refreshing, onStatusChange, onSearchChange, onRefresh }: SellerOrderFiltersProps) {
    return <section className="border-y border-zinc-200 bg-white"><div className="overflow-x-auto px-4 sm:px-6"><div className="flex min-w-max gap-6">{tabs.map((tab, index) => { const active = status === tab.value || (index === 0 && !status); const Icon = tab.icon; return <button key={`${tab.label}-${index}`} type="button" className={`flex h-12 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-1 text-sm transition-colors ${active ? 'border-zinc-950 font-semibold text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-950'}`} onClick={() => onStatusChange(tab.value)}><Icon className="size-4" />{tab.label}</button>; })}</div></div><div className="flex flex-col gap-3 border-t border-zinc-100 p-4 sm:flex-row sm:items-center sm:px-6"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={search} onChange={(event) => onSearchChange(event.target.value)} className="h-10 pl-9" placeholder="Tìm theo mã đơn hàng" aria-label="Tìm đơn hàng theo mã" /></div><Button type="button" variant="outline" size="icon" className="size-10 shrink-0 cursor-pointer self-end sm:self-auto" aria-label="Làm mới danh sách đơn hàng" onClick={onRefresh} disabled={refreshing}><RefreshCw className={refreshing ? 'animate-spin' : ''} /></Button></div></section>;
}
