// Quản lý nhóm tài liệu theo nguồn và giữ lỗi đổi trạng thái cạnh nhóm tương ứng.
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ChevronDown, Code2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sellerKnowledgeDomainFormSchema } from '../schemas/seller-knowledge-domain.schema';
import { createKnowledgeSlug } from '../utils/seller-knowledge-display';
import { KnowledgeDialog } from '../shared/KnowledgeDialog';
import { DomainSection } from './DomainSection';
import type { SellerKnowledgeDomainForm } from '../types/domains/domain-form.types';
import type {
    KnowledgeDomainStatusError,
    KnowledgeDomainsPanelProps,
} from '../types/domains/domain.types';

// Tách nhóm hệ thống khỏi nhóm admin; metadata hệ thống chỉ đọc nhưng admin có thể đổi trạng thái và thêm tài liệu khôi phục.
export function KnowledgeDomainsPanel({
    domains,
    isCreating,
    isUpdating,
    onOpenDocuments,
    onAddDocumentForDomain,
    onCreate,
    onSetStatus,
}: KnowledgeDomainsPanelProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [statusError, setStatusError] =
        useState<KnowledgeDomainStatusError | null>(null);
    const form = useForm<SellerKnowledgeDomainForm>({
        resolver: zodResolver(sellerKnowledgeDomainFormSchema),
        mode: 'onSubmit',
        defaultValues: { code: '', label: '', description: '', examples: '' },
    });
    const [isCodeCustomized, setIsCodeCustomized] = useState(false);
    const systemDomains = domains.filter(
        (domain) => domain.kind === 'knowledge' && domain.source === 'SYSTEM',
    );
    const adminDomains = domains.filter(
        (domain) => domain.kind === 'knowledge' && domain.source === 'ADMIN',
    );

    // Sinh mã theo tên đến khi admin tùy chỉnh mã; thay đổi tên không âm thầm ghi đè mã đã chọn.
    function updateLabel(label: string) {
        form.setValue('label', label, {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted,
        });
        const existingCode = form.getValues('code');
        if (!isCodeCustomized || !existingCode) {
            form.setValue('code', createKnowledgeSlug(label), {
                shouldDirty: true,
                shouldValidate: form.formState.isSubmitted,
            });
        }
    }

    // Đánh dấu mã tự nhập để các thay đổi tên sau đó không âm thầm thay đổi định danh đã chọn.
    function updateCode(code: string) {
        setIsCodeCustomized(true);
        form.setValue('code', code, {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted,
        });
    }

    // Giữ lỗi trên đúng nhóm thay vì chỉ toast thoáng qua; request thất bại không được xem như đã đổi trạng thái.
    // Lỗi 400 đã biết được phân loại thành thiếu tài liệu xuất bản để giao diện đưa hướng xử lý cụ thể.
    // Các lỗi khác vẫn hiện cảnh báo chung, còn chi tiết nội dung không tin cậy từ server không được render trực tiếp.
    async function updateDomainStatus(
        code: string,
        status: 'ACTIVE' | 'ARCHIVED',
    ) {
        setStatusError(null);
        try {
            await onSetStatus(code, status);
        } catch (error) {
            const needsPublishedDocument =
                status === 'ACTIVE' &&
                isAxiosError<{ message?: string }>(error) &&
                error.response?.data.message ===
                    'Domain cần có ít nhất một tài liệu đã xuất bản trước khi kích hoạt.';

            setStatusError({
                code,
                kind: needsPublishedDocument
                    ? 'published-document-required'
                    : 'request-failed',
            });
        }
    }

    // Chỉ gửi nhóm sau khi schema xác nhận tên/mô tả; mã rỗng được tái sinh để form luôn tạo được định danh an toàn.
    const submitDomain = form.handleSubmit(async (values) => {
        try {
            await onCreate({
                ...values,
                code: values.code.trim() || createKnowledgeSlug(values.label),
                status: 'DRAFT',
            });
            form.reset({ code: '', label: '', description: '', examples: '' });
            setIsCodeCustomized(false);
            setIsCreateOpen(false);
        } catch {
            // Mutation hiển thị lỗi qua toast; giữ nội dung đã nhập để không mất công admin.
        }
    });

    return (
        <section
            aria-labelledby="knowledge-groups-heading"
            className="space-y-6 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
        >
            <div className="flex min-w-0 flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h2
                        id="knowledge-groups-heading"
                        className="text-lg font-semibold"
                    >
                        Nhóm nội dung
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Nhóm giúp BinGPT xác định chủ đề tài liệu. Nhóm mặc định
                        không sửa được thông tin nhưng có thể bật hoặc ngừng sử
                        dụng; nhóm bạn tạo có thể kích hoạt hoặc ngừng sử dụng.
                    </p>
                </div>
                <Button type="button" onClick={() => setIsCreateOpen(true)}>
                    <Plus />
                    Tạo nhóm
                </Button>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <DomainSection
                    title="Nhóm mặc định của hệ thống"
                    description="Nhóm mặc định do hệ thống định nghĩa, không thể sửa thông tin tại đây. “Đang bật” chỉ có nghĩa nhóm được phép dùng để phân loại; để BinGPT tra cứu được, nhóm cần ít nhất một tài liệu đã xuất bản. Nhóm chưa có tài liệu nên để “Ngừng sử dụng” và chỉ bật lại sau khi xuất bản tài liệu."
                    domains={systemDomains}
                    emptyMessage="Chưa có nhóm mặc định trong registry."
                    scrollable
                    isUpdating={isUpdating}
                    statusError={statusError}
                    onDismissStatusError={() => setStatusError(null)}
                    onOpenDocuments={onOpenDocuments}
                    onAddDocumentForDomain={onAddDocumentForDomain}
                    onSetStatus={updateDomainStatus}
                />
                <DomainSection
                    title="Nhóm do bạn tạo"
                    description="Nhóm mới bắt đầu ở trạng thái nháp. Chỉ bật nhóm sau khi có ít nhất một tài liệu được xuất bản để BinGPT tra cứu."
                    domains={adminDomains}
                    emptyMessage="Bạn chưa tạo nhóm nào. Tạo nhóm mới để gom một chủ đề tài liệu riêng."
                    isUpdating={isUpdating}
                    statusError={statusError}
                    onDismissStatusError={() => setStatusError(null)}
                    onOpenDocuments={onOpenDocuments}
                    onAddDocumentForDomain={onAddDocumentForDomain}
                    onSetStatus={updateDomainStatus}
                />
            </div>

            <p className="rounded-xl border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                Thông tin hồ sơ và dữ liệu trực tiếp của shop không phải nhóm
                tài liệu; các nguồn đó do backend quản lý riêng.
            </p>

            <KnowledgeDialog
                open={isCreateOpen}
                width="compact"
                onOpenChange={setIsCreateOpen}
                title="Tạo nhóm nội dung"
                description="Mô tả đúng phạm vi để BinGPT phân loại câu hỏi và tài liệu vào nhóm phù hợp."
                footer={
                    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Để sau
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void submitDomain()}
                            disabled={isCreating}
                        >
                            <Plus />
                            {isCreating ? 'Đang tạo…' : 'Tạo nhóm nháp'}
                        </Button>
                    </div>
                }
            >
                <div className="mx-auto w-full max-w-4xl space-y-5">
                    <label className="block space-y-2 text-sm font-medium">
                        <span>
                            Tên nhóm{' '}
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
                            aria-invalid={Boolean(form.formState.errors.label)}
                            aria-describedby={
                                form.formState.errors.label
                                    ? 'knowledge-group-label-error'
                                    : undefined
                            }
                            {...form.register('label')}
                            onChange={(event) =>
                                updateLabel(event.target.value)
                            }
                            placeholder="Ví dụ: Chính sách đổi trả"
                        />
                        {form.formState.errors.label && (
                            <span
                                id="knowledge-group-label-error"
                                role="alert"
                                className="block text-xs font-normal text-destructive"
                            >
                                {form.formState.errors.label.message}
                            </span>
                        )}
                    </label>
                    <details className="group overflow-hidden rounded-xl border border-border/80 bg-muted/20 transition-colors open:bg-background open:shadow-sm">
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
                                        Mã nhóm
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        Tùy chọn · Tự tạo theo tên, có thể chỉnh
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
                                htmlFor="knowledge-domain-code"
                                className="block text-sm font-medium"
                            >
                                Mã nhóm
                            </label>
                            <Input
                                id="knowledge-domain-code"
                                {...form.register('code')}
                                onChange={(event) =>
                                    updateCode(event.target.value)
                                }
                                placeholder="chinh-sach-doi-tra"
                                aria-describedby="knowledge-domain-code-help"
                            />
                            <p
                                id="knowledge-domain-code-help"
                                className="text-xs leading-5 text-muted-foreground"
                            >
                                Mã dùng để nhận diện nhóm trong hệ thống. Để
                                trống nếu muốn tự tạo theo tên nhóm.
                            </p>
                        </div>
                    </details>
                    <label className="block space-y-2 text-sm font-medium">
                        <span>
                            Mô tả phạm vi{' '}
                            <span
                                aria-hidden="true"
                                className="text-destructive"
                            >
                                *
                            </span>
                        </span>
                        <Textarea
                            required
                            aria-invalid={Boolean(
                                form.formState.errors.description,
                            )}
                            aria-describedby={
                                form.formState.errors.description
                                    ? 'knowledge-group-description-error'
                                    : undefined
                            }
                            {...form.register('description')}
                            placeholder="Nhóm này bao gồm những chính sách hoặc hướng dẫn nào?"
                        />
                        {form.formState.errors.description && (
                            <span
                                id="knowledge-group-description-error"
                                role="alert"
                                className="block text-xs font-normal text-destructive"
                            >
                                {form.formState.errors.description.message}
                            </span>
                        )}
                    </label>
                    <label className="block space-y-2 text-sm font-medium">
                        Câu hỏi ví dụ
                        <Textarea
                            {...form.register('examples')}
                            placeholder="Mỗi dòng một câu hỏi người bán thường hỏi"
                        />
                    </label>
                    <p className="rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                        Nhóm được tạo ở dạng nháp. Hãy thêm và xuất bản tài liệu
                        trong nhóm trước khi kích hoạt.
                    </p>
                </div>
            </KnowledgeDialog>
        </section>
    );
}
