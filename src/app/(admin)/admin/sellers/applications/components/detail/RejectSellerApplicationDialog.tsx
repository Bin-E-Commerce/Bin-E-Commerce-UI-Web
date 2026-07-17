'use client';

import { useState } from 'react';
import { Ban, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { SellerApplicationCorrectionTarget } from '@/services/seller';
import { useRejectSellerApplication } from '../../hooks/useRejectSellerApplication';

interface RejectSellerApplicationDialogProps {
    applicationId: string;
    shopName: string;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 1000;

// Thu lý do từ chối trong modal xác nhận để admin không thể vô tình đổi trạng thái mà không hướng dẫn seller cách khắc phục.
export function RejectSellerApplicationDialog({
    applicationId,
    shopName,
}: RejectSellerApplicationDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [correctionTargets, setCorrectionTargets] = useState<
        SellerApplicationCorrectionTarget[]
    >([]);
    const [touched, setTouched] = useState(false);
    const rejectMutation = useRejectSellerApplication(applicationId);
    const normalizedReason = reason.trim();
    const reasonIsValid =
        normalizedReason.length >= MIN_REASON_LENGTH &&
        normalizedReason.length <= MAX_REASON_LENGTH;
    const formIsValid = reasonIsValid && correctionTargets.length > 0;

    // Reset dữ liệu khi đóng để lần thao tác sau không dùng nhầm lý do từ một hồ sơ trước đó.
    const handleOpenChange = (nextOpen: boolean) => {
        if (rejectMutation.isPending) return;
        setOpen(nextOpen);

        if (!nextOpen) {
            setReason('');
            setCorrectionTargets([]);
            setTouched(false);
        }
    };

    // Chỉ gọi API sau khi lý do hợp lệ; modal đóng khi server xác nhận hồ sơ đã chuyển sang rejected.
    const handleReject = async () => {
        setTouched(true);
        if (!formIsValid) return;

        try {
            await rejectMutation.mutateAsync({
                reason: normalizedReason,
                correctionTargets,
            });
            toast.success('Đã từ chối hồ sơ và gửi thông báo cho người bán.');
            handleOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    // Bật hoặc tắt một nhóm cần chỉnh sửa mà vẫn giữ các lựa chọn còn lại để admin có thể yêu cầu nhiều nội dung trong một lần review.
    const toggleCorrectionTarget = (
        target: SellerApplicationCorrectionTarget,
    ) => {
        setCorrectionTargets((current) =>
            current.includes(target)
                ? current.filter((item) => item !== target)
                : [...current, target],
        );
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                    <Ban className="size-4" />
                    Từ chối hồ sơ
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                        <Ban className="size-5" />
                    </div>
                    <AlertDialogTitle>Từ chối hồ sơ {shopName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hồ sơ sẽ được trả lại cho người bán. Hãy ghi rõ nội dung cần sửa để họ có thể bổ sung và gửi lại.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <fieldset className="space-y-2">
                    <legend className="text-sm font-medium text-zinc-900">
                        Nội dung cần chỉnh sửa <span className="text-red-600">*</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <CorrectionTargetOption
                            label="Thông tin shop"
                            description="Tên, đường dẫn, ngành hàng hoặc mô tả"
                            checked={correctionTargets.includes('shop_information')}
                            onChange={() => toggleCorrectionTarget('shop_information')}
                        />
                        <CorrectionTargetOption
                            label="Logo shop"
                            description="Ảnh nhận diện của cửa hàng"
                            checked={correctionTargets.includes('shop_logo')}
                            onChange={() => toggleCorrectionTarget('shop_logo')}
                        />
                        <CorrectionTargetOption
                            label="Thông tin định danh"
                            description="Họ tên, CCCD, mã số thuế hoặc liên hệ"
                            checked={correctionTargets.includes('seller_identity')}
                            onChange={() => toggleCorrectionTarget('seller_identity')}
                        />
                        <CorrectionTargetOption
                            label="Giấy tờ xác minh"
                            description="Ảnh CCCD hoặc giấy phép kinh doanh"
                            checked={correctionTargets.includes('verification_documents')}
                            onChange={() => toggleCorrectionTarget('verification_documents')}
                        />
                        <CorrectionTargetOption
                            label="Địa chỉ lấy hàng"
                            description="Người liên hệ và địa chỉ kho"
                            checked={correctionTargets.includes('pickup_address')}
                            onChange={() => toggleCorrectionTarget('pickup_address')}
                        />
                        <CorrectionTargetOption
                            label="Thông tin thanh toán"
                            description="Ngân hàng và tài khoản nhận tiền"
                            checked={correctionTargets.includes('payout_information')}
                            onChange={() => toggleCorrectionTarget('payout_information')}
                        />
                    </div>
                    {touched && correctionTargets.length === 0 ? (
                        <p className="text-xs text-red-600">
                            Vui lòng chọn ít nhất một nội dung cần chỉnh sửa.
                        </p>
                    ) : null}
                </fieldset>

                <div className="space-y-2">
                    <label htmlFor="seller-rejection-reason" className="text-sm font-medium text-zinc-900">
                        Lý do từ chối <span className="text-red-600">*</span>
                    </label>
                    <Textarea
                        id="seller-rejection-reason"
                        value={reason}
                        maxLength={MAX_REASON_LENGTH}
                        rows={5}
                        aria-invalid={touched && !reasonIsValid}
                        placeholder="Ví dụ: Ảnh mặt sau CCCD bị mờ, vui lòng tải lại ảnh rõ đủ bốn góc giấy tờ."
                        className="min-h-32 resize-none"
                        onBlur={() => setTouched(true)}
                        onChange={(event) => setReason(event.target.value)}
                    />
                    <div className="flex items-start justify-between gap-4 text-xs">
                        <p className="text-red-600">
                            {touched && normalizedReason.length < MIN_REASON_LENGTH
                                ? `Vui lòng nhập ít nhất ${MIN_REASON_LENGTH} ký tự.`
                                : null}
                        </p>
                        <span className="ml-auto shrink-0 text-zinc-400">
                            {reason.length}/{MAX_REASON_LENGTH}
                        </span>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={rejectMutation.isPending}>
                        Hủy
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={!formIsValid || rejectMutation.isPending}
                        onClick={handleReject}
                    >
                        {rejectMutation.isPending ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Ban className="size-4" />
                        )}
                        Xác nhận từ chối
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface CorrectionTargetOptionProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}

// Dùng checkbox đúng ngữ nghĩa cho lựa chọn nhiều nhóm và giữ toàn bộ hàng có thể bấm để thao tác nhanh trong modal.
function CorrectionTargetOption({
    label,
    description,
    checked,
    onChange,
}: CorrectionTargetOptionProps) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50">
            <input
                type="checkbox"
                checked={checked}
                className="mt-0.5 size-4 accent-zinc-950"
                onChange={onChange}
            />
            <span>
                <span className="block text-sm font-medium text-zinc-950">
                    {label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                    {description}
                </span>
            </span>
        </label>
    );
}
