'use client';

import { useState, type ReactNode } from 'react';
import { BadgeCheck, LoaderCircle } from 'lucide-react';
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
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useApproveSellerApplication } from '../../hooks/useApproveSellerApplication';

interface ApproveSellerApplicationDialogProps {
    applicationId: string;
    shopName: string;
    children?: ReactNode;
}

// Xác nhận lần cuối trước khi duyệt vì thao tác này kích hoạt quyền Seller Center và không nên xảy ra do bấm nhầm.
export function ApproveSellerApplicationDialog({
    applicationId,
    shopName,
    children,
}: ApproveSellerApplicationDialogProps) {
    const [open, setOpen] = useState(false);
    const approveMutation = useApproveSellerApplication(applicationId);

    // Không cho đóng modal khi command đang chạy để admin không hiểu nhầm request đã bị hủy giữa chừng.
    const handleOpenChange = (nextOpen: boolean) => {
        if (approveMutation.isPending) return;
        setOpen(nextOpen);
    };

    // Gọi command duyệt một lần; response thành công cập nhật cache, còn backend tiếp tục cấp role và gửi thông báo.
    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync();
            toast.success(
                'Hồ sơ đã được duyệt và quyền người bán đang được kích hoạt.',
            );
            setOpen(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {children ?? (
                    <Button type="button" className="rounded-full">
                        <BadgeCheck className="size-4" />
                        Chấp thuận hồ sơ
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <BadgeCheck className="size-5" />
                    </div>
                    <AlertDialogTitle>
                        Chấp thuận hồ sơ {shopName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Hồ sơ sẽ chuyển sang trạng thái đã duyệt. Người dùng
                        được cấp quyền truy cập Seller Center và nhận email xác
                        nhận.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                    Hãy chắc chắn thông tin định danh, giấy tờ xác minh, địa chỉ
                    lấy hàng và tài khoản thanh toán đã được đối chiếu đầy đủ.
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={approveMutation.isPending}>
                        Hủy
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        disabled={approveMutation.isPending}
                        onClick={handleApprove}
                    >
                        {approveMutation.isPending ? (
                            <LoaderCircle className="size-4 animate-spin" />
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
