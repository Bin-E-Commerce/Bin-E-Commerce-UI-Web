'use client';

// File này thay textarea mô tả bằng editor giàu ngữ cảnh, bộ kiểm tra chất lượng và popup AI.
// Component chỉ cập nhật field description khi seller bấm dùng; shortDescription và các field khác luôn được giữ nguyên.

import { useMemo, useState } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { AlertTriangle, Check, Eye, FolderTree, ImageIcon, Info, Loader2, PenLine, Trash2, Type } from 'lucide-react';

import { AiAssistantButton, AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useSessionPermission } from '@/services/auth/access/useSessionAccess';
import type {
    SellerProductCreateReferences,
    SellerProductCreateFormValues,
} from '../../../types/seller-product-create-form.type';
import { ProductFormField } from '../../../components/shared/ProductFormField';
import { useProductDescriptionSuggestions } from '../hooks/useProductDescriptionSuggestions';
import { buildProductDescriptionRequest } from '../utils/build-product-description-request';

interface ProductDescriptionEditorProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    references: SellerProductCreateReferences;
}

const AI_PRODUCT_CONTENT_PERMISSION = 'seller.ai.product_content.generate';

type DescriptionSectionId =
    | 'highlights'
    | 'productInfo'
    | 'specifications'
    | 'usage'
    | 'originWarranty'
    | 'package'
    | 'notes';

type DescriptionMode = 'write' | 'preview';

const DESCRIPTION_SECTION_TEMPLATES: Record<DescriptionSectionId, { heading: string; template: string }> = {
    highlights: { heading: 'Điểm nổi bật', template: 'Điểm nổi bật:\n- \n- \n- ' },
    productInfo: { heading: 'Thông tin sản phẩm', template: 'Thông tin sản phẩm:\n- Loại sản phẩm: \n- Thương hiệu: \n- Đối tượng sử dụng: ' },
    specifications: { heading: 'Thông số kỹ thuật', template: 'Thông số kỹ thuật:\n- Chất liệu: \n- Kích thước/khối lượng: \n- Màu sắc/phiên bản: ' },
    usage: { heading: 'Hướng dẫn sử dụng và bảo quản', template: 'Hướng dẫn sử dụng và bảo quản:\n- Cách sử dụng: \n- Cách bảo quản: ' },
    originWarranty: { heading: 'Nguồn gốc và bảo hành', template: 'Nguồn gốc và bảo hành:\n- Xuất xứ: \n- Bảo hành/đổi trả: ' },
    package: { heading: 'Bộ sản phẩm gồm', template: 'Bộ sản phẩm gồm:\n- ' },
    notes: { heading: 'Lưu ý khi sử dụng', template: 'Lưu ý khi sử dụng:\n- ' },
};

// Chuyển text hiện tại thành các tín hiệu đơn giản để seller biết mô tả đã đủ nền tảng trước khi lưu.
function getDescriptionQuality(description: string, productName: string) {
    const normalizedDescription = description.toLowerCase();
    return {
        minLength: description.trim().length >= 100,
        productInfo: description.trim().length >= 40 || productName.trim().length > 0,
        highlights: /điểm nổi bật|mô tả chi tiết|\n\s*[-•]/i.test(description),
        safe: !/(https?:\/\/|www\.|\bsk-|[\w.+-]+@[\w-]+\.[\w.-]+|\b(?:0|\+84)\d{8,10}\b)/i.test(description),
        sections: Object.fromEntries(
            Object.entries(DESCRIPTION_SECTION_TEMPLATES).map(([id, section]) => [id, normalizedDescription.includes(section.heading.toLowerCase())]),
        ) as Record<DescriptionSectionId, boolean>,
    };
}

