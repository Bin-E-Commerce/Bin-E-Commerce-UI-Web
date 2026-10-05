// Thẻ trạng thái và wizard ngừng/khôi phục tài liệu; mọi thay đổi trạng thái đều do callback nghiệp vụ thực hiện.

'use client';

import { useState } from 'react';
import {
    Archive,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    FileText,
    History,
    RotateCcw,
    TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress, ProgressLabel } from '@/components/ui/progress';
import {
    getDocumentStatusClass,
    getDocumentStatusLabel,
} from '../utils/seller-knowledge-display';
import type { ArchiveDocumentFlowProps } from '../types/documents/document.types';

// Đặt thao tác ngừng/khôi phục tài liệu trong thẻ cuối modal; chỉ ngừng sử dụng mới cần wizard xác nhận nhiều bước.
// Mỗi bước nêu rõ tài liệu đích, tác động thực tế và điều kiện xác nhận trước khi gọi mutation.
// Callback phải chờ mutation hoàn tất để chỉ hiển thị thành công sau khi API cùng việc đồng bộ cache đã xong.
// Nếu API lỗi, giữ người dùng ở bước xác nhận và hiện lỗi ngay trong dialog để họ có thể thử lại hoặc hủy.
export function ArchiveDocumentFlow({
    document,
    domainLabel,
    isArchiving,
    isRestoring,
    isArchived,
    onArchive,
    onRestore,
}: ArchiveDocumentFlowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [restoreError, setRestoreError] = useState('');

    // Reset tiến trình khi mở/đóng; giữ dialog được mount khi cache đổi trạng thái để vẫn báo kết quả thành công.
    function handleOpenChange(open: boolean) {
        if (isArchiving) return;
        setIsOpen(open);
        setStep(1);
        setHasConfirmed(false);
        setErrorMessage('');
    }

    // Chỉ gửi mutation sau xác nhận và khi tài liệu chưa bị ngừng sử dụng bởi luồng khác.
    // Lỗi giữ người dùng ở bước hiện tại; thành công chuyển dialog sang hoàn tất trước khi có thể đóng.
    async function confirmArchive() {
        if (!hasConfirmed || isArchiving || isArchived) return;
        setErrorMessage('');
        try {
            await onArchive(document.id);
            setStep(4);
        } catch {
            setErrorMessage(
                'Chưa thể ngừng sử dụng tài liệu. Hãy kiểm tra trạng thái rồi thử lại.',
            );
        }
    }

    // Khôi phục là thao tác thuận nghịch, nên gọi trực tiếp từ thẻ; lỗi vẫn hiện tại chỗ và mutation báo toast.
    async function restoreDocument() {
        if (!isArchived || isRestoring) return;
        setRestoreError('');
        try {
            await onRestore(document.id);
        } catch {
            setRestoreError(
                'Chưa thể khôi phục tài liệu. Hãy kiểm tra kết nối rồi thử lại.',
            );
        }
    }

    const progressValue = step === 1 ? 0 : step === 2 ? 50 : 100;

    return (
        <>
            <section
                aria-label="Trạng thái sử dụng tài liệu"
                className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex min-w-0 items-start gap-2.5">
                    <TriangleAlert
                        className="mt-0.5 size-4 shrink-0 text-destructive"
                        aria-hidden="true"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-destructive">
                            {isArchived
                                ? 'Tài liệu đang ngừng sử dụng'
                                : 'Không còn sử dụng tài liệu này?'}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {isArchived
                                ? 'Khôi phục sẽ đưa tài liệu về trạng thái phù hợp với phiên bản và thời hạn đã lưu.'
                                : 'Ngừng sử dụng không xóa nội dung hoặc lịch sử phiên bản.'}
                        </p>
                        {restoreError && (
                            <p
                                role="alert"
                                className="mt-2 text-xs leading-5 text-destructive"
                            >
                                {restoreError}
                            </p>
                        )}
                    </div>
                </div>
                {isArchived ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 bg-background"
                        onClick={() => void restoreDocument()}
                        disabled={isRestoring}
                    >
                        <RotateCcw aria-hidden="true" />
                        {isRestoring ? 'Đang khôi phục…' : 'Khôi phục tài liệu'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 border-destructive/30 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleOpenChange(true)}
                        disabled={isArchiving}
                    >
                        <Archive aria-hidden="true" />
                        Ngừng sử dụng
                    </Button>
                )}
            </section>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    className="flex max-h-[min(88vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0"
                    showCloseButton={!isArchiving && step !== 4}
                >
                    <DialogHeader className="border-b px-6 py-5 pr-14">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-foreground">
                                {step === 4 ? (
                                    <CheckCircle2
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Archive
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                )}
                            </span>
                            <div className="min-w-0">
                                <DialogTitle className="text-lg font-semibold">
                                    {step === 4
                                        ? 'Đã ngừng sử dụng tài liệu'
                                        : 'Ngừng sử dụng tài liệu'}
                                </DialogTitle>
                                <DialogDescription className="mt-1 leading-5">
                                    {step === 4
                                        ? 'Tiến trình đã hoàn tất.'
                                        : 'Làm theo từng bước để kiểm tra tác động trước khi xác nhận.'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 space-y-5 overflow-y-auto px-6 py-5">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Bước {Math.min(step, 3)} / 3</span>
                                <span>
                                    {step === 1
                                        ? 'Kiểm tra tài liệu'
                                        : step === 2
                                          ? 'Xem tác động'
                                          : step === 3
                                            ? 'Xác nhận'
                                            : 'Hoàn tất'}
                                </span>
                            </div>
                            <Progress
                                aria-label="Tiến trình ngừng sử dụng tài liệu"
                                value={progressValue}
                                className="gap-0"
                            >
                                <ProgressLabel className="sr-only">
                                    Tiến trình ngừng sử dụng tài liệu
                                </ProgressLabel>
                            </Progress>
                            <ol
                                aria-label="Các bước ngừng sử dụng tài liệu"
                                className="grid grid-cols-3 gap-2"
                            >
                                <li
                                    aria-current={
                                        step === 1 ? 'step' : undefined
                                    }
                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${step === 1 ? 'border-foreground/20 bg-muted/50 font-medium text-foreground' : step > 1 ? 'border-border bg-background text-foreground' : 'border-transparent text-muted-foreground'}`}
                                >
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                                        {step > 1 ? <Check /> : '1'}
                                    </span>
                                    <span>Kiểm tra</span>
                                </li>
                                <li
                                    aria-current={
                                        step === 2 ? 'step' : undefined
                                    }
                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${step === 2 ? 'border-foreground/20 bg-muted/50 font-medium text-foreground' : step > 2 ? 'border-border bg-background text-foreground' : 'border-transparent text-muted-foreground'}`}
                                >
                                    <span
                                        className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${step > 2 ? 'bg-foreground text-background' : step === 2 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        {step > 2 ? <Check /> : '2'}
                                    </span>
                                    <span>Tác động</span>
                                </li>
                                <li
                                    aria-current={
                                        step === 3 ? 'step' : undefined
                                    }
                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${step === 3 ? 'border-foreground/20 bg-muted/50 font-medium text-foreground' : step > 3 ? 'border-border bg-background text-foreground' : 'border-transparent text-muted-foreground'}`}
                                >
                                    <span
                                        className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${step >= 3 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        {step > 3 ? <Check /> : '3'}
                                    </span>
                                    <span>Xác nhận</span>
                                </li>
                            </ol>
                        </div>

                        {step === 1 && (
                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-semibold">
                                        Bước 1 · Kiểm tra tài liệu
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                        Hãy chắc chắn đây là tài liệu bạn muốn
                                        ngừng sử dụng.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                                        <FileText
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="break-words font-medium">
                                            {document.title}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Nhóm: {domainLabel}
                                        </p>
                                        <span
                                            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getDocumentStatusClass(document.status)}`}
                                        >
                                            {getDocumentStatusLabel(
                                                document.status,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {step === 2 && (
                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-semibold">
                                        Bước 2 · Tác động khi ngừng sử dụng
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                        Trạng thái quản lý của tài liệu sẽ đổi
                                        thành “Ngừng sử dụng”.
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-start gap-3">
                                        <History
                                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm leading-6">
                                            Nội dung Markdown và lịch sử phiên
                                            bản được giữ lại; thao tác này không
                                            xóa dữ liệu đã lưu.
                                        </p>
                                    </div>
                                    {document.publishedRevisionId ? (
                                        <div className="mt-3 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-5">
                                            <TriangleAlert
                                                className="mt-0.5 size-4 shrink-0 text-amber-700"
                                                aria-hidden="true"
                                            />
                                            <p>
                                                Tài liệu có phiên bản đã xuất
                                                bản. Trạng thái này không xóa
                                                các điểm dữ liệu đã ghi trong
                                                kho vector. Nếu muốn gỡ nội dung
                                                khỏi truy xuất, cần xử lý chỉ
                                                mục riêng.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-3 rounded-lg border bg-background px-3 py-2 text-sm leading-5 text-muted-foreground">
                                            Tài liệu chưa có phiên bản xuất bản,
                                            nên hiện chưa có bản phát hành gắn
                                            với tài liệu này.
                                        </p>
                                    )}
                                </div>
                            </section>
                        )}

                        {step === 3 && (
                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-semibold">
                                        Bước 3 · Xác nhận ngừng sử dụng
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                        Kiểm tra lại lựa chọn cuối cùng trước
                                        khi cập nhật trạng thái.
                                    </p>
                                </div>
                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/30">
                                    <Checkbox
                                        checked={hasConfirmed}
                                        onCheckedChange={(checked) =>
                                            setHasConfirmed(checked === true)
                                        }
                                        className="mt-0.5"
                                    />
                                    <span className="text-sm leading-5">
                                        Tôi đã kiểm tra tài liệu và hiểu tác
                                        động khi ngừng sử dụng.
                                    </span>
                                </label>
                                {errorMessage && (
                                    <p
                                        role="alert"
                                        className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                                    >
                                        {errorMessage}
                                    </p>
                                )}
                            </section>
                        )}

                        {step === 4 && (
                            <section className="rounded-xl border bg-muted/20 px-5 py-8 text-center">
                                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-foreground text-background">
                                    <CheckCircle2
                                        className="size-6"
                                        aria-hidden="true"
                                    />
                                </span>
                                <h3 className="mt-4 text-lg font-semibold">
                                    Đã ngừng sử dụng thành công
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                    “{document.title}” đã được chuyển sang trạng
                                    thái ngừng sử dụng. Nội dung, lịch sử phiên
                                    bản và dữ liệu đã lập chỉ mục vẫn được giữ.
                                </p>
                            </section>
                        )}
                    </div>

                    <DialogFooter className="border-t px-6 py-4 sm:justify-between">
                        {step === 1 && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                >
                                    Tiếp tục
                                    <ArrowRight aria-hidden="true" />
                                </Button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    <ArrowLeft aria-hidden="true" />
                                    Quay lại
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setStep(3)}
                                >
                                    Tiếp tục
                                    <ArrowRight aria-hidden="true" />
                                </Button>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setErrorMessage('');
                                        setStep(2);
                                    }}
                                    disabled={isArchiving}
                                >
                                    <ArrowLeft aria-hidden="true" />
                                    Quay lại
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => void confirmArchive()}
                                    disabled={
                                        !hasConfirmed ||
                                        isArchiving ||
                                        isArchived
                                    }
                                >
                                    <Archive aria-hidden="true" />
                                    {isArchiving
                                        ? 'Đang cập nhật…'
                                        : 'Xác nhận ngừng sử dụng'}
                                </Button>
                            </>
                        )}
                        {step === 4 && (
                            <Button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                            >
                                Hoàn tất
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
