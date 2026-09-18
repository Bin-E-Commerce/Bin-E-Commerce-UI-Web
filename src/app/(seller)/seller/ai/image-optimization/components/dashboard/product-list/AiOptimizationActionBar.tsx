// Thanh thao tác tạo job tối ưu ảnh.
// Component chỉ nhận state đã chuẩn hóa và phát callback; không biết React Query hay lifecycle job.

'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';
import { LifestyleBackgroundStudio } from '../../background-studio/LifestyleBackgroundStudio';
import { ProductImageSelectionPanel } from '../../product-image-selection/ProductImageSelectionPanel';
import type {
    LifestyleBackgroundInput,
    OptimizationMode,
} from '@/services/ai/types/image-optimization.types';

export interface ProductImageSelectionChange {
    assetIds: string[];
    primaryImageUrl: string | null;
}

interface AiOptimizationActionBarProps {
    selectedIds: string[];
    selectedAssetIdsByProduct: Record<string, string[]>;
    mode: OptimizationMode;
    lifestyleBackground: LifestyleBackgroundInput;
    canGenerate: boolean;
    createPending: boolean;
    aiQuotaExhausted: boolean;
    hasInvalidLifestyleDescription: boolean;
    onModeChange: (mode: OptimizationMode) => void;
    onLifestyleBackgroundChange: (value: LifestyleBackgroundInput) => void;
    onImageSelectionChange: (
        productId: string,
        selection: ProductImageSelectionChange,
    ) => void;
    onStartOptimization: () => void;
}

// Render toàn bộ input trước khi tạo job, giữ một nguồn duy nhất cho điều kiện disable CTA và source asset.
// Product phải chọn đúng một ảnh trước khi gọi API; điều kiện này được kiểm tra lại ở backend nhưng cần phản hồi sớm ở UI.
export function AiOptimizationActionBar({
    selectedIds,
    selectedAssetIdsByProduct,
    mode,
    lifestyleBackground,
    canGenerate,
    createPending,
    aiQuotaExhausted,
    hasInvalidLifestyleDescription,
    onModeChange,
    onLifestyleBackgroundChange,
    onImageSelectionChange,
    onStartOptimization,
}: AiOptimizationActionBarProps) {
    const selectedProductId = selectedIds[0];
    const selectedAssetIds = selectedProductId
        ? (selectedAssetIdsByProduct[selectedProductId] ?? [])
        : [];
    const hasValidOptimizationSelection =
        selectedIds.length === 1 && selectedAssetIds.length === 1;
    const inputDisabled = !canGenerate || createPending;

    return (
        <div className="sticky bottom-4 z-10 mb-0 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-zinc-950">
                        Chọn ảnh và kiểu ảnh bạn muốn tối ưu
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={mode}
                        onValueChange={(value) =>
                            onModeChange(value as OptimizationMode)
                        }
                    >
                        <SelectTrigger className="h-10 min-w-36 rounded-xl border-zinc-200 bg-white text-sm text-zinc-700 focus:ring-zinc-950">
                            <SelectValue
                                className="sr-only"
                                placeholder="Chọn kiểu ảnh"
                            />
                            <span aria-hidden="true">
                                {mode === 'WHITE_BACKGROUND'
                                    ? 'Nền trắng'
                                    : 'Nền lifestyle'}
                            </span>
                        </SelectTrigger>
                        <SelectContent
                            side="bottom"
                            align="end"
                            alignItemWithTrigger={false}
                            collisionAvoidance={{
                                side: 'shift',
                                align: 'shift',
                                fallbackAxisSide: 'none',
                            }}
                            className="rounded-xl border-zinc-200"
                        >
                            <SelectItem value="WHITE_BACKGROUND">
                                Nền trắng
                            </SelectItem>
                            <SelectItem value="LIFESTYLE_BACKGROUND">
                                Nền lifestyle
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={onStartOptimization}
                        disabled={
                            inputDisabled ||
                            !hasValidOptimizationSelection ||
                            hasInvalidLifestyleDescription ||
                            aiQuotaExhausted
                        }
                    >
                        {createPending
                            ? 'Đang tạo yêu cầu...'
                            : aiQuotaExhausted
                              ? 'Đã hết lượt AI'
                              : 'Bắt đầu tối ưu'}
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>

            {selectedProductId ? (
                <ProductImageSelectionPanel
                    productId={selectedProductId}
                    selectedAssetIds={selectedAssetIds}
                    disabled={inputDisabled}
                    onChange={(selection) =>
                        onImageSelectionChange(selectedProductId, selection)
                    }
                />
            ) : null}

            {mode === 'LIFESTYLE_BACKGROUND' ? (
                <LifestyleBackgroundStudio
                    value={lifestyleBackground}
                    selectedProductCount={selectedIds.length}
                    disabled={inputDisabled}
                    onChange={onLifestyleBackgroundChange}
                />
            ) : null}
        </div>
    );
}
