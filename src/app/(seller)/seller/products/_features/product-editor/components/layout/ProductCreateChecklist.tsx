'use client';

import { Check, Circle, CircleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRODUCT_CREATE_STEPS } from '../../constants/product-create-steps.constant';
import type { ProductCreateStepId, ProductCreateStepValidations } from '../../types/product-create-step.type';

interface ProductCreateChecklistProps {
    activeStep: ProductCreateStepId;
    validations: ProductCreateStepValidations;
    onStepChange: (step: ProductCreateStepId) => void;
}

// Hiển thị tiến độ theo cùng validator với wizard để trạng thái trên sidebar không bị lệch với dữ liệu thực tế.
export function ProductCreateChecklist({
    activeStep,
    validations,
    onStepChange,
}: ProductCreateChecklistProps) {
    const completedCount = PRODUCT_CREATE_STEPS.filter(
        (step) => validations[step.id].valid,
    ).length;
    const completion = Math.round((completedCount / PRODUCT_CREATE_STEPS.length) * 100);

    return (
        <aside>
            <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Tiến độ sản phẩm
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-lg font-semibold text-zinc-950">Hoàn thiện thông tin</p>
                    <span className="text-sm font-medium tabular-nums text-zinc-600">
                        {completion}%
                    </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                        className="h-full bg-zinc-950 transition-[width] duration-300"
                        style={{ width: `${completion}%` }}
                    />
                </div>

                <nav className="mt-5 space-y-1" aria-label="Các bước tạo sản phẩm">
                    {PRODUCT_CREATE_STEPS.map((step) => {
                        const validation = validations[step.id];
                        const active = activeStep === step.id;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                className={cn(
                                    'flex min-h-12 w-full items-center gap-3 rounded-md px-2 text-left text-sm transition-colors',
                                    active
                                        ? 'bg-zinc-950 text-white'
                                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
                                )}
                                onClick={() => onStepChange(step.id)}
                            >
                                <span
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-full border',
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
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">{step.label}</span>
                                    <span
                                        className={cn(
                                            'mt-0.5 block truncate text-xs',
                                            active ? 'text-zinc-300' : 'text-zinc-500',
                                        )}
                                    >
                                        {validation.valid
                                            ? 'Đã hoàn tất'
                                            : validation.errors[0] ?? step.description}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <p className="mt-5 border-t border-zinc-200 pt-4 text-xs leading-5 text-zinc-500">
                    Chỉ có thể đăng bán khi các trường bắt buộc và từng SKU đều hợp lệ.
                </p>
            </div>
        </aside>
    );
}
