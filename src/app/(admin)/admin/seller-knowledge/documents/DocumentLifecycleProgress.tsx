// Theo dõi vòng đời tài liệu trong workspace; chỉ trình bày trạng thái đã lưu và điều hướng tới bước kế tiếp.
'use client';

import { ArrowRight, Check, CircleDot, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress, ProgressLabel } from '@/components/ui/progress';
import type { DocumentLifecycleProgressProps } from '../types/documents/document.types';

// Hiển thị tiến trình từ bản nháp đến lúc BinGPT dùng tài liệu, dựa trên revision mới nhất và trạng thái nhóm.
// Mỗi bước kiểm tra/xuất bản có CTA ngay trong thẻ của nó để người dùng biết cách tiếp tục.
// Nhóm chưa hoạt động chỉ chặn việc BinGPT dùng tài liệu; không chặn admin kiểm tra hoặc xuất bản.
// Trạng thái ngừng sử dụng của tài liệu được trình bày ở thẻ cảnh báo riêng cuối modal, không trộn vào tiến trình.
export function DocumentLifecycleProgress({
    document,
    latestRevision,
    isContentChecked,
    domainStatus,
    onContinue,
}: DocumentLifecycleProgressProps) {
    const isLatestRevisionPublished = Boolean(
        latestRevision && document.publishedRevisionId === latestRevision.id,
    );
    // Khi tạo revision nháp mới, document vẫn giữ trạng thái PUBLISHED vì phiên bản cũ tiếp tục phục vụ đến lần publish kế tiếp.
    const isInUse =
        document.status === 'PUBLISHED' && domainStatus === 'ACTIVE';
    const needsNewRevision = document.status === 'EXPIRED';
    const hasPendingRevision = Boolean(
        latestRevision && !isLatestRevisionPublished,
    );
    const steps = [
        {
            title: 'Tạo tài liệu',
            description: 'Bản nháp đã được lưu, chưa xuất bản.',
            complete: true,
        },
        {
            title: 'Kiểm tra nội dung',
            description: isContentChecked
                ? 'Nội dung đã đạt kiểm tra.'
                : 'Mở bản nháp để rà soát và thử nội dung.',
            complete: isContentChecked,
        },
        {
            title: 'Xuất bản',
            description: isLatestRevisionPublished
                ? 'Bản mới nhất đã phát hành.'
                : 'Sau khi kiểm tra, mở nội dung và chọn Xuất bản.',
            complete: isLatestRevisionPublished,
        },
        {
            title: 'Đang sử dụng',
            // Tách kết quả phát hành khỏi trạng thái nhóm để chỉ rõ người dùng cần kích hoạt hay khôi phục nhóm.
            description: isInUse
                ? isLatestRevisionPublished
                    ? 'BinGPT đang dùng bản mới nhất.'
                    : 'BinGPT vẫn dùng bản đã phát hành trước đó.'
                : isLatestRevisionPublished && domainStatus === 'ARCHIVED'
                  ? 'Tài liệu đã xuất bản nhưng nhóm đang ngừng sử dụng. Bấm “Khôi phục nhóm” ở cuối cửa sổ để BinGPT dùng tài liệu.'
                  : isLatestRevisionPublished && domainStatus === 'DRAFT'
                    ? 'Tài liệu đã xuất bản nhưng nhóm chưa được kích hoạt. Bấm “Kích hoạt nhóm” ở cuối cửa sổ để BinGPT dùng tài liệu.'
                    : 'Cần bản phát hành mới nhất và nhóm đang hoạt động.',
            complete: isInUse,
        },
    ];
    const completedSteps = steps.filter((step) => step.complete).length;
    const currentStepIndex = steps.findIndex((step) => !step.complete);
    // Tài liệu hết hiệu lực cần lối riêng để mở nội dung và bắt đầu revision thay thế ở bước cuối.
    const canCreateReplacement = Boolean(
        latestRevision &&
        document.status !== 'ARCHIVED' &&
        needsNewRevision &&
        currentStepIndex === 3,
    );

    return (
        <section
            aria-labelledby="document-lifecycle-heading"
            className="rounded-xl border bg-muted/15 p-4 sm:p-5"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-foreground">
                        <Workflow className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3
                            id="document-lifecycle-heading"
                            className="font-semibold"
                        >
                            Tiến trình tài liệu
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                            Theo dõi từ lúc tạo bản nháp đến khi BinGPT sử dụng.
                        </p>
                    </div>
                </div>
                <span className="w-fit rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    {document.status === 'ARCHIVED'
                        ? 'Ngừng sử dụng'
                        : document.status === 'EXPIRED'
                          ? 'Đã hết hiệu lực'
                          : isInUse
                            ? hasPendingRevision
                                ? 'Đang dùng · có bản nháp mới'
                                : 'Đang sử dụng'
                            : `${completedSteps}/4 bước hoàn tất`}
                </span>
            </div>

            <div className="mt-5 space-y-3">
                <Progress
                    aria-label="Tiến trình tài liệu"
                    value={(completedSteps / steps.length) * 100}
                >
                    <ProgressLabel className="sr-only">
                        {completedSteps} trên 4 bước hoàn tất
                    </ProgressLabel>
                </Progress>
                <ol
                    aria-label="Các bước sử dụng tài liệu"
                    className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {steps.map((step, index) => {
                        const isCurrent = index === currentStepIndex;

                        return (
                            <li
                                key={step.title}
                                aria-current={isCurrent ? 'step' : undefined}
                                className={`flex min-w-0 items-start gap-3 rounded-lg border p-3 ${step.complete ? 'border-border bg-background' : isCurrent ? 'border-foreground/20 bg-background shadow-sm' : 'border-dashed bg-background/60'}`}
                            >
                                <span
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full ${step.complete ? 'bg-foreground text-background' : isCurrent ? 'bg-muted text-foreground' : 'bg-muted/60 text-muted-foreground'}`}
                                >
                                    {step.complete ? (
                                        <Check
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    ) : isCurrent ? (
                                        <CircleDot
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <span className="text-xs font-semibold">
                                            {index + 1}
                                        </span>
                                    )}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium">
                                        {step.title}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                        {step.description}
                                    </span>
                                    {/* Mở bản mới nhất ngay từ bước đang chờ; việc kiểm tra không phụ thuộc trạng thái kích hoạt nhóm. */}
                                    {document.status !== 'ARCHIVED' &&
                                        isCurrent &&
                                        !step.complete &&
                                        (index === 1 || index === 2) && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 h-8"
                                                onClick={onContinue}
                                                disabled={!latestRevision}
                                            >
                                                {!latestRevision
                                                    ? 'Đang tải bản nháp…'
                                                    : index === 1
                                                      ? 'Bắt đầu kiểm tra'
                                                      : 'Mở bước xuất bản'}
                                                <ArrowRight aria-hidden="true" />
                                            </Button>
                                        )}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {document.status === 'ARCHIVED' ? (
                <p className="mt-4 rounded-lg border bg-background px-3 py-2 text-sm leading-5 text-muted-foreground">
                    Tài liệu đã ngừng sử dụng trong phần quản lý. Dữ liệu đã lập
                    chỉ mục vẫn được giữ; muốn gỡ nội dung khỏi truy xuất, cần
                    xử lý chỉ mục riêng.
                </p>
            ) : document.status === 'EXPIRED' ? (
                <p className="mt-4 rounded-lg border bg-background px-3 py-2 text-sm leading-5 text-muted-foreground">
                    Tài liệu đã hết hiệu lực. Hãy tạo phiên bản mới nếu cần phát
                    hành lại.
                </p>
            ) : null}

            {canCreateReplacement ? (
                <div className="mt-4 flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-5 text-muted-foreground">
                        Tài liệu đã hết hiệu lực. Mở nội dung hiện tại để bắt
                        đầu tạo phiên bản thay thế.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        onClick={onContinue}
                    >
                        Mở nội dung
                        <ArrowRight aria-hidden="true" />
                    </Button>
                </div>
            ) : null}
        </section>
    );
}
