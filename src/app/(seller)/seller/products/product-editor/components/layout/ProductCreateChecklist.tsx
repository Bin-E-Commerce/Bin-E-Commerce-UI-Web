'use client';
import { Button } from '@/components/ui/button';

//
// Thanh tiến độ ngang của wizard tạo/chỉnh sửa sản phẩm.
// Component chỉ hiển thị trạng thái validation và phát sự kiện chuyển bước;
// logic kiểm tra dữ liệu vẫn thuộc về editor hook để mọi giao diện dùng chung một nguồn sự thật.
//

import { Check, Circle, CircleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRODUCT_CREATE_STEPS } from '../../constants/product-create-steps.constant';
import type {
    ProductCreateStepId,
    ProductCreateStepValidations,
} from '../../types/product-create-step.type';

interface ProductCreateChecklistProps {
    activeStep: ProductCreateStepId;
    validations: ProductCreateStepValidations;
    onStepChange: (step: ProductCreateStepId) => void;
}

// Tính phần trăm hoàn thành từ cùng bộ validation mà form đang sử dụng,
// nhờ đó thanh tiến độ không bị lệch khi seller chuyển bước hoặc chỉnh sửa dữ liệu.
function getCompletionPercentage(
    validations: ProductCreateStepValidations,
): number {
    const completedCount = PRODUCT_CREATE_STEPS.filter(
        (step) => validations[step.id].valid,
    ).length;

    return Math.round((completedCount / PRODUCT_CREATE_STEPS.length) * 100);
}

// Hiển thị tiến độ và các bước trong mật độ gọn, nhưng vẫn giữ lưới responsive.
// Nút tự cao theo nội dung vì Button mặc định có chiều cao cố định và nowrap.
// Lưới lấy chiều cao theo nội dung dài nhất; các nút lấp đầy ô để card cùng cao.
export function ProductCreateChecklist({
    activeStep,
    validations,
    onStepChange,
}: ProductCreateChecklistProps) {
    const completion = getCompletionPercentage(validations);

    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Tiến độ sản phẩm
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <h2 className="text-base font-semibold leading-5 text-zinc-950 sm:text-lg">
                            Hoàn thiện thông tin
                        </h2>
                        <span className="text-xs font-semibold tabular-nums text-zinc-600">
                            {completion}%
                        </span>
                    </div>
                </div>
            </div>

            <nav
                className="border-t border-zinc-100 px-3 py-2.5 sm:px-4"
                aria-label="Các bước tạo sản phẩm"
            >
                <ol className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
                    {PRODUCT_CREATE_STEPS.map((step, index) => {
                        const validation = validations[step.id];
                        const active = activeStep === step.id;
                        const errorCount = validation.errors.length;
                        const statusText = validation.valid
                            ? 'Đã hoàn tất'
                            : errorCount > 1
                              ? `${validation.errors[0]} (+${errorCount - 1})`
                              : (validation.errors[0] ?? step.description);

                        return (
                            <li key={step.id} className="flex min-w-0">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    className={cn(
                                        'flex h-full min-h-14 w-full min-w-0 items-start gap-2 whitespace-normal rounded-lg border px-2.5 py-2 text-left transition-[background-color,border-color,box-shadow,color]',
                                        active
                                            ? 'border-zinc-950 bg-zinc-50 text-zinc-950 shadow-[0_8px_18px_-14px_rgba(0,0,0,0.45)]'
                                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950',
                                    )}
                                    onClick={() => onStepChange(step.id)}
                                    aria-current={active ? 'step' : undefined}
                                    title={`${index + 1}. ${step.label} — ${statusText}`}
                                >
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                                            active
                                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                                : validation.valid
                                                  ? 'border-zinc-950 bg-zinc-950 text-white'
                                                  : validation.errors.length > 0
                                                    ? 'border-red-200 text-red-500'
                                                    : 'border-zinc-300 text-zinc-400',
                                        )}
                                    >
                                        {active ? (
                                            <Circle className="size-2 fill-current" />
                                        ) : validation.valid ? (
                                            <Check className="size-2.5" />
                                        ) : validation.errors.length > 0 ? (
                                            <CircleAlert className="size-2.5" />
                                        ) : (
                                            <Circle className="size-1.5 fill-current" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block break-words text-xs font-semibold leading-4">
                                            <span className="mr-1 text-[10px] font-medium opacity-60">
                                                {index + 1}.
                                            </span>
                                            {step.label}
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-0.5 block break-words text-[11px] leading-4',
                                                active
                                                    ? 'text-zinc-600'
                                                    : 'text-zinc-500',
                                            )}
                                        >
                                            {statusText}
                                        </span>
                                    </span>
                                </Button>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <p className="border-t border-zinc-100 px-3 py-2 text-[11px] leading-4 text-zinc-500 sm:px-4">
                Chỉ có thể đăng bán khi các trường bắt buộc và từng SKU đều hợp
                lệ.
            </p>
        </section>
    );
}
