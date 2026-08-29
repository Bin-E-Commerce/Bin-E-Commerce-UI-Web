//
// File này cung cấp nút AI cạnh field tên và popup hiển thị toàn bộ luồng gợi ý sản phẩm.
// Component chỉ quản lý trạng thái mở popup và ghi suggestion được seller chọn vào field name;
// không tự submit form, không sở hữu asset AI và không chứa logic gọi provider trực tiếp.
//

'use client';

import { useMemo, useState } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import {
    AlertTriangle,
    Check,
    Info,
    Loader2,
} from 'lucide-react';

import {
    AiAssistantButton,
    AiAssistantIcon,
} from '@/components/ui/ai-assistant-button';
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
import { useSessionPermission } from '@/services/auth/access/useSessionAccess';
import type { ProductNameSuggestion } from '@/services/ai';
import type {
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../../../types/seller-product-create-form.type';
import { useProductNameSuggestions } from '../hooks/useProductNameSuggestions';
import {
    buildProductNameSuggestionRequest,
    getReadyProductImages,
} from '../utils/build-product-name-request';

interface ProductContentAssistantProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    references: SellerProductCreateReferences;
}

const AI_PRODUCT_CONTENT_PERMISSION = 'seller.ai.product_content.generate';

// Hiển thị nút AI nhỏ cạnh label, giữ form gọn nhưng vẫn giải thích được chức năng qua tooltip và aria-label.
export function ProductContentAssistant({
    form,
    references,
}: ProductContentAssistantProps) {
    const [open, setOpen] = useState(false);
    const values = useWatch({ control: form.control }) as SellerProductCreateFormValues;
    const canUseAi = useSessionPermission(AI_PRODUCT_CONTENT_PERMISSION);
    const readyImages = useMemo(() => getReadyProductImages(values.images), [values.images]);
    const request = useMemo(
        () => buildProductNameSuggestionRequest(values, references),
        [references, values],
    );
    const assistant = useProductNameSuggestions();

    // Gom toàn bộ điều kiện còn thiếu thay vì dừng ở lỗi đầu tiên, để seller biết chính xác
    // cần cấp quyền, chọn ngành hàng hay tải ảnh sản phẩm lên trước khi thao tác với AI.
    const disabledReasons = [
        !canUseAi ? 'tài khoản chưa được cấp quyền sử dụng trợ lý AI' : undefined,
        !references.category ? 'chưa chọn ngành hàng' : undefined,
        readyImages.length === 0 ? 'chưa có ít nhất một ảnh sản phẩm đã tải lên' : undefined,
    ].filter((reason): reason is string => Boolean(reason));
    const disabledReason = disabledReasons.length > 0
        ? `Chưa đủ điều kiện thực hiện chức năng AI: ${disabledReasons.join('; ')}.`
        : undefined;

    // Mở popup chỉ khi input hợp lệ; disabledReason được hiển thị trong popup để seller biết cần bổ sung gì.
    const handleOpen = () => {
        if (!disabledReason) setOpen(true);
    };

    // Chỉ gửi request từ nút trong popup và chặn request trùng khi mutation hiện tại chưa hoàn tất.
    const handleGenerate = () => {
        if (disabledReason || assistant.isLoading) return;
        assistant.generate(request);
    };

    // Ghi duy nhất trường name rồi đóng popup để seller tiếp tục kiểm tra form trước khi submit.
    const applySuggestion = (suggestion: ProductNameSuggestion) => {
        form.setValue('name', suggestion.title, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setOpen(false);
    };

    return (
        <>
            <AiAssistantButton
                tooltip={disabledReason ?? 'AI hỗ trợ tạo tên sản phẩm từ ảnh, ngành hàng và thông tin bạn nhập.'}
                ariaLabel="Mở trợ lý AI gợi ý tên sản phẩm"
                ariaHasPopup="dialog"
                ariaExpanded={open}
                disabled={Boolean(disabledReason)}
                onClick={handleOpen}
            />

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="max-w-2xl overflow-hidden p-0">
                    <div className="border-b border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 px-6 py-5 text-zinc-950">
                        <AlertDialogHeader className="text-left">
                            <div className="flex items-start gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm">
                                    <AiAssistantIcon size={22} />
                                </span>
                                <div>
                                    <AlertDialogTitle className="text-lg text-zinc-950">
                                        AI hỗ trợ đặt tên sản phẩm
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="mt-1 text-sm leading-5 text-zinc-600">
                                        Phân tích tối đa 3 ảnh, ngành hàng và thông tin bạn nhập để đề xuất tên phù hợp.
                                    </AlertDialogDescription>
                                </div>
                            </div>
                        </AlertDialogHeader>
                    </div>

                    <div className="max-h-[min(70vh,38rem)] space-y-4 overflow-y-auto p-6">
                        <div className="flex items-start gap-2 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                            <Info className="mt-1 size-4 shrink-0 text-zinc-950" />
                            <p>AI chỉ gợi ý. Bạn cần chọn tên và kiểm tra lại trước khi lưu sản phẩm.</p>
                        </div>

                        <Button
                            type="button"
                            className="h-11 w-full bg-zinc-950 text-white hover:bg-zinc-800"
                            disabled={Boolean(disabledReason) || assistant.isLoading}
                            onClick={handleGenerate}
                        >
                            {assistant.isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Đang phân tích ảnh...
                                </>
                            ) : (
                                <>
                                    <AiAssistantIcon size={16} className="invert" />
                                    Gợi ý tên sản phẩm
                                </>
                            )}
                        </Button>

                        <p className="text-xs leading-5 text-zinc-500" aria-live="polite">
                            {disabledReason ?? `${readyImages.length}/3 ảnh sản phẩm đã sẵn sàng cho AI.`}
                        </p>

                        {assistant.errorMessage ? (
                            <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert" aria-live="assertive">
                                {assistant.errorMessage}
                            </p>
                        ) : null}

                        {assistant.isLoading ? (
                            <div className="space-y-3" aria-live="polite" aria-label="AI đang tạo tên sản phẩm">
                                {[1, 2, 3].map((item) => (
                                    <Skeleton key={item} className="h-28 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : null}

                        {!assistant.isLoading && assistant.suggestions.length > 0 ? (
                            <div className="space-y-3" aria-live="polite">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Đề xuất dành cho bạn
                                </p>
                                {assistant.suggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.id}
                                        className={`rounded-xl border p-4 transition-colors ${suggestion.recommended ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-950'}`}
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                {suggestion.recommended ? (
                                                    <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
                                                        <Check className="size-3" />
                                                        Đề xuất tốt nhất
                                                    </span>
                                                ) : null}
                                                <p className="text-sm font-semibold leading-6">{suggestion.title}</p>
                                                <p className={`mt-1 text-xs leading-5 ${suggestion.recommended ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                                    {suggestion.reason}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={suggestion.recommended ? 'secondary' : 'outline'}
                                                className="shrink-0 self-start"
                                                onClick={() => applySuggestion(suggestion)}
                                            >
                                                Dùng tên này
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {assistant.warnings.length > 0 ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-1 size-4 shrink-0" />
                                    <div>
                                        <p className="font-semibold">AI đã lọc thông tin cần bảo vệ</p>
                                        <ul className="mt-1 list-disc space-y-1 pl-4">
                                            {assistant.warnings.map((warning) => (
                                                <li key={`${warning.code}-${warning.field}`}>{warning.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <AlertDialogFooter className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                        <AlertDialogCancel className="mt-0">Đóng</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
