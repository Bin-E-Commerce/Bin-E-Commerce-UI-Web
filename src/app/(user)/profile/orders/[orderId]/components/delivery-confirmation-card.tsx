// File này hiển thị quyết định nhận hàng sau khi carrier báo giao thành công.
// Component không tự đổi order; mọi chuyển trạng thái đều đi qua mutation Order Service để giữ ownership và idempotency.

'use client';

import { useEffect, useState } from 'react';

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import { useConfirmOrderDelivery } from '../hooks/use-delivery-confirmation';

type DeliveryConfirmationCardProps = {
    order: OrderResponse;
};

const ISSUE_REASONS = ['NOT_RECEIVED', 'DAMAGED', 'WRONG_ITEM', 'MISSING_ITEM', 'OTHER'] as const;

// Định dạng countdown theo ngày/giờ để khách hiểu rõ mốc auto-complete mà không cần biết timestamp kỹ thuật.
function formatRemainingTime(deadline: string | null): string | null {
    if (!deadline) return null;
    const remaining = new Date(deadline).getTime() - Date.now();
    if (remaining <= 0) return 'sẽ được xử lý ngay';
    const days = Math.floor(remaining / 86_400_000);
    const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
    return days > 0 ? `${days} ngày ${hours} giờ` : `${hours} giờ`;
}

// Kiểm tra stage và confirmation status trước khi render để card không xuất hiện cho đơn cũ hoặc đơn đã xử lý.
function shouldRenderConfirmation(order: OrderResponse): boolean {
    const confirmationStatus = order.deliveryConfirmation?.status;
    return order.fulfillmentStatus === 'DELIVERED' && (!confirmationStatus || confirmationStatus === 'PENDING');
}

// Render card xác nhận với hai lựa chọn rõ ràng, ưu tiên thao tác tích cực và giữ lựa chọn báo lỗi dễ tìm.
export function DeliveryConfirmationCard({ order }: DeliveryConfirmationCardProps) {
    const [issueOpen, setIssueOpen] = useState(false);
    const [reason, setReason] = useState<(typeof ISSUE_REASONS)[number] | ''>('');
    const [note, setNote] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const mutation = useConfirmOrderDelivery(order.id);
    const [remainingTime, setRemainingTime] = useState(() => formatRemainingTime(order.deliveryConfirmation.deadline));

    // Cập nhật countdown theo phút bằng subscription timer để customer luôn thấy đúng thời gian auto-complete.
    useEffect(() => {
        const timer = window.setInterval(() => {
            setRemainingTime(formatRemainingTime(order.deliveryConfirmation.deadline));
        }, 60_000);
        return () => window.clearInterval(timer);
    }, [order.deliveryConfirmation.deadline]);

    if (!shouldRenderConfirmation(order)) return null;

    // Gửi xác nhận thành công ngay trong click handler để không tạo side effect lặp lại qua useEffect.
    function handleReceived(): void {
        mutation.mutate({ decision: 'RECEIVED' });
    }

    // Chọn item bị ảnh hưởng để return workflow biết chính xác sản phẩm cần xử lý.
    function toggleItem(itemId: string): void {
        setSelectedItemIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    }

    // Gửi issue với validation tối thiểu ở UI; backend vẫn là nơi quyết định dữ liệu hợp lệ và quyền truy cập.
    function handleIssueSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (!reason) return;
        mutation.mutate({
            decision: 'ISSUE',
            reason,
            itemIds: selectedItemIds,
            note: note.trim() || undefined,
        }, {
            onSuccess: () => setIssueOpen(false),
        });
    }

    return (
        <>
            <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.45)] sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Xác nhận đơn hàng</p>
                        <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950">Bạn đã nhận được đơn hàng chưa?</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">Xác nhận để chúng tôi cập nhật hành trình chính xác. Bạn có thể bỏ qua phần đánh giá và quay lại sau.</p>
                        {remainingTime ? <p className="mt-3 text-xs font-medium text-zinc-700">Bạn có 3 ngày để xác nhận. Thời gian còn lại: {remainingTime}.</p> : null}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[330px] lg:grid-cols-1">
                        <Button type="button" onClick={handleReceived} disabled={mutation.isPending} className="h-11 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800">
                            {mutation.isPending ? 'Đang cập nhật...' : 'Hoàn thành đơn hàng'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIssueOpen(true)} disabled={mutation.isPending} className="h-11 rounded-xl border-zinc-300 px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
                            Chưa nhận / Có vấn đề
                        </Button>
                    </div>
                </div>
            </section>

            <AlertDialog open={issueOpen} onOpenChange={setIssueOpen}>
                <AlertDialogContent className="max-w-lg gap-0 overflow-hidden rounded-3xl p-0">
                    <AlertDialogHeader className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-6 text-left sm:px-7">
                        <AlertDialogTitle className="text-xl tracking-tight">Báo vấn đề với đơn hàng</AlertDialogTitle>
                        <AlertDialogDescription className="mt-2 leading-6">Chọn lý do để shop và bộ phận vận hành xử lý đúng hướng. Đơn hàng sẽ tạm dừng hoàn tất trong thời gian này.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={handleIssueSubmit}>
                        <div className="space-y-5 px-6 py-6 sm:px-7">
                            <fieldset>
                                <legend className="text-sm font-semibold text-zinc-950">Vấn đề của bạn là gì?</legend>
                                <div className="mt-3 grid gap-2">
                                    {ISSUE_REASONS.map((value) => (
                                        <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm transition-colors hover:border-zinc-400 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50">
                                            <input type="radio" name="issue-reason" value={value} checked={reason === value} onChange={() => setReason(value)} className="size-4 accent-black" />
                                            <span>{value === 'NOT_RECEIVED' ? 'Chưa nhận được hàng' : value === 'DAMAGED' ? 'Sản phẩm bị hư hỏng' : value === 'WRONG_ITEM' ? 'Giao sai sản phẩm' : value === 'MISSING_ITEM' ? 'Thiếu sản phẩm' : 'Vấn đề khác'}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            {reason && reason !== 'NOT_RECEIVED' ? (
                                <fieldset>
                                    <legend className="text-sm font-semibold text-zinc-950">Sản phẩm bị ảnh hưởng</legend>
                                    <div className="mt-3 space-y-2">
                                        {order.items.map((item) => (
                                            <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm hover:border-zinc-400">
                                                <input type="checkbox" checked={selectedItemIds.includes(item.id)} onChange={() => toggleItem(item.id)} className="size-4 accent-black" />
                                                <span className="min-w-0 truncate">{item.productName}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ) : null}

                            <div>
                                <label htmlFor="delivery-issue-note" className="text-sm font-semibold text-zinc-950">Ghi chú thêm <span className="font-normal text-zinc-400">(không bắt buộc)</span></label>
                                <Textarea id="delivery-issue-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Mô tả ngắn để chúng tôi hỗ trợ nhanh hơn..." className="mt-3 min-h-24 resize-none rounded-xl border-zinc-200" maxLength={1000} />
                                <p className="mt-1.5 text-right text-[11px] text-zinc-400">{note.length}/1000</p>
                            </div>
                        </div>
                        <AlertDialogFooter className="border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 sm:px-7">
                            <Button type="button" variant="outline" onClick={() => setIssueOpen(false)} disabled={mutation.isPending} className="h-10 rounded-xl">Để sau</Button>
                            <Button type="submit" disabled={!reason || mutation.isPending} className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800">{mutation.isPending ? 'Đang gửi...' : 'Gửi thông tin'}</Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
