// Điều phối hai khu quản trị và luồng soạn thảo; truy vấn, mutation cùng luật nghiệp vụ nằm ở hook/service.
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, FilePlus2, Layers3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSellerKnowledgeAdmin } from '../hooks/useSellerKnowledgeAdmin';
import { KnowledgeDocumentWorkspace } from '../documents/KnowledgeDocumentWorkspace';
import { KnowledgeDocumentsPanel } from '../documents/KnowledgeDocumentsPanel';
import { KnowledgeDomainsPanel } from '../domains/KnowledgeDomainsPanel';
import { KnowledgeDialog } from '../shared/KnowledgeDialog';
import { sellerKnowledgeDocumentFormSchema } from '../schemas/seller-knowledge-document.schema';
import type { SellerKnowledgeDocumentForm } from '../types/documents/document-form.types';
import type { WorkspaceSection } from '../types/documents/document.types';
import type {
    PageSection,
    PendingNavigation,
} from '../types/shared/page.types';

const EMPTY_FORM: SellerKnowledgeDocumentForm = {
    title: '',
    slug: '',
    domainCode: '',
    language: 'vi',
    effectiveFrom: '',
    effectiveTo: '',
    markdown: '',
};

// Điều phối lưu, kiểm tra, xuất bản và khôi phục tài liệu; không cho xuất bản nội dung chưa kiểm tra.
export function SellerKnowledgePageClient() {
    const admin = useSellerKnowledgeAdmin();
    const [pageSection, setPageSection] = useState<PageSection>('documents');
    const [workspaceSection, setWorkspaceSection] =
        useState<WorkspaceSection>('overview');
    const documentForm = useForm<SellerKnowledgeDocumentForm>({
        resolver: zodResolver(sellerKnowledgeDocumentFormSchema),
        mode: 'onSubmit',
        defaultValues: EMPTY_FORM,
    });
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const isDirty = documentForm.formState.isDirty;
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] =
        useState<PendingNavigation | null>(null);
    const [testQuestion, setTestQuestion] = useState('');
    const [rollbackReason, setRollbackReason] = useState('');

    const selectedDocument =
        admin.documents.find(
            (document) => document.id === admin.selectedDocumentId,
        ) ??
        (admin.details?.document.id === admin.selectedDocumentId
            ? admin.details.document
            : null);
    const selectedRevision =
        admin.details?.revisions.find(
            (revision) => revision.id === admin.selectedRevisionId,
        ) ?? null;
    const canPublish = Boolean(
        selectedDocument &&
        selectedRevision &&
        ['DRAFT', 'VALIDATED'].includes(selectedRevision.status) &&
        admin.preview?.validation.valid &&
        !isDirty &&
        selectedDocument.status !== 'ARCHIVED',
    );

    // Chỉ hàm này thực hiện điều hướng thật sau khi requestNavigation đã qua guard dữ liệu chưa lưu.
    // Tạo từ một nhóm cụ thể giữ đúng domain kể cả khi domain đang archived để soạn nội dung khôi phục.
    // Tạo từ nút chung chỉ chọn domain ACTIVE; mọi lần mở form đều reset revision state để tránh lẫn dữ liệu cũ.
    // Đóng panel chỉ bỏ state local, tài liệu đã lưu vẫn được giữ trong cache để mở lại.
    function performNavigation(navigation: PendingNavigation) {
        if (navigation.type === 'select-document') {
            admin.selectDocument(navigation.id);
            setPageSection('documents');
            setIsCreating(false);
            setIsEditing(false);
            setIsEditorOpen(true);
            documentForm.reset(EMPTY_FORM);
            setWorkspaceSection('overview');
            setTestQuestion('');
            setRollbackReason('');
            return;
        }

        if (navigation.type === 'create-document') {
            // Chỉ nhận domain knowledge; domain archived vẫn được chọn để chuẩn bị tài liệu khôi phục, không dùng nguồn profile/live.
            const requestedDomain = navigation.domainCode
                ? admin.domains.find(
                      (domain) =>
                          domain.code === navigation.domainCode &&
                          domain.kind === 'knowledge',
                  )
                : undefined;
            const defaultDomain =
                requestedDomain ??
                admin.domains.find(
                    (domain) =>
                        domain.kind === 'knowledge' &&
                        domain.status === 'ACTIVE',
                );
            admin.selectDocument(null);
            setPageSection('documents');
            setIsCreating(true);
            setIsEditing(false);
            setIsEditorOpen(true);
            documentForm.reset({
                ...EMPTY_FORM,
                domainCode: defaultDomain?.code ?? '',
            });
            setWorkspaceSection('content');
            setTestQuestion('');
            setRollbackReason('');
            return;
        }

        if (navigation.type === 'open-domains') {
            admin.selectDocument(null);
            setPageSection('domains');
            setIsEditorOpen(false);
            setIsCreating(false);
            setIsEditing(false);
            documentForm.reset(EMPTY_FORM);
            return;
        }

        if (navigation.type === 'cancel-edit' && !isCreating) {
            setIsEditing(false);
            documentForm.reset(EMPTY_FORM);
            setWorkspaceSection('overview');
            return;
        }

        // Đóng panel hoặc hủy tài liệu chưa tạo thì bỏ draft phía client, nhưng giữ document đã lưu để chọn lại.
        setIsEditorOpen(false);
        setIsCreating(false);
        setIsEditing(false);
        documentForm.reset(EMPTY_FORM);
        setWorkspaceSection('overview');
        setTestQuestion('');
        setRollbackReason('');
        if (isCreating) admin.selectDocument(null);
    }

    // Chặn rời lúc đang lưu; nếu form bẩn, lưu lại đích điều hướng để chỉ bỏ nội dung sau khi admin xác nhận.
    function requestNavigation(navigation: PendingNavigation) {
        // Không cho đóng panel trong khi mutation chạy vì UI chưa biết kết quả lưu có thành công hay không.
        if (admin.isSaving) return;
        // Form sạch thì xử lý ngay; form bẩn phải chờ xác nhận trước khi state bị xóa hoặc trang đổi.
        if (!isDirty) {
            performNavigation(navigation);
            return;
        }
        setPendingNavigation(navigation);
        setIsDiscardDialogOpen(true);
    }

    // Bỏ bản nháp local và tiếp tục đúng hành động đã yêu cầu trước khi dialog xác nhận mở.
    function discardChangesAndContinue() {
        const navigation = pendingNavigation;
        setIsDiscardDialogOpen(false);
        setPendingNavigation(null);
        if (navigation) performNavigation(navigation);
    }

    // Chuyển từ cảnh báo thiếu tài liệu sang tab tài liệu để admin tiếp tục tạo hoặc khôi phục nội dung.
    function openDocumentsFromDomainNotice() {
        setPageSection('documents');
    }

    // Mở form tạo tài liệu với domain được chọn sẵn để người dùng không phải tìm lại nhóm đang xử lý.
    function openDocumentCreationForDomain(domainCode: string) {
        requestNavigation({ type: 'create-document', domainCode });
    }

    // Chỉ tạo revision sau khi Zod xác nhận metadata và Markdown; ngày rỗng được đổi thành undefined theo contract API.
    // React Hook Form làm nguồn dirty duy nhất để cảnh báo bỏ form và khóa publish luôn khớp dữ liệu người dùng đang thấy.
    async function saveDocument() {
        const isValid = await documentForm.trigger();
        if (!isValid) return;

        const values = documentForm.getValues();
        const normalizedValues = {
            ...values,
            title: values.title.trim(),
            slug: values.slug.trim(),
        };
        const payload = {
            ...normalizedValues,
            effectiveFrom: normalizedValues.effectiveFrom || undefined,
            effectiveTo: normalizedValues.effectiveTo || undefined,
        };

        if (isCreating) {
            admin.createDocument.mutate(payload, {
                onSuccess: () => {
                    setIsCreating(false);
                    documentForm.reset(normalizedValues);
                    setWorkspaceSection('content');
                },
            });
            return;
        }

        if (admin.selectedDocumentId) {
            admin.saveRevision.mutate(
                { id: admin.selectedDocumentId, payload },
                {
                    onSuccess: () => {
                        setIsEditing(false);
                        documentForm.reset(normalizedValues);
                    },
                },
            );
        }
    }

    // Nạp snapshot revision trước khi bật form sửa để metadata và Markdown luôn cùng một phiên bản.
    // Nếu revision không tồn tại hoặc object storage lỗi, báo lỗi và không mở form ở trạng thái thiếu dữ liệu.
    async function startEditing() {
        const revision =
            admin.details?.revisions.find(
                (item) => item.id === admin.selectedRevisionId,
            ) ?? admin.details?.revisions[0];
        if (!revision) {
            admin.notifyError('Tài liệu chưa có phiên bản để chỉnh sửa.');
            return;
        }

        try {
            const preview = await admin.loadPreview(revision.id);
            documentForm.reset({
                title: revision.documentMetadata.title,
                slug: revision.documentMetadata.slug,
                domainCode: revision.documentMetadata.domainCode,
                language:
                    revision.documentMetadata.language === 'en' ? 'en' : 'vi',
                effectiveFrom: revision.documentMetadata.effectiveFrom ?? '',
                effectiveTo: revision.documentMetadata.effectiveTo ?? '',
                markdown: preview.markdown,
            });
            setIsEditing(true);
            setWorkspaceSection('content');
        } catch {
            admin.notifyError('Chưa tải được nội dung phiên bản. Hãy thử lại.');
        }
    }

    // Nạp nội dung của revision được chọn để xem chunk hoặc thử truy vấn; lỗi được báo bằng hook/service.
    function loadPreview(revisionId: string) {
        void admin
            .loadPreview(revisionId)
            .then(() => {
                setWorkspaceSection('content');
            })
            .catch(() => {
                admin.notifyError(
                    'Chưa tải được nội dung phiên bản. Hãy thử lại.',
                );
            });
    }

    // Dùng chung mutation quản lý domain để nút tại tiến trình tuân theo cùng quyền và điều kiện publish như tab nhóm.
    async function activateDomain(domainCode: string) {
        await admin.setDomainStatus.mutateAsync({
            code: domainCode,
            status: 'ACTIVE',
        });
    }

    // Hủy chỉnh sửa nhưng giữ tài liệu đã lưu; tài liệu mới thì panel đóng và selection tạm được xóa.
    function cancelEditing() {
        requestNavigation({ type: 'cancel-edit' });
    }

    // Đóng panel qua cùng guard với chọn tài liệu/đổi khu vực để nút X và nút đóng không làm mất nội dung.
    function handleEditorOpenChange(open: boolean) {
        if (open) {
            setIsEditorOpen(true);
            return;
        }
        requestNavigation({ type: 'close' });
    }

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
            <header className="rounded-xl border bg-card px-5 py-4 shadow-sm sm:px-6">
                <div className="max-w-3xl">
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-2xl">
                        Tài liệu trợ lý
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Soạn, kiểm tra và xuất bản nguồn kiến thức. Chỉ nội dung
                        đã xuất bản mới được đưa vào kho tra cứu.
                    </p>
                </div>
            </header>

            <div
                role="group"
                aria-label="Khu vực quản lý tri thức"
                className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl border bg-card p-1.5 shadow-sm"
            >
                <Button
                    type="button"
                    aria-pressed={pageSection === 'documents'}
                    variant="ghost"
                    onClick={() => setPageSection('documents')}
                    className={`h-10 shrink-0 rounded-xl px-3.5 sm:px-4 ${pageSection === 'documents' ? 'bg-background text-foreground shadow-sm ring-1 ring-border/70 hover:bg-background' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'}`}
                >
                    <BookOpen className="size-4" aria-hidden="true" />
                    Tài liệu
                    <span
                        className={`min-w-6 rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums ${pageSection === 'documents' ? 'bg-primary/10 text-primary' : 'bg-background/80 text-muted-foreground'}`}
                    >
                        {admin.documents.length}
                    </span>
                </Button>
                <Button
                    type="button"
                    aria-pressed={pageSection === 'domains'}
                    variant="ghost"
                    onClick={() => requestNavigation({ type: 'open-domains' })}
                    className={`h-10 shrink-0 rounded-xl px-3.5 sm:px-4 ${pageSection === 'domains' ? 'bg-background text-foreground shadow-sm ring-1 ring-border/70 hover:bg-background' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'}`}
                >
                    <Layers3 className="size-4" aria-hidden="true" />
                    Nhóm nội dung
                    <span
                        className={`min-w-6 rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums ${pageSection === 'domains' ? 'bg-primary/10 text-primary' : 'bg-background/80 text-muted-foreground'}`}
                    >
                        {
                            admin.domains.filter(
                                (domain) => domain.kind === 'knowledge',
                            ).length
                        }
                    </span>
                </Button>
            </div>

            {pageSection === 'documents' ? (
                <div>
                    <KnowledgeDocumentsPanel
                        documents={admin.documents}
                        domains={admin.domains}
                        selectedDocumentId={admin.selectedDocumentId}
                        filters={admin.documentFilters}
                        isLoading={admin.isDocumentsLoading}
                        hasError={admin.hasDocumentsError}
                        onFiltersChange={admin.setDocumentFilters}
                        onRetry={() => void admin.reloadDocuments()}
                        onSelectDocument={(id) =>
                            requestNavigation({ type: 'select-document', id })
                        }
                        onCreateDocument={() =>
                            requestNavigation({ type: 'create-document' })
                        }
                    />
                </div>
            ) : (
                <div>
                    <KnowledgeDomainsPanel
                        domains={admin.domains}
                        isCreating={admin.createDomain.isPending}
                        isUpdating={admin.setDomainStatus.isPending}
                        onOpenDocuments={openDocumentsFromDomainNotice}
                        onAddDocumentForDomain={openDocumentCreationForDomain}
                        onCreate={async (domain) => {
                            await admin.createDomain.mutateAsync(domain);
                        }}
                        onSetStatus={async (code, status) => {
                            await admin.setDomainStatus.mutateAsync({
                                code,
                                status,
                            });
                        }}
                    />
                </div>
            )}

            <KnowledgeDialog
                open={isEditorOpen}
                onOpenChange={handleEditorOpenChange}
                title={
                    isCreating
                        ? 'Tạo tài liệu'
                        : (selectedDocument?.title ?? 'Chi tiết tài liệu')
                }
                description={
                    isCreating
                        ? 'Nhập thông tin và nội dung Markdown cho tài liệu mới.'
                        : 'Xem nội dung, kiểm tra truy xuất và quản lý các phiên bản của tài liệu.'
                }
                footer={
                    <div className="flex w-full flex-col gap-2">
                        <p className="text-xs text-muted-foreground">
                            Bản nháp chỉ được dùng để kiểm tra, chưa xuất hiện
                            trong câu trả lời của người bán.
                        </p>
                        <div className="flex w-full flex-wrap justify-end gap-2">
                            {isCreating || isEditing ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cancelEditing}
                                        disabled={admin.isSaving}
                                    >
                                        Hủy chỉnh sửa
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={saveDocument}
                                        disabled={admin.isSaving}
                                    >
                                        <FilePlus2 />
                                        {admin.isSaving
                                            ? 'Đang lưu…'
                                            : 'Lưu bản nháp'}
                                    </Button>
                                </>
                            ) : selectedDocument &&
                              workspaceSection === 'content' ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setWorkspaceSection('overview')
                                        }
                                    >
                                        Quay lại tổng quan
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            selectedRevision &&
                                            admin.publish.mutate(
                                                selectedRevision.id,
                                            )
                                        }
                                        disabled={
                                            !canPublish ||
                                            admin.publish.isPending
                                        }
                                    >
                                        {admin.publish.isPending
                                            ? 'Đang xuất bản…'
                                            : 'Xuất bản'}
                                    </Button>
                                </>
                            ) : selectedDocument ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            handleEditorOpenChange(false)
                                        }
                                    >
                                        Đóng
                                    </Button>
                                    {selectedDocument.status !== 'ARCHIVED' && (
                                        <Button
                                            type="button"
                                            onClick={() => void startEditing()}
                                        >
                                            Chỉnh sửa tài liệu
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        handleEditorOpenChange(false)
                                    }
                                >
                                    Đóng
                                </Button>
                            )}
                        </div>
                    </div>
                }
            >
                <KnowledgeDocumentWorkspace
                    document={selectedDocument}
                    revisions={admin.details?.revisions ?? []}
                    domains={admin.domains}
                    selectedRevisionId={admin.selectedRevisionId}
                    formMethods={documentForm}
                    isCreating={isCreating}
                    isEditing={isEditing}
                    isArchiving={admin.archiveDocument.isPending}
                    isRestoringDocument={admin.restoreDocument.isPending}
                    isActivatingDomain={admin.setDomainStatus.isPending}
                    isTesting={admin.testDraft.isPending}
                    isRollingBack={admin.rollback.isPending}
                    preview={admin.preview}
                    testMatches={
                        admin.testDraft.variables?.revisionId ===
                            admin.selectedRevisionId &&
                        admin.testDraft.variables?.question === testQuestion
                            ? (admin.testDraft.data?.matches ?? [])
                            : []
                    }
                    hasTestResult={
                        admin.testDraft.variables?.revisionId ===
                            admin.selectedRevisionId &&
                        admin.testDraft.variables?.question === testQuestion &&
                        admin.testDraft.isSuccess
                    }
                    testQuestion={testQuestion}
                    rollbackReason={rollbackReason}
                    section={workspaceSection}
                    onSectionChange={setWorkspaceSection}
                    onTestQuestionChange={setTestQuestion}
                    onRollbackReasonChange={setRollbackReason}
                    onStartEditing={() => void startEditing()}
                    onLoadPreview={loadPreview}
                    onTestDraft={(revisionId, question) =>
                        admin.testDraft.mutate({ revisionId, question })
                    }
                    onArchive={(documentId) =>
                        admin.archiveDocument.mutateAsync(documentId)
                    }
                    onRestoreDocument={(documentId) =>
                        admin.restoreDocument.mutateAsync(documentId)
                    }
                    onActivateDomain={activateDomain}
                    onRollback={(documentId, revisionId, reason) =>
                        admin.rollback.mutate({
                            documentId,
                            revisionId,
                            reason,
                        })
                    }
                />
            </KnowledgeDialog>

            <AlertDialog
                open={isDiscardDialogOpen}
                onOpenChange={setIsDiscardDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Bỏ thay đổi chưa lưu?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Nội dung bạn vừa sửa chưa được lưu. Nếu tiếp tục,
                            phần thay đổi này sẽ bị bỏ.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setPendingNavigation(null)}
                        >
                            Tiếp tục chỉnh sửa
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={discardChangesAndContinue}>
                            Bỏ thay đổi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
