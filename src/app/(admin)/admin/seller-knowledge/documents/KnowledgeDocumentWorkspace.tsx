// Vùng chi tiết tài liệu: chỉnh sửa, xem nội dung đã lưu, kiểm tra tìm kiếm và theo dõi revision.

import { useRef, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import {
    ArrowLeft,
    ChevronDown,
    Code2,
    FileText,
    FlaskConical,
    History,
    LayoutDashboard,
    Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArchiveDocumentFlow } from './ArchiveDocumentFlow';
import { DomainRecoveryNotice } from './DomainRecoveryNotice';
import { DocumentLifecycleProgress } from './DocumentLifecycleProgress';
import { DocumentRevisionHistory } from './DocumentRevisionHistory';
import { MarkdownDocumentEditor } from './MarkdownDocumentEditor';
import { KnowledgeMarkdownPreview } from './KnowledgeMarkdownPreview';
import {
    createKnowledgeSlug,
    formatKnowledgeDate,
    getDocumentStatusClass,
    getDocumentStatusLabel,
} from '../utils/seller-knowledge-display';
import type { KnowledgeDocumentWorkspaceProps } from '../types/documents/document.types';

// Hiển thị chi tiết, chỉnh sửa và lịch sử; tiêu đề tài liệu do dialog sở hữu nên workspace không lặp lại.
// Dữ liệu nhập do React Hook Form ở trang sở hữu để guard điều hướng dùng cùng trạng thái dirty.
// Domain archived được hiện để soạn và xuất bản nội dung khôi phục, nhưng planner chỉ dùng domain sau khi được kích hoạt lại.
// Section chỉ điều khiển nội dung đang xem, còn quyền publish/rollback và lưu revision vẫn do trang điều phối.
// Workspace đăng ký input trực tiếp vào form context được truyền xuống, nên validation và dữ liệu submit không bị lệch nhau.
export function KnowledgeDocumentWorkspace({
    document,
    revisions,
    domains,
    selectedRevisionId,
    formMethods,
    isCreating,
    isEditing,
    isArchiving,
    isRestoringDocument,
    isActivatingDomain,
    isTesting,
    isRollingBack,
    preview,
    testMatches,
    hasTestResult,
    testQuestion,
    rollbackReason,
    onSectionChange,
    onTestQuestionChange,
    onRollbackReasonChange,
    onStartEditing,
    onLoadPreview,
    onTestDraft,
    onArchive,
    onRestoreDocument,
    onActivateDomain,
    onRollback,
    section,
}: KnowledgeDocumentWorkspaceProps) {
    const [watchedTitle, watchedSlug, watchedDomainCode] = useWatch({
        control: formMethods.control,
        name: ['title', 'slug', 'domainCode'],
    });
    const [fileError, setFileError] = useState('');
    const markdownFileInput = useRef<HTMLInputElement>(null);
    const { control, register, setValue, formState } = formMethods;
    const selectedRevision =
        revisions.find((revision) => revision.id === selectedRevisionId) ??
        revisions[0] ??
        null;
    // Lịch sử API sắp revision mới nhất lên đầu; tiến trình bám phiên bản mới nhất kể cả khi người dùng đang xem bản cũ.
    const latestRevision = revisions[0] ?? null;
    const publishedRevision = revisions.find(
        (revision) => revision.id === document?.publishedRevisionId,
    );
    const documentDomain = domains.find(
        (domain) => domain.code === document?.domainCode,
    );
    const isLatestRevisionChecked = Boolean(
        latestRevision &&
        (latestRevision.status === 'VALIDATED' ||
            latestRevision.status === 'PUBLISHED' ||
            latestRevision.status === 'SUPERSEDED' ||
            (selectedRevisionId === latestRevision.id &&
                preview?.validation.valid)),
    );
    const selectedDomain = domains.find(
        (domain) => domain.code === watchedDomainCode,
    );
    // Cập nhật tên và mã sinh tự động cùng lúc; mã admin đã tùy chỉnh được giữ nguyên để tránh đổi định danh ngoài ý muốn.
    function updateTitle(nextTitle: string) {
        const currentGeneratedSlug = createKnowledgeSlug(watchedTitle ?? '');
        const generatedSlug = createKnowledgeSlug(nextTitle);
        setValue('title', nextTitle, {
            shouldDirty: true,
            shouldValidate: formState.isSubmitted,
        });
        if (!watchedSlug || watchedSlug === currentGeneratedSlug) {
            setValue('slug', generatedSlug, {
                shouldDirty: true,
                shouldValidate: formState.isSubmitted,
            });
        }
    }

    // Chỉ nhận Markdown nhỏ; nội dung file được đưa vào cùng trường RHF để dùng chung validation và trạng thái chưa lưu.
    async function handleMarkdownFile(file?: File) {
        setFileError('');
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.md')) {
            setFileError('Chỉ hỗ trợ tệp Markdown có đuôi .md.');
            return;
        }
        if (file.size > 64 * 1024) {
            setFileError('Tệp Markdown không được vượt quá 64 KB.');
            return;
        }
        setValue('markdown', await file.text(), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: formState.isSubmitted,
        });
    }

    // Mở đúng revision mới nhất thay vì revision lịch sử đang chọn để nút tiến trình luôn đưa tới bước cần làm.
    function openLifecycleContent() {
        if (!latestRevision) return;
        onSectionChange('content');
        onLoadPreview(latestRevision.id);
    }

    if (!document && !isCreating) {
        return (
            <Card className="flex min-h-[420px] items-center justify-center border-dashed bg-muted/10">
                <CardContent className="max-w-md px-6 py-12 text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
                        <FileText className="size-6 text-muted-foreground" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold">
                        Chọn một tài liệu để xem chi tiết
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Tại đây bạn có thể chỉnh sửa nội dung, kiểm tra các đoạn
                        tìm được và xem lịch sử xuất bản.
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground xl:hidden">
                        Trên điện thoại, chọn tài liệu từ danh sách phía trên.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {document && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                    {(isCreating || isEditing) && (
                        <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getDocumentStatusClass(document.status)}`}
                        >
                            {getDocumentStatusLabel(document.status)}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {documentDomain?.label ?? 'Chưa gán nhóm'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Cập nhật {formatKnowledgeDate(document.updatedAt)}
                    </span>
                </div>
            )}

            {!isCreating && !isEditing && document && (
                <DocumentLifecycleProgress
                    document={document}
                    latestRevision={latestRevision}
                    isContentChecked={isLatestRevisionChecked}
                    domainStatus={documentDomain?.status}
                    onContinue={openLifecycleContent}
                />
            )}

            <Card className="gap-2 border-0 bg-transparent shadow-none">
                <CardContent>
                    {/* Chỉ giữ điều hướng khi có nhiều màn hình; tạo mới/nội dung là một luồng đơn nên không cần tab đứng riêng. */}
                    {!isCreating && section !== 'content' && (
                        <div
                            role="tablist"
                            aria-label="Khu vực tài liệu"
                            className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="space-y-0.5">
                                <p className="text-sm font-semibold tracking-tight">
                                    Nội dung tài liệu
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Xem thông tin hoặc lịch sử cập nhật
                                </p>
                            </div>
                            <div className="inline-flex w-full rounded-xl border bg-muted/50 p-1 sm:w-auto">
                                <Button
                                    type="button"
                                    role="tab"
                                    id="document-tab-overview"
                                    aria-controls="document-panel-overview"
                                    aria-selected={section === 'overview'}
                                    variant="ghost"
                                    onClick={() => onSectionChange('overview')}
                                    className={`h-9 flex-1 justify-center rounded-lg px-3 sm:flex-none ${section === 'overview' ? 'bg-background text-foreground shadow-sm ring-1 ring-border hover:bg-background hover:text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <LayoutDashboard aria-hidden="true" />
                                    Tổng quan
                                </Button>
                                <Button
                                    type="button"
                                    role="tab"
                                    id="document-tab-history"
                                    aria-controls="document-panel-history"
                                    aria-selected={section === 'history'}
                                    variant="ghost"
                                    onClick={() => onSectionChange('history')}
                                    className={`h-9 flex-1 justify-center rounded-lg px-3 sm:flex-none ${section === 'history' ? 'bg-background text-foreground shadow-sm ring-1 ring-border hover:bg-background hover:text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <History aria-hidden="true" />
                                    Phiên bản
                                    <span
                                        className={`ml-0.5 inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none ${section === 'history' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground'}`}
                                    >
                                        {revisions.length}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {section === 'overview' && document && (
                        <div
                            id="document-panel-overview"
                            role="tabpanel"
                            aria-labelledby="document-tab-overview"
                            tabIndex={0}
                            className="grid gap-3 py-5"
                        >
                            <div className="rounded-xl border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Nhóm nội dung
                                </p>
                                <p className="mt-1 font-medium">
                                    {domains.find(
                                        (domain) =>
                                            domain.code === document.domainCode,
                                    )?.label ?? 'Chưa gán nhóm'}
                                </p>
                            </div>
                            <div className="rounded-xl border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Phiên bản đang dùng
                                </p>
                                <p className="mt-1 font-medium">
                                    {document.publishedRevisionId
                                        ? publishedRevision
                                            ? `Bản ${publishedRevision.revisionNumber}`
                                            : 'Đã xuất bản'
                                        : 'Chưa xuất bản'}
                                </p>
                            </div>
                            <div className="rounded-xl border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Thời hạn áp dụng
                                </p>
                                <p className="mt-1 font-medium">
                                    {document.effectiveFrom ??
                                        'Không giới hạn ngày bắt đầu'}
                                    {document.effectiveTo
                                        ? ` – ${document.effectiveTo}`
                                        : ''}
                                </p>
                            </div>
                            <div className="rounded-xl border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Lịch sử
                                </p>
                                <p className="mt-1 font-medium">
                                    {revisions.length} phiên bản đã lưu
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        onSectionChange('content');
                                        if (selectedRevision)
                                            onLoadPreview(selectedRevision.id);
                                    }}
                                >
                                    <FileText />
                                    Xem nội dung và kiểm tra
                                </Button>
                            </div>
                        </div>
                    )}

                    {section === 'content' && (
                        <div
                            id="document-panel-content"
                            role="region"
                            aria-label="Nội dung tài liệu"
                            tabIndex={0}
                            className="space-y-4 py-3"
                        >
                            {isCreating || isEditing ? (
                                <>
                                    <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
                                        <label className="space-y-2 text-sm font-medium">
                                            <span>
                                                Tên tài liệu{' '}
                                                <span
                                                    aria-hidden="true"
                                                    className="text-destructive"
                                                >
                                                    *
                                                </span>
                                            </span>
                                            <Input
                                                className="h-10"
                                                required
                                                aria-invalid={Boolean(
                                                    formState.errors.title,
                                                )}
                                                aria-describedby={
                                                    formState.errors.title
                                                        ? 'knowledge-title-error'
                                                        : undefined
                                                }
                                                {...register('title')}
                                                onChange={(event) =>
                                                    updateTitle(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Ví dụ: Chính sách giao hàng"
                                            />
                                            {formState.errors.title && (
                                                <span
                                                    id="knowledge-title-error"
                                                    role="alert"
                                                    className="block text-xs font-normal text-destructive"
                                                >
                                                    {
                                                        formState.errors.title
                                                            .message
                                                    }
                                                </span>
                                            )}
                                        </label>
                                        <label className="space-y-2 text-sm font-medium">
                                            <span>
                                                Nhóm nội dung{' '}
                                                <span
                                                    aria-hidden="true"
                                                    className="text-destructive"
                                                >
                                                    *
                                                </span>
                                            </span>
                                            <Controller
                                                control={control}
                                                name="domainCode"
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className="h-10 w-full data-[size=default]:h-10"
                                                            aria-required="true"
                                                            aria-invalid={Boolean(
                                                                formState.errors
                                                                    .domainCode,
                                                            )}
                                                            aria-describedby={
                                                                formState.errors
                                                                    .domainCode
                                                                    ? 'knowledge-domain-error'
                                                                    : undefined
                                                            }
                                                        >
                                                            <SelectValue placeholder="Chọn nhóm nội dung">
                                                                {selectedDomain
                                                                    ? selectedDomain.status ===
                                                                      'ARCHIVED'
                                                                        ? `${selectedDomain.label} (Ngừng sử dụng)`
                                                                        : selectedDomain.label
                                                                    : 'Chọn nhóm nội dung'}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {domains
                                                                .filter(
                                                                    (domain) =>
                                                                        domain.kind ===
                                                                        'knowledge',
                                                                )
                                                                .map(
                                                                    (
                                                                        domain,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                domain.code
                                                                            }
                                                                            value={
                                                                                domain.code
                                                                            }
                                                                        >
                                                                            {domain.status ===
                                                                            'ARCHIVED'
                                                                                ? `${domain.label} (Ngừng sử dụng)`
                                                                                : domain.label}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {formState.errors.domainCode && (
                                                <span
                                                    id="knowledge-domain-error"
                                                    role="alert"
                                                    className="block text-xs font-normal text-destructive"
                                                >
                                                    {
                                                        formState.errors
                                                            .domainCode.message
                                                    }
                                                </span>
                                            )}
                                            {isCreating &&
                                                selectedDomain?.status ===
                                                    'ARCHIVED' && (
                                                    <p className="rounded-lg border border-muted bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
                                                        Nhóm đang ngừng sử dụng.
                                                        Tài liệu có thể được
                                                        xuất bản nhưng BinGPT
                                                        chỉ sử dụng sau khi bạn
                                                        kích hoạt lại nhóm.
                                                    </p>
                                                )}
                                        </label>
                                        <label className="space-y-2 text-sm font-medium">
                                            Ngôn ngữ
                                            <Controller
                                                control={control}
                                                name="language"
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger className="h-10 w-full data-[size=default]:h-10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="vi">
                                                                Tiếng Việt
                                                            </SelectItem>
                                                            <SelectItem value="en">
                                                                Tiếng Anh
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="space-y-2 text-sm font-medium">
                                                Có hiệu lực từ
                                                <Input
                                                    className="h-10"
                                                    type="date"
                                                    {...register(
                                                        'effectiveFrom',
                                                    )}
                                                />
                                            </label>
                                            <label className="space-y-2 text-sm font-medium">
                                                Đến ngày
                                                <Input
                                                    className="h-10"
                                                    type="date"
                                                    aria-invalid={Boolean(
                                                        formState.errors
                                                            .effectiveTo,
                                                    )}
                                                    aria-describedby={
                                                        formState.errors
                                                            .effectiveTo
                                                            ? 'knowledge-effective-to-error'
                                                            : undefined
                                                    }
                                                    {...register('effectiveTo')}
                                                />
                                                {formState.errors
                                                    .effectiveTo && (
                                                    <span
                                                        id="knowledge-effective-to-error"
                                                        role="alert"
                                                        className="block text-xs font-normal text-destructive"
                                                    >
                                                        {
                                                            formState.errors
                                                                .effectiveTo
                                                                .message
                                                        }
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <details className="group rounded-xl border border-border/80 bg-muted/20 transition-colors open:bg-background open:shadow-sm">
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[inherit] p-3 marker:hidden [&::-webkit-details-marker]:hidden">
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm">
                                                    <Code2
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-medium text-foreground">
                                                        Mã tài liệu
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                                        Không bắt buộc · tự tạo
                                                        theo tên tài liệu
                                                    </span>
                                                </span>
                                            </span>
                                            <ChevronDown
                                                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                                                aria-hidden="true"
                                            />
                                        </summary>
                                        <div className="space-y-2 border-t px-3 pb-3 pt-3">
                                            <label
                                                htmlFor="knowledge-document-slug"
                                                className="block text-sm font-medium"
                                            >
                                                Mã tài liệu
                                            </label>
                                            <Input
                                                id="knowledge-document-slug"
                                                className="h-10"
                                                {...register('slug')}
                                                placeholder="chinh-sach-giao-hang"
                                            />
                                            <p className="text-xs leading-5 text-muted-foreground">
                                                Dùng để nhận diện nội bộ. Nếu để
                                                trống, mã sẽ được tạo từ tên tài
                                                liệu.
                                            </p>
                                        </div>
                                    </details>

                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-base font-semibold">
                                                    Nội dung tài liệu{' '}
                                                    <span
                                                        aria-hidden="true"
                                                        className="text-destructive"
                                                    >
                                                        *
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Viết chính sách rõ ràng,
                                                    chia ý theo tiêu đề để trợ
                                                    lý tìm đúng phần.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    markdownFileInput.current?.click()
                                                }
                                            >
                                                <Upload />
                                                Nhập tệp Markdown
                                            </Button>
                                            <input
                                                ref={markdownFileInput}
                                                type="file"
                                                accept=".md,text/markdown"
                                                className="sr-only"
                                                aria-label="Chọn tệp Markdown"
                                                onChange={(event) => {
                                                    void handleMarkdownFile(
                                                        event.target.files?.[0],
                                                    );
                                                    // Cho phép chọn lại chính tệp đó sau khi sửa nội dung bên ngoài.
                                                    event.target.value = '';
                                                }}
                                            />
                                        </div>
                                        {fileError && (
                                            <p
                                                role="alert"
                                                className="text-sm text-destructive"
                                            >
                                                {fileError}
                                            </p>
                                        )}
                                        <Controller
                                            control={control}
                                            name="markdown"
                                            render={({ field }) => (
                                                <MarkdownDocumentEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    inputRef={field.ref}
                                                    invalid={Boolean(
                                                        formState.errors
                                                            .markdown,
                                                    )}
                                                    describedBy={
                                                        formState.errors
                                                            .markdown
                                                            ? 'knowledge-markdown-error'
                                                            : undefined
                                                    }
                                                />
                                            )}
                                        />
                                        {formState.errors.markdown && (
                                            <p
                                                id="knowledge-markdown-error"
                                                role="alert"
                                                className="text-xs text-destructive"
                                            >
                                                {
                                                    formState.errors.markdown
                                                        .message
                                                }
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Hỗ trợ nội dung tối đa 64 KB. Bản
                                            nháp chỉ dùng để kiểm tra, chưa được
                                            đưa vào câu trả lời của người bán.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {document && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                onSectionChange('overview')
                                            }
                                        >
                                            <ArrowLeft />
                                            Quay lại tổng quan
                                        </Button>
                                    )}
                                    {!preview ? (
                                        <div className="rounded-xl border border-dashed p-8 text-center">
                                            <p className="font-medium">
                                                Chưa mở nội dung phiên bản
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Chọn một phiên bản để xem trước
                                                và chạy thử câu hỏi.
                                            </p>
                                            {selectedRevision && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() =>
                                                        onLoadPreview(
                                                            selectedRevision.id,
                                                        )
                                                    }
                                                >
                                                    <FileText />
                                                    Mở nội dung
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        Bản{' '}
                                                        {selectedRevision?.revisionNumber ??
                                                            'đang chọn'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {preview.chunks.length}{' '}
                                                        phần nội dung được chia
                                                        để tìm kiếm
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRevision && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={
                                                                onStartEditing
                                                            }
                                                            disabled={
                                                                document?.status ===
                                                                'ARCHIVED'
                                                            }
                                                        >
                                                            Chỉnh sửa thành bản
                                                            mới
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {!preview.validation.valid && (
                                                <div
                                                    role="alert"
                                                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
                                                >
                                                    <p className="font-medium text-destructive">
                                                        Cần chỉnh lại trước khi
                                                        xuất bản
                                                    </p>
                                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
                                                        {preview.validation.errors.map(
                                                            (error) => (
                                                                <li key={error}>
                                                                    {error}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                {preview.chunks.map(
                                                    (chunk, index) => (
                                                        <article
                                                            key={`${chunk.section}-${index}`}
                                                            className="rounded-xl border p-4"
                                                        >
                                                            <h3 className="text-sm font-semibold">
                                                                {chunk.section ||
                                                                    `Phần ${index + 1}`}
                                                            </h3>
                                                            <div className="mt-2 leading-6 text-muted-foreground">
                                                                <KnowledgeMarkdownPreview
                                                                    source={
                                                                        chunk.content
                                                                    }
                                                                />
                                                            </div>
                                                        </article>
                                                    ),
                                                )}
                                            </div>
                                            <details className="rounded-xl border p-4">
                                                <summary className="cursor-pointer text-sm font-medium">
                                                    Xem nội dung Markdown gốc
                                                </summary>
                                                <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-xs leading-5">
                                                    {preview.markdown}
                                                </pre>
                                            </details>
                                            <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Thử tìm nội dung
                                                    </h3>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        Chế độ này chỉ so khớp
                                                        embedding giữa câu đơn
                                                        và chunk bản nháp; chưa
                                                        chạy phân loại ý định,
                                                        lịch sử hội thoại,
                                                        BM25/RRF hoặc rerank như
                                                        chat thật. Điểm cosine
                                                        không phải xác suất trả
                                                        lời đúng.
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                    <Input
                                                        value={testQuestion}
                                                        onChange={(event) =>
                                                            onTestQuestionChange(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key ===
                                                                    'Enter' &&
                                                                testQuestion.trim() &&
                                                                selectedRevision
                                                            )
                                                                onTestDraft(
                                                                    selectedRevision.id,
                                                                    testQuestion,
                                                                );
                                                        }}
                                                        placeholder="Ví dụ: Khách muốn đổi sản phẩm thì shop cần làm gì?"
                                                        aria-label="Câu hỏi thử nghiệm"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            selectedRevision &&
                                                            onTestDraft(
                                                                selectedRevision.id,
                                                                testQuestion,
                                                            )
                                                        }
                                                        disabled={
                                                            !testQuestion.trim() ||
                                                            isTesting ||
                                                            !selectedRevision
                                                        }
                                                    >
                                                        <FlaskConical />
                                                        {isTesting
                                                            ? 'Đang kiểm tra...'
                                                            : 'Kiểm tra'}
                                                    </Button>
                                                </div>
                                                {testMatches.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {testMatches.map(
                                                            (match, index) => (
                                                                <article
                                                                    key={`${match.section}-${index}`}
                                                                    className="rounded-lg border bg-background p-3"
                                                                >
                                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                                        <p className="text-sm font-medium">
                                                                            {match.section ||
                                                                                `Phần ${index + 1}`}
                                                                        </p>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Điểm
                                                                            cosine{' '}
                                                                            {(
                                                                                match.score *
                                                                                100
                                                                            ).toFixed(
                                                                                1,
                                                                            )}
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-2 leading-5 text-muted-foreground">
                                                                        <KnowledgeMarkdownPreview
                                                                            source={
                                                                                match.content
                                                                            }
                                                                        />
                                                                    </div>
                                                                </article>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : hasTestResult &&
                                                  !isTesting ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Chưa có kết quả thử cho
                                                        câu hỏi này.
                                                    </p>
                                                ) : null}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {section === 'history' && document && (
                        <DocumentRevisionHistory
                            document={document}
                            revisions={revisions}
                            rollbackReason={rollbackReason}
                            isRollingBack={isRollingBack}
                            onRollbackReasonChange={onRollbackReasonChange}
                            onLoadPreview={onLoadPreview}
                            onRollback={onRollback}
                        />
                    )}
                </CardContent>
            </Card>
            {/* Khối khôi phục là phần cuối của nội dung cuộn, nằm ngay trên footer cố định của modal. */}
            {document && documentDomain?.status !== 'ACTIVE' && (
                <DomainRecoveryNotice
                    domainCode={document.domainCode}
                    domainLabel={documentDomain?.label ?? 'Chưa gán nhóm'}
                    domainStatus={documentDomain?.status}
                    isActivatingDomain={isActivatingDomain}
                    onActivateDomain={onActivateDomain}
                />
            )}
            {/* Đặt thao tác ngừng sử dụng cuối thân cuộn, tách khỏi thao tác thường để tránh bấm nhầm. */}
            {document && !isCreating && !isEditing && (
                <ArchiveDocumentFlow
                    document={document}
                    domainLabel={documentDomain?.label ?? 'Chưa gán nhóm'}
                    isArchiving={isArchiving}
                    isRestoring={isRestoringDocument}
                    isArchived={document.status === 'ARCHIVED'}
                    onArchive={onArchive}
                    onRestore={onRestoreDocument}
                />
            )}
        </div>
    );
}
