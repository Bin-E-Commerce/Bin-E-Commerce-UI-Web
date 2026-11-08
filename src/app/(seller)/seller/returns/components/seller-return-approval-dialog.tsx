// Dialog xác nhận duyệt yêu cầu hoàn do shop chịu phí; số nợ trong preview chỉ phát sinh nếu hàng hoàn được kiểm tra đạt.

'use client';

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, WalletCards } from 'lucide-react';
import type { SellerReturnApprovalDialogProps } from '../types/seller-return.types';

// Dự báo hai lượt vận chuyển; dialog không ghi sổ và công nợ chỉ phát sinh sau khi seller xác nhận hàng hoàn đạt.
export function SellerReturnApprovalDialog({
    approval,
    pending,
    onClose,
    onConfirm,
}: SellerReturnApprovalDialogProps) {
    if (!approval) return null;

    // Phí ước tính trừ khỏi available balance; phần âm là nợ sau phí, còn ngưỡng là mức khóa hiện tại của backend.
    const availableBalance = Math.round(
        Number(approval.finance.availableBalance),
    );
    const estimatedOutboundFee = Math.round(
        Number(approval.finance.estimatedOutboundShippingFee),
    );
    const estimatedReturnFee = Math.round(
        Number(approval.finance.estimatedReturnShippingFee),
    );
    const estimatedFee = Math.round(
        Number(approval.finance.estimatedShippingFee),
    );
    const projectedBalance = availableBalance - estimatedFee;
    const currentDebt = Math.max(
        0,
        Number(approval.finance.currentDebtBalance),
    );
    const projectedDebt = Math.max(0, -projectedBalance);
    const debtLimit = Number(approval.finance.debtLimit);
    const hasDebtPolicy = debtLimit > 0;
    const debtCapacity = hasDebtPolicy
        ? Math.max(0, debtLimit - currentDebt)
        : 0;
    const debtOverLimit = hasDebtPolicy
        ? Math.max(0, projectedDebt - debtLimit)
        : 0;
    const reachesDebtLimit = hasDebtPolicy && projectedDebt >= debtLimit;

    return (
        <AlertDialog
            open
            onOpenChange={(open) => {
                // Giữ cảnh báo mở trong lúc mutation đang chạy để seller không mất ngữ cảnh nếu request còn pending.
                if (!open && !pending) onClose();
            }}
        >
            <AlertDialogContent className="max-w-lg gap-0 overflow-hidden rounded-2xl p-0">
                <AlertDialogHeader className="border-b border-zinc-100 p-5 pr-12 text-left sm:p-6 sm:pr-12">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <WalletCards
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div>
                            <AlertDialogTitle className="text-lg font-bold">
                                Xác nhận duyệt yêu cầu hoàn
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 leading-5">
                                Shop chịu phí giao ban đầu được hoàn cho khách
                                và phí gửi hàng hoàn về. Kiểm tra ảnh hưởng dự
                                kiến đến ví trước khi tiếp tục.
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-4 p-5 sm:p-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                            <p className="text-xs text-zinc-500">
                                Số dư khả dụng hiện tại
                            </p>
                            <p className="mt-1.5 text-base font-bold tabular-nums text-zinc-950">
                                {availableBalance.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                            <p className="text-xs text-zinc-500">
                                Chiều đi · hoàn phí giao cho khách
                            </p>
                            <p className="mt-1.5 text-base font-bold tabular-nums text-zinc-950">
                                {estimatedOutboundFee.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                            <p className="text-xs text-zinc-500">
                                Chiều về · GHN dự kiến
                            </p>
                            <p className="mt-1.5 text-base font-bold tabular-nums text-zinc-950">
                                {estimatedReturnFee.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                            <p className="text-xs text-amber-900">
                                Tổng shop dự kiến chịu
                            </p>
                            <p className="mt-1.5 text-base font-bold tabular-nums text-amber-950">
                                {estimatedFee.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                            <p className="text-xs text-amber-900">
                                Số dư nếu kiểm tra đạt
                            </p>
                            <p className="mt-1.5 text-base font-bold tabular-nums text-amber-950">
                                {projectedBalance.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                            <p className="text-xs text-amber-900">
                                Nợ dự kiến nếu kiểm tra đạt
                            </p>
                            <p className="mt-1.5 text-base font-bold tabular-nums text-amber-950">
                                {projectedDebt.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>

                    {hasDebtPolicy ? (
                        <div className="rounded-xl border border-zinc-200 px-3.5 py-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-zinc-500">
                                    Ngưỡng khóa tài chính
                                </span>
                                <span className="font-semibold tabular-nums text-zinc-950">
                                    {debtLimit.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-zinc-500">
                                    Nợ hiện tại
                                </span>
                                <span className="font-semibold tabular-nums text-zinc-950">
                                    {currentDebt.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-zinc-500">
                                    Dư địa nợ đến ngưỡng
                                </span>
                                <span className="font-semibold tabular-nums text-zinc-950">
                                    {debtCapacity.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                            Chưa tải được hạn mức nợ của shop. Đóng hộp thoại,
                            tải lại trang ví rồi thử duyệt lại.
                        </p>
                    )}

                    {approval.finance.shopLocked ? (
                        <div className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-900">
                            <AlertTriangle
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            Shop đang bị khóa tài chính do công nợ. Nếu hàng
                            hoàn được kiểm tra đạt, phí thực tế sẽ được ghi nợ
                            theo số GHN chốt.
                        </div>
                    ) : null}

                    {reachesDebtLimit ? (
                        <div className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-900">
                            <AlertTriangle
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <p>
                                Nếu kiểm tra đạt, nợ có thể chạm hoặc vượt
                                ngưỡng khóa shop.
                                {debtOverLimit > 0
                                    ? ` Ước tính vượt ${debtOverLimit.toLocaleString('vi-VN')} đ.`
                                    : ''}{' '}
                                Nếu phí thực tế đưa nợ đến ngưỡng này, shop sẽ
                                được khóa tài chính theo chính sách công nợ.
                            </p>
                        </div>
                    ) : null}

                    <p className="text-xs leading-5 text-zinc-500">
                        Duyệt yêu cầu chưa trừ tiền. Nếu hàng hoàn được kiểm tra
                        đạt, ví shop ghi nợ phí giao ban đầu đủ điều kiện hoàn
                        cho khách và phí GHN thực tế chiều về. Nếu kiểm tra
                        không đạt, shop không bị ghi nợ hai khoản này.
                    </p>
                </div>

                <AlertDialogFooter className="border-t border-zinc-100 bg-zinc-50/70 p-4 sm:p-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onClose}
                        disabled={pending}
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={pending || !hasDebtPolicy}
                        className="bg-zinc-950 text-white hover:bg-zinc-800"
                    >
                        {pending ? 'Đang duyệt...' : 'Xác nhận duyệt'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
