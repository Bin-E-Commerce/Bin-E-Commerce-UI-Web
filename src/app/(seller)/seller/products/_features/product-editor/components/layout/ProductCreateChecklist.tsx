'use client';

/**
 * Thanh tiến độ ngang của wizard tạo/chỉnh sửa sản phẩm.
 * Component chỉ hiển thị trạng thái validation và phát sự kiện chuyển bước;
 * logic kiểm tra dữ liệu vẫn thuộc về editor hook để mọi giao diện dùng chung một nguồn sự thật.
 */

import { Check, Circle, CircleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRODUCT_CREATE_STEPS } from '../../constants/product-create-steps.constant';
import type { ProductCreateStepId, ProductCreateStepValidations } from '../../types/product-create-step.type';

interface ProductCreateChecklistProps {
    activeStep: ProductCreateStepId;
    validations: ProductCreateStepValidations;
    onStepChange: (step: ProductCreateStepId) => void;
}

// Tính phần trăm hoàn thành từ cùng bộ validation mà form đang sử dụng,
// nhờ đó thanh tiến độ không bị lệch khi seller chuyển bước hoặc chỉnh sửa dữ liệu.
function getCompletionPercentage(validations: ProductCreateStepValidations): number {
    const completedCount = PRODUCT_CREATE_STEPS.filter((step) => validations[step.id].valid).length;

    return Math.round((completedCount / PRODUCT_CREATE_STEPS.length) * 100);
}

// Hiển thị trạng thái từng bước theo dạng ngang để tên bước có đủ chiều rộng,
// đồng thời vẫn giữ nhãn lỗi ngắn và số lượng lỗi còn lại để seller biết cần xử lý gì.
export function ProductCreateChecklist({
    activeStep,
    validations,
    onStepChange,
}: ProductCreateChecklistProps) {
    const completion = getCompletionPercentage(validations);

    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Tiến độ sản phẩm
                    </p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="text-lg font-semibold leading-6 text-zinc-950 sm:text-xl">
                            Hoàn thiện thông tin
                        </h2>
                        <span className="text-sm font-semibold tabular-nums text-zinc-600">
                            {completion}%
                        </span>
                    </div>
                </div>

                <div className="flex w-full items-center gap-3 lg:max-w-[260px]">
                    <div
                        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100"
                        role="progressbar"
                        aria-label="Tiến độ hoàn thiện sản phẩm"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={completion}
                    >
                        <div
                            className="h-full rounded-full bg-zinc-950 transition-[width] duration-300"
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                </div>
            </div>

            <nav
                className="border-t border-zinc-100 px-3 py-3 sm:px-5 sm:py-4"
                aria-label="Các bước tạo sản phẩm"
            >
                <ol className="grid gap-2 md:grid-cols-5">
                    {PRODUCT_CREATE_STEPS.map((step, index) => {
                        const validation = validations[step.id];
                        const active = activeStep === step.id;
                        const errorCount = validation.errors.length;
                        const statusText = validation.valid
                            ? 'Đã hoàn tất'
                            : errorCount > 1
                              ? `${validation.errors[0]} (+${errorCount - 1})`
                              : validation.errors[0] ?? step.description;

                        return (
                            <li key={step.id} className="min-w-0">
                                <button
                                    type="button"
                                    className={cn(
                                        'flex min-h-[4.25rem] w-full min-w-0 items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                                        active
                                            ? 'bg-zinc-950 text-white shadow-sm'
                                            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
                                    )}
                                    onClick={() => onStepChange(step.id)}
                                    aria-current={active ? 'step' : undefined}
                                    title={`${index + 1}. ${step.label} — ${statusText}`}
                                >
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                                            active
                                                ? 'border-white/30 bg-white/10 text-white'
                                                : validation.valid
                                                  ? 'border-zinc-950 bg-zinc-950 text-white'
                                                  : validation.errors.length > 0
                                                    ? 'border-red-200 text-red-500'
                                                    : 'border-zinc-300 text-zinc-400',
                                        )}
                                    >
                                        {active ? (
                                            <Circle className="size-2.5 fill-current" />
                                        ) : validation.valid ? (
                                            <Check className="size-3" />
                                        ) : validation.errors.length > 0 ? (
                                            <CircleAlert className="size-3" />
                                        ) : (
                                            <Circle className="size-2 fill-current" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block break-words text-sm font-semibold leading-5">
                                            <span className="mr-1 text-xs font-medium opacity-60">{index + 1}.</span>
                                            {step.label}
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-1 block break-words text-xs leading-4',
                                                active ? 'text-zinc-300' : 'text-zinc-500',
                                            )}
                                        >
                                            {statusText}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <p className="border-t border-zinc-100 px-4 py-3 text-xs leading-5 text-zinc-500 sm:px-5">
                Chỉ có thể đăng bán khi các trường bắt buộc và từng SKU đều hợp lệ.
            </p>
        </section>
    );
}
