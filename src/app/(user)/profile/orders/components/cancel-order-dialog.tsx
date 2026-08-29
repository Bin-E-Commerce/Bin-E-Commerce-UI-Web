'use client';

// File này quản lý nút và hộp thoại xác nhận hủy đơn COD của Customer.

import { useState } from 'react';
import { Check, LoaderCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type CancelOrderDialogProps = {
    loading: boolean;
    onConfirm: (reason?: string) => Promise<void>;
};

// Chọn lựa nhanh giúp Customer hoàn tất lý do hủy bằng một lần chạm trên mobile hoặc desktop.
function QuickReasonOption({
    value,
    selected,
    onSelect,
}: {
    value: string;
    selected: boolean;
    onSelect: (value: string) => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(value)}
            className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-all ${selected ? 'border-red-200 bg-red-50/80 text-zinc-950 shadow-sm ring-1 ring-red-100' : 'border-zinc-200 bg-white text-zinc-700 hover:-translate-y-px hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'}`}
        >
            <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${selected ? 'border-red-500 bg-red-500 text-white' : 'border-zinc-300 bg-white text-transparent'}`}
            >
                <Check className="size-3" aria-hidden="true" />
            </span>
            <span>{value}</span>
        </button>
    );
}

// Hộp thoại hủy đơn cho phép chọn lý do có sẵn, nhập thêm ghi chú và chờ API hoàn tất trước khi đóng.
export function CancelOrderDialog({
    loading,
    onConfirm,
}: CancelOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [reason, setReason] = useState('');

    // Reset lựa chọn cũ khi Customer đóng dialog để lần mở tiếp theo luôn bắt đầu sạch và dễ hiểu.
    function resetForm() {
        setSelectedReason('');
        setReason('');
    }

    // Chọn lý do có sẵn sẽ dùng trực tiếp làm reason; lựa chọn Khác mở vùng nhập chi tiết riêng.
    function selectReason(value: string) {
        setSelectedReason(value);
        setReason(value === 'Khác' ? '' : value);
    }

    // Gửi lý do đã chọn hoặc nội dung tùy chọn, chỉ đóng dialog sau khi mutation xác nhận thành công.
    async function confirm() {
        const normalizedReason = reason.trim() || undefined;
        await onConfirm(normalizedReason);
        setOpen(false);
        resetForm();
    }

    // Không cho đóng dialog giữa lúc request đang chạy để tránh Customer tưởng thao tác đã hoàn tất.
    function handleOpenChange(nextOpen: boolean) {
        if (loading && !nextOpen) return;
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
    }

    return (
        <>
            <Button
                variant="outline"
                className="group h-9 cursor-pointer gap-2 rounded-full border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-600 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => setOpen(true)}
            >
                <XCircle className="size-4 text-current" aria-hidden="true" />
                Hủy đơn
            </Button>
            <AlertDialog open={open} onOpenChange={handleOpenChange}>
                <AlertDialogContent className="max-w-lg gap-0 overflow-hidden p-0">
                    <AlertDialogHeader className="border-b border-zinc-100 bg-gradient-to-br from-red-50/70 via-white to-white px-6 py-6 text-left sm:px-7">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                                <XCircle className="size-5" aria-hidden="true" />
                            </div>
                            <div className="pt-0.5">
                                <AlertDialogTitle className="text-lg">
                                    Hủy đơn hàng?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="mt-1.5 leading-5">
                                    Vui lòng chọn lý do để chúng tôi cải thiện trải nghiệm mua sắm của bạn.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-6 px-6 py-6 sm:px-7">
                        <div>
                            <p className="mb-3.5 text-sm font-semibold text-zinc-950">
                                Vì sao bạn muốn hủy đơn?
                                <span className="ml-1 font-normal text-zinc-400">
                                    (không bắt buộc)
                                </span>
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <QuickReasonOption
                                    value="Tôi đặt nhầm sản phẩm"
                                    selected={selectedReason === 'Tôi đặt nhầm sản phẩm'}
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Muốn thay đổi thông tin nhận hàng"
                                    selected={selectedReason === 'Muốn thay đổi thông tin nhận hàng'}
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Muốn đổi phương thức thanh toán"
                                    selected={selectedReason === 'Muốn đổi phương thức thanh toán'}
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Tìm được sản phẩm tốt hơn"
                                    selected={selectedReason === 'Tìm được sản phẩm tốt hơn'}
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Không còn nhu cầu mua"
                                    selected={selectedReason === 'Không còn nhu cầu mua'}
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Khác"
                                    selected={selectedReason === 'Khác'}
                                    onSelect={selectReason}
                                />
                            </div>
                        </div>

                        {selectedReason === 'Khác' ? (
                            <div>
                                <label
                                    htmlFor="cancel-reason"
                                    className="text-sm font-semibold text-zinc-950"
                                >
                                    Mô tả thêm
                                </label>
                                <Textarea
                                    id="cancel-reason"
                                    value={reason}
                                    onChange={(event) =>
                                        setReason(event.target.value.slice(0, 500))
                                    }
                                    maxLength={500}
                                    placeholder="Chia sẻ thêm lý do hủy đơn của bạn..."
                                    className="mt-2 min-h-28 resize-none rounded-xl border-zinc-200 bg-white"
                                    autoFocus
                                />
                                <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-400">
                                    <span>Tối đa 500 ký tự</span>
                                    <span>{reason.length}/500</span>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <AlertDialogFooter className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 sm:px-7">
                        <AlertDialogCancel
                            disabled={loading}
                            className="h-10 cursor-pointer rounded-xl border-zinc-200 bg-white px-4 text-sm shadow-sm"
                        >
                            Giữ lại đơn
                        </AlertDialogCancel>
                        <Button
                            variant="destructive"
                            disabled={loading}
                            onClick={() => void confirm()}
                            className="h-10 cursor-pointer rounded-xl px-4 text-sm shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                    Đang hủy...
                                </>
                            ) : (
                                'Xác nhận hủy đơn'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
