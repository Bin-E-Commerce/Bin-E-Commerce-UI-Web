// Component xác nhận Seller hủy vận đơn và bắt buộc ghi rõ lý do trước khi gửi API.

'use client';

import { useState } from 'react';
import { LoaderCircle, XCircle } from 'lucide-react';

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

interface SellerCancelShipmentDialogProps {
    loading: boolean;
    onConfirm: (reason: string) => Promise<void>;
}

// Dialog giữ thao tác hủy vận đơn ở một bước và không cho gửi khi Seller chưa nhập lý do.
export function SellerCancelShipmentDialog({
    loading,
    onConfirm,
}: SellerCancelShipmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const normalizedReason = reason.trim();

    // Xóa lý do cũ khi đóng dialog để lần hủy tiếp theo không dùng nhầm nội dung trước đó.
    function resetForm() {
        setReason('');
    }

    // Chỉ đóng dialog sau khi backend xác nhận hủy vận đơn và hoàn tồn kho thành công.
    async function confirm() {
        await onConfirm(normalizedReason);
        setOpen(false);
        resetForm();
    }

    // Khóa thao tác đóng trong lúc request đang chạy để tránh trạng thái giao diện lệch với server.
    function handleOpenChange(nextOpen: boolean) {
        if (loading && !nextOpen) return;
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
    }

    return (
        <>
            <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={loading}
                onClick={() => setOpen(true)}
            >
                <XCircle className="size-3.5" aria-hidden="true" />
                Hủy vận đơn
            </Button>
            <AlertDialog open={open} onOpenChange={handleOpenChange}>
                <AlertDialogContent className="z-[70] max-w-lg gap-0 overflow-hidden p-0">
                    <AlertDialogHeader className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-4 text-left sm:px-7 sm:py-4">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                                <XCircle
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <AlertDialogTitle>
                                    Hủy vận đơn?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="mt-1.5 leading-5">
                                    Đơn hàng sẽ được hủy và số lượng sản phẩm sẽ
                                    được cộng lại vào tồn kho.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-2 px-6 py-4 sm:px-7">
                        <label
                            htmlFor="seller-cancel-reason"
                            className="text-sm font-semibold text-zinc-950"
                        >
                            Lý do hủy vận đơn{' '}
                            <span className="font-normal text-red-500">*</span>
                        </label>
                        <Textarea
                            id="seller-cancel-reason"
                            value={reason}
                            onChange={(event) =>
                                setReason(event.target.value.slice(0, 500))
                            }
                            maxLength={500}
                            placeholder="Ví dụ: Sản phẩm tạm hết hàng, không thể đóng gói..."
                            className="min-h-28 resize-none rounded-xl border-zinc-200"
                            autoFocus
                        />
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>
                                Lý do sẽ được lưu trong lịch sử đơn hàng.
                            </span>
                            <span>{reason.length}/500</span>
                        </div>
                    </div>

                    <AlertDialogFooter className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 sm:px-7">
                        <AlertDialogCancel
                            disabled={loading}
                            className="h-10 rounded-xl border-zinc-200 bg-white"
                        >
                            Giữ lại vận đơn
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={loading || !normalizedReason}
                            onClick={() => void confirm()}
                            className="h-10 rounded-xl"
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
                                'Xác nhận hủy vận đơn'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