// Hiển thị editor mô tả và điều phối popup AI mà không submit form hoặc thay đổi field liên quan.
export function ProductDescriptionEditor({ form, references }: ProductDescriptionEditorProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<DescriptionMode>('write');
    const values = useWatch({ control: form.control }) as SellerProductCreateFormValues;
    const description = values.description ?? '';
    const assistant = useProductDescriptionSuggestions();
    const canUseAi = useSessionPermission(AI_PRODUCT_CONTENT_PERMISSION);
    const readyImages = useMemo(
        () => values.images.filter((image) => image.assetId && image.fileName && image.publicUrl.startsWith('https://')).slice(0, 3),
        [values.images],
    );
    const request = useMemo(
        () => buildProductDescriptionRequest(values, references),
        [references, values],
    );
    const disabledReasons = [
        !canUseAi ? 'tài khoản chưa được cấp quyền sử dụng trợ lý AI' : undefined,
        !references.category ? 'chưa chọn ngành hàng' : undefined,
        readyImages.length === 0 ? 'chưa có ảnh sản phẩm đã tải lên' : undefined,
    ].filter((reason): reason is string => Boolean(reason));
    const disabledReason = disabledReasons.length
        ? `Chưa đủ điều kiện thực hiện chức năng AI: ${disabledReasons.join('; ')}.`
        : undefined;
    const quality = getDescriptionQuality(description, values.name);
    const completion = Math.min(100, Math.round((description.length / 100) * 100));

    // Chèn section mẫu vào cuối nội dung, không ghi đè text seller đã nhập và không tạo field mới trong schema.
    const insertSection = (sectionId: DescriptionSectionId) => {
        const section = DESCRIPTION_SECTION_TEMPLATES[sectionId];
        if (quality.sections[sectionId]) return;
        const separator = description.trim() ? '\n\n' : '';
        form.setValue('description', `${description.trimEnd()}${separator}${section.template}`, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setMode('write');
    };

    // Mở popup chỉ khi đã có category, ảnh hợp lệ và permission; lý do disabled được giải thích qua tooltip.
    const handleOpen = () => {
        if (!disabledReason) setOpen(true);
    };

    // Gửi request chủ động từ popup và chặn request trùng khi mutation đang pending.
    const handleGenerate = () => {
        if (disabledReason || assistant.isLoading) return;
        assistant.generate(request);
    };

    // Chỉ thay description sau hành động xác nhận rõ ràng; các field seller khác không bị chạm tới.
    const applyDescription = () => {
        if (!assistant.description) return;
        form.setValue('description', assistant.description, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setOpen(false);
    };

    // Xóa nội dung hiện tại trong form nhưng không tự động lưu lên backend.
    const clearDescription = () => {
        form.setValue('description', '', { shouldDirty: true, shouldValidate: true });
    };

    return (
        <ProductFormField
            label="Mô tả sản phẩm"
            htmlFor="product-description"
            required
            error={form.formState.errors.description?.message}
            labelExtra={
                <AiAssistantButton
                    tooltip={disabledReason ?? 'AI hỗ trợ tạo bản mô tả có cấu trúc từ ảnh, ngành hàng và thông tin bạn nhập.'}
                    ariaLabel="Mở trợ lý AI tạo mô tả sản phẩm"
                    ariaHasPopup="dialog"
                    ariaExpanded={open}
                    disabled={Boolean(disabledReason)}
                    onClick={handleOpen}
                />
            }
        >
            <div className="space-y-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Cấu trúc mô tả</p>
                            <p className="mt-1 text-sm text-zinc-600">Thêm từng mục để khách hàng đọc nhanh trên điện thoại.</p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">{Object.values(quality.sections).filter(Boolean).length}/7 mục</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.highlights} onClick={() => insertSection('highlights')}>
                            {quality.sections.highlights ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-semibold text-white">1</span>}
                            <span><strong className="block text-xs text-zinc-950">Điểm nổi bật</strong><small className="text-[11px] text-zinc-500">Lợi ích chính</small></span>
                        </Button>
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.productInfo} onClick={() => insertSection('productInfo')}>
                            {quality.sections.productInfo ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">2</span>}
                            <span><strong className="block text-xs text-zinc-950">Thông tin sản phẩm</strong><small className="text-[11px] text-zinc-500">Loại, thương hiệu</small></span>
                        </Button>
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.specifications} onClick={() => insertSection('specifications')}>
                            {quality.sections.specifications ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">3</span>}
                            <span><strong className="block text-xs text-zinc-950">Thông số kỹ thuật</strong><small className="text-[11px] text-zinc-500">Chất liệu, kích thước</small></span>
                        </Button>
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.usage} onClick={() => insertSection('usage')}>
                            {quality.sections.usage ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">4</span>}
                            <span><strong className="block text-xs text-zinc-950">Cách dùng & bảo quản</strong><small className="text-[11px] text-zinc-500">Hướng dẫn thực tế</small></span>
                        </Button>
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.originWarranty} onClick={() => insertSection('originWarranty')}>
                            {quality.sections.originWarranty ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">5</span>}
                            <span><strong className="block text-xs text-zinc-950">Nguồn gốc & bảo hành</strong><small className="text-[11px] text-zinc-500">Tăng độ tin cậy</small></span>
                        </Button>
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.package} onClick={() => insertSection('package')}>
                            {quality.sections.package ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">6</span>}
                            <span><strong className="block text-xs text-zinc-950">Bộ sản phẩm gồm</strong><small className="text-[11px] text-zinc-500">Liệt kê đầy đủ</small></span>
                        </Button>
                        <Button type="button" variant="outline" className="h-auto justify-start gap-2 px-3 py-2 text-left" disabled={quality.sections.notes} onClick={() => insertSection('notes')}>
                            {quality.sections.notes ? <Check className="size-4 text-emerald-600" /> : <span className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">7</span>}
                            <span><strong className="block text-xs text-zinc-950">Lưu ý khi sử dụng</strong><small className="text-[11px] text-zinc-500">Minh bạch thông tin</small></span>
                        </Button>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Viết mô tả rõ ràng, dễ tin cậy</p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">Nêu điểm nổi bật, thông tin chi tiết và hướng dẫn phù hợp với sản phẩm.</p>
                        </div>
                    </div>
                    <div className="mb-3 flex items-center gap-1 rounded-lg bg-zinc-100 p-1" role="tablist" aria-label="Chế độ chỉnh sửa mô tả">
                        <Button type="button" size="sm" variant={mode === 'write' ? 'secondary' : 'ghost'} className="h-8 gap-1.5" onClick={() => setMode('write')}>
                            <PenLine className="size-3.5" /> Soạn nội dung
                        </Button>
                        <Button type="button" size="sm" variant={mode === 'preview' ? 'secondary' : 'ghost'} className="h-8 gap-1.5" onClick={() => setMode('preview')}>
                            <Eye className="size-3.5" /> Xem trước
                        </Button>
                    </div>
                    {mode === 'write' ? (
                        <Textarea
                            id="product-description"
                            maxLength={30_000}
                            rows={14}
                            className="min-h-64 resize-y border-zinc-300 bg-white text-sm leading-7 shadow-sm focus-visible:ring-zinc-950/15"
                            placeholder="Ví dụ: Điểm nổi bật:\n- Chất liệu...\n\nMô tả chi tiết:\n..."
                            aria-invalid={Boolean(form.formState.errors.description)}
                            aria-describedby="product-description-guidance"
                            {...form.register('description')}
                        />
                    ) : (
                        <div id="product-description" className="min-h-64 rounded-lg border border-zinc-300 bg-white p-4 text-sm leading-7 text-zinc-700" aria-live="polite">
                            {description ? <div className="whitespace-pre-wrap">{description}</div> : <p className="text-zinc-400">Chưa có nội dung để xem trước.</p>}
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
                        <span>{description.length.toLocaleString('vi-VN')}/30.000 ký tự</span>
                        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-zinc-600 hover:text-zinc-950" disabled={!description} onClick={clearDescription}>
                            <Trash2 className="size-3.5" />
                            Xóa nội dung
                        </Button>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200" aria-hidden="true">
                        <div className={`h-full rounded-full transition-all ${quality.minLength ? 'bg-emerald-600' : 'bg-zinc-950'}`} style={{ width: `${completion}%` }} />
                    </div>
                    <p id="product-description-guidance" className="mt-2 text-xs leading-5 text-zinc-500">Nên có ít nhất 100 ký tự để khách hàng hiểu rõ sản phẩm.</p>
                </div>

                <div className="grid gap-2 rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-xs sm:grid-cols-2" aria-label="Kiểm tra chất lượng mô tả">
                    {[
                        [quality.minLength, 'Đủ độ dài tối thiểu 100 ký tự'],
                        [quality.productInfo, 'Có thông tin nhận diện sản phẩm'],
                        [quality.highlights, 'Có điểm nổi bật hoặc cấu trúc rõ ràng'],
                        [quality.safe, 'Không có URL hoặc mã hệ thống'],
                    ].map(([valid, label]) => (
                        <div key={String(label)} className="flex items-center gap-2 text-zinc-600">
                            {valid ? <Check className="size-4 text-emerald-600" /> : <Info className="size-4 text-zinc-400" />}
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="max-w-3xl overflow-hidden p-0">
                    <div className="border-b border-zinc-200 bg-white px-6 py-5">
                        <AlertDialogHeader className="text-left">
                            <div className="flex items-start gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm"><AiAssistantIcon size={22} className="invert" /></span>
                                <div>
                                    <AlertDialogTitle className="text-lg text-zinc-950">AI hỗ trợ tạo mô tả sản phẩm</AlertDialogTitle>
                                    <AlertDialogDescription className="mt-1 text-sm leading-5 text-zinc-600">Tạo một bản mô tả có cấu trúc để bạn kiểm tra và chỉnh sửa trước khi lưu.</AlertDialogDescription>
                                </div>
                            </div>
                        </AlertDialogHeader>
                    </div>

                    <div className="max-h-[min(72vh,44rem)] space-y-4 overflow-y-auto p-6">
                        <div className="grid gap-3 sm:grid-cols-3" aria-label="Ngữ cảnh AI đang sử dụng">
                            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-3.5 shadow-sm">
                                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-zinc-950 text-white"><FolderTree className="size-4" /></div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Ngành hàng</p>
                                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-zinc-950">{references.category?.name ?? 'Chưa chọn'}</p>
                            </div>
                            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-3.5 shadow-sm">
                                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950"><Type className="size-4" /></div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Tên hiện tại</p>
                                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-zinc-950">{values.name || 'Chưa nhập'}</p>
                            </div>
                            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-3.5 shadow-sm">
                                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950"><ImageIcon className="size-4" /></div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Ảnh sẵn sàng</p>
                                <p className="mt-1 text-sm font-semibold leading-5 text-zinc-950"><span className="text-lg">{readyImages.length}</span><span className="text-zinc-400"> / 3 ảnh</span></p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-600">
                            <Info className="mt-1 size-4 shrink-0 text-zinc-950" />
                            <p>AI chỉ gợi ý. Hãy kiểm tra thông tin, thông số và hướng dẫn trước khi lưu sản phẩm.</p>
                        </div>
                        <Button type="button" className="h-11 w-full bg-zinc-950 text-white hover:bg-zinc-800" disabled={Boolean(disabledReason) || assistant.isLoading} onClick={handleGenerate}>
                            {assistant.isLoading ? <><Loader2 className="size-4 animate-spin" /> Đang phân tích sản phẩm...</> : <><AiAssistantIcon size={16} className="invert" /> {assistant.description ? 'Tạo lại mô tả' : 'Gợi ý nội dung bằng AI'}</>}
                        </Button>
                        <p className="text-xs text-zinc-500" aria-live="polite">{disabledReason ?? `${readyImages.length}/3 ảnh sản phẩm và thông tin ngành hàng sẽ được dùng để tạo nội dung.`}</p>
                        {assistant.errorMessage ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert" aria-live="assertive">{assistant.errorMessage}</p> : null}
                        {assistant.isLoading ? <div className="space-y-3" aria-live="polite" aria-label="AI đang tạo mô tả sản phẩm"><Skeleton className="h-56 w-full rounded-xl" /><Skeleton className="h-5 w-2/3 rounded" /></div> : null}
                        {!assistant.isLoading && assistant.description ? <div className="rounded-xl border border-zinc-200 bg-white p-5" aria-live="polite"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Bản mô tả đề xuất</p><div className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-zinc-700">{assistant.description}</div></div> : null}
                        {assistant.warnings.length > 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status"><div className="flex items-start gap-2"><AlertTriangle className="mt-1 size-4 shrink-0" /><div><p className="font-semibold">AI đã lọc thông tin cần bảo vệ</p><ul className="mt-1 list-disc space-y-1 pl-4">{assistant.warnings.map((warning) => <li key={`${warning.code}-${warning.field}`}>{warning.message}</li>)}</ul></div></div></div> : null}
                    </div>
                    <AlertDialogFooter className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                        <AlertDialogCancel className="mt-0">Đóng</AlertDialogCancel>
                        <Button type="button" className="bg-zinc-950 text-white hover:bg-zinc-800" disabled={!assistant.description || assistant.isLoading} onClick={applyDescription}>Dùng nội dung này</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ProductFormField>
    );
}
