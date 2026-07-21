import { CheckCircle2, Clock3, FilePenLine, PencilLine, Store } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { SellerApplicationStatus } from '@/services/seller';

interface SubmissionSuccessProps {
    status: SellerApplicationStatus | null;
    syncingSellerAccess: boolean;
    onEnterSellerCenter: () => void;
    onEdit: () => void;
}

// Màn hình trạng thái dùng cả sau submit và sau refresh, đồng thời chờ quyền Seller Center sẵn sàng trước khi chuyển trang.
export function SubmissionSuccess({
    status,
    syncingSellerAccess,
    onEnterSellerCenter,
    onEdit,
}: SubmissionSuccessProps) {
    const approved = status === 'approved';
    const Icon = approved ? CheckCircle2 : Clock3;

    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-950 text-white">
                <Icon className="size-7" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-zinc-950">
                {approved ? 'Hồ sơ đã được duyệt' : 'Hồ sơ đang chờ duyệt'}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                {approved
                    ? 'Shop của bạn đã được kích hoạt. Bạn có thể vào Seller Center để tiếp tục thiết lập vận hành.'
                    : 'Bin đã nhận hồ sơ đăng ký người bán của bạn. Chúng tôi sẽ gửi email xác nhận và thông báo tiếp khi hồ sơ được duyệt hoặc cần bổ sung thông tin.'}
            </p>

            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                {approved ? (
                    <Button
                        type="button"
                        className="h-10 rounded-full px-5"
                        disabled={syncingSellerAccess}
                        onClick={onEnterSellerCenter}
                    >
                        <Store className="size-4" />
                        {syncingSellerAccess
                            ? 'Đang mở Seller Center...'
                            : 'Vào Seller Center'}
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-full bg-white px-5"
                            >
                                <PencilLine className="size-4" />
                                Chỉnh sửa hồ sơ
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <span className="flex size-11 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <FilePenLine className="size-5" />
                            </span>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Mở lại hồ sơ để chỉnh sửa?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="leading-6">
                                    Bản đang chờ duyệt vẫn được giữ nguyên cho đến
                                    khi bạn gửi lại. Nếu tải lại trang trước đó, mọi
                                    thay đổi tạm thời sẽ bị hủy.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Tiếp tục chờ duyệt</AlertDialogCancel>
                                <AlertDialogAction onClick={onEdit}>
                                    Chỉnh sửa hồ sơ
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {!approved ? (
                <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-zinc-500">
                    Thay đổi chỉ được lưu khi bạn hoàn tất và bấm “Gửi lại hồ sơ”.
                </p>
            ) : null}
        </div>
    );
}
