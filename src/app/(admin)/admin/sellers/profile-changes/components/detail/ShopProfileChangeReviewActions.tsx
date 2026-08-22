'use client';

import { BadgeCheck, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
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
import {
    useApproveShopProfileChangeRequest,
    useRejectShopProfileChangeRequest,
} from '../../hooks/useShopProfileChangeRequest';

interface ShopProfileChangeReviewActionsProps {
    requestId: string;
    shopName: string;
}

// Cung cấp hai quyết định cuối cùng và giữ từng modal độc lập để ghi chú duyệt không bị lẫn với lý do từ chối.
export function ShopProfileChangeReviewActions({
    requestId,
    shopName,
}: ShopProfileChangeReviewActionsProps) {
    return (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <ApproveChangeDialog requestId={requestId} shopName={shopName} />
            <RejectChangeDialog requestId={requestId} shopName={shopName} />
        </div>
    );
}

// Xác nhận duyệt trước khi backend ghi dữ liệu nhạy cảm vào hồ sơ đang có hiệu lực.
function ApproveChangeDialog({
    requestId,
    shopName,
}: ShopProfileChangeReviewActionsProps) {
    const [open, setOpen] = useState(false);
    const [reviewNote, setReviewNote] = useState('');
    const mutation = useApproveShopProfileChangeRequest(requestId);

    // Khóa modal trong lúc gửi command để tránh admin hiểu nhầm thao tác đã bị hủy giữa chừng.
    const handleOpenChange = (nextOpen: boolean) => {
        if (mutation.isPending) return;
        setOpen(nextOpen);
        if (!nextOpen) setReviewNote('');
    };

    // Chỉ đóng modal sau khi transaction phía backend áp dụng thành công toàn bộ thay đổi.
    const handleApprove = async () => {
        try {
            await mutation.mutateAsync({
                reviewNote: reviewNote.trim() || undefined,
            });
            toast.success('Đã duyệt và cập nhật hồ sơ shop.');
            handleOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    className="w-full bg-zinc-950 text-white hover:bg-zinc-800"
                >
                    <BadgeCheck className="size-4" />
                    Chấp thuận thay đổi
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <span className="flex size-11 items-center justify-center rounded-md bg-zinc-950 text-white">
                        <BadgeCheck className="size-5" />
                    </span>
                    <AlertDialogTitle>
                        Duyệt thay đổi của {shopName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Các giá trị đề nghị sẽ thay thế dữ liệu thuế, thanh toán
                        hoặc định danh đang dùng.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div>
                    <label
                        htmlFor="approve-change-note"
                        className="text-sm font-medium text-zinc-800"
                    >
                        Ghi chú duyệt
                    </label>
                    <Textarea
                        id="approve-change-note"
                        rows={4}
                        className="mt-2 resize-none"
                        placeholder="Ghi chú nội bộ hoặc hướng dẫn seller sau khi duyệt (không bắt buộc)."
                        value={reviewNote}
                        maxLength={1000}
                        disabled={mutation.isPending}
                        onChange={(event) => setReviewNote(event.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>
                        Hủy
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={handleApprove}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <BadgeCheck className="size-4" />
                        )}
                        Xác nhận duyệt
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Bắt buộc lý do đủ rõ trước khi từ chối để seller biết chính xác nội dung cần sửa trong lần gửi tiếp theo.
function RejectChangeDialog({
    requestId,
    shopName,
}: ShopProfileChangeReviewActionsProps) {
    const [open, setOpen] = useState(false);
    const [reviewNote, setReviewNote] = useState('');
    const [touched, setTouched] = useState(false);
    const mutation = useRejectShopProfileChangeRequest(requestId);
    const normalizedNote = reviewNote.trim();
    const valid = normalizedNote.length >= 10 && normalizedNote.length <= 1000;

    // Dọn dữ liệu modal sau khi đóng để không dùng nhầm lý do của một lần review trước.
    const handleOpenChange = (nextOpen: boolean) => {
        if (mutation.isPending) return;
        setOpen(nextOpen);
        if (!nextOpen) {
            setReviewNote('');
            setTouched(false);
        }
    };

    // Giữ modal mở nếu dữ liệu chưa hợp lệ hoặc backend từ chối command để admin không mất nội dung đang nhập.
    const handleReject = async () => {
        setTouched(true);
        if (!valid) return;

        try {
            await mutation.mutateAsync({ reviewNote: normalizedNote });
            toast.success('Đã từ chối yêu cầu thay đổi hồ sơ shop.');
            handleOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                >
                    <XCircle className="size-4" />
                    Từ chối yêu cầu
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <span className="flex size-11 items-center justify-center rounded-md bg-red-50 text-red-700 ring-1 ring-red-200">
                        <XCircle className="size-5" />
                    </span>
                    <AlertDialogTitle>
                        Từ chối thay đổi của {shopName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Hồ sơ hiện tại được giữ nguyên. Seller sẽ nhận lý do để
                        chuẩn bị yêu cầu mới.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div>
                    <label
                        htmlFor="reject-change-note"
                        className="text-sm font-medium text-zinc-800"
                    >
                        Lý do từ chối <span className="text-red-600">*</span>
                    </label>
                    <Textarea
                        id="reject-change-note"
                        rows={5}
                        className="mt-2 resize-none"
                        placeholder="Nêu rõ field hoặc giấy tờ chưa khớp để seller biết cách sửa."
                        value={reviewNote}
                        maxLength={1000}
                        aria-invalid={touched && !valid}
                        disabled={mutation.isPending}
                        onChange={(event) => setReviewNote(event.target.value)}
                    />
                    {touched && !valid ? (
                        <p className="mt-2 text-sm text-red-600">
                            Lý do cần từ 10 đến 1000 ký tự.
                        </p>
                    ) : null}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>
                        Hủy
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={mutation.isPending}
                        onClick={handleReject}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <XCircle className="size-4" />
                        )}
                        Xác nhận từ chối
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
