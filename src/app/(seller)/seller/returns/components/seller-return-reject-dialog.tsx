// File này thu thập lý do Seller từ chối yêu cầu hoàn hàng trước khi gửi quyết định về API.
// Dialog chỉ quản lý nội dung nhập và trạng thái hiển thị; mutation và quyền truy cập thuộc component trang.

'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SellerReturnRejectDialogProps {
    open: boolean;
    pending: boolean;
    onClose: () => void;
    onSubmit: (note: string) => void;
}

// Hiển thị dialog bắt buộc nhập lý do để customer nhận được giải thích cụ thể khi yêu cầu bị từ chối.
export function SellerReturnRejectDialog({
    open,
    pending,
    onClose,
    onSubmit,
}: SellerReturnRejectDialogProps) {
    const [note, setNote] = useState('');
    const trimmedNote = note.trim();
    const isValid = trimmedNote.length >= 10;

    // Chặn submit khi lý do quá ngắn; backend vẫn kiểm tra lại để bảo vệ API ngoài browser.
    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (!isValid || pending) return;
        onSubmit(trimmedNote);
    }

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
                if (!pending && event.target === event.currentTarget) onClose();
            }}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="seller-return-reject-title"
                onSubmit={handleSubmit}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 pt-5">
                    <div>
                        <h2
                            id="seller-return-reject-title"
                            className="text-lg font-bold text-zinc-950"
                        >
                            Nhập lý do từ chối
                        </h2>
                        <p className="mt-1 text-sm leading-5 text-zinc-500">
                            Customer sẽ nhìn thấy lý do này trong đơn hàng và
                            nhận qua email.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Đóng hộp thoại từ chối"
                        disabled={pending}
                        onClick={onClose}
                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="px-5 py-5">
                    <label
                        htmlFor="seller-return-reject-note"
                        className="text-sm font-semibold text-zinc-800"
                    >
                        Lý do từ chối{' '}
                        <span
                            className="font-bold text-red-500"
                            aria-hidden="true"
                        >
                            *
                        </span>
                        <span className="sr-only"> bắt buộc</span>
                    </label>
                    <Textarea
                        id="seller-return-reject-note"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        maxLength={500}
                        autoFocus
                        placeholder="Ví dụ: Sản phẩm không có dấu hiệu hư hỏng như nội dung yêu cầu..."
                        className="mt-2 min-h-28 resize-none rounded-xl border-zinc-200"
                        disabled={pending}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                        <span
                            className={
                                trimmedNote.length > 0 && !isValid
                                    ? 'text-red-600'
                                    : 'text-zinc-400'
                            }
                        >
                            Nhập ít nhất 10 ký tự để lý do đủ rõ ràng.
                        </span>
                        <span className="shrink-0 text-zinc-400">
                            {note.length}/500
                        </span>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-4 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={onClose}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isValid || pending}
                        className="bg-zinc-950 text-white hover:bg-zinc-800"
                    >
                        {pending ? 'Đang gửi...' : 'Xác nhận từ chối'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
