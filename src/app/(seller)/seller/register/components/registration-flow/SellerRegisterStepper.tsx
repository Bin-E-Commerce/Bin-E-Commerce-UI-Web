'use client';

import { Check } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { SellerRegisterStep } from '../../types/seller-register-step.type';

interface SellerRegisterStepperProps {
    steps: SellerRegisterStep[];
    currentStep: number;
    progressValue: number;
    maxReachableStep: number;
    onStepChange: (step: number) => void;
}

// Stepper hiển thị tiến độ và khóa bước sau cho tới khi các bước trước đó hợp lệ.
export function SellerRegisterStepper({
    steps,
    currentStep,
    progressValue,
    maxReachableStep,
    onStepChange,
}: SellerRegisterStepperProps) {
    return (
        <aside className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Tiến độ hồ sơ
                </p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-950">
                    Đăng ký người bán
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Hoàn thiện từng nhóm thông tin theo thứ tự để hồ sơ được
                    kiểm tra nhanh hơn.
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700">Hoàn tất</span>
                    <span className="tabular-nums text-zinc-500">
                        {Math.round(progressValue)}%
                    </span>
                </div>
                <Progress value={progressValue} />
            </div>

            <div className="space-y-2">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const active = currentStep === index;
                    const completed = currentStep > index;
                    const disabled = index > maxReachableStep;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            disabled={disabled}
                            aria-disabled={disabled}
                            onClick={() => onStepChange(index)}
                            className={cn(
                                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                                active
                                    ? 'border-zinc-950 bg-zinc-950 text-white'
                                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
                                disabled
                                    ? 'cursor-not-allowed opacity-50 hover:border-zinc-200 hover:bg-white'
                                    : '',
                            )}
                        >
                            <span
                                className={cn(
                                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
                                    active ? 'bg-white/10' : 'bg-zinc-100',
                                    completed ? 'bg-zinc-950 text-white' : '',
                                )}
                            >
                                {completed ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Icon className="size-4" />
                                )}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold">
                                    {step.title}
                                </span>
                                <span
                                    className={cn(
                                        'mt-0.5 block text-xs leading-5',
                                        active ? 'text-zinc-300' : 'text-zinc-500',
                                    )}
                                >
                                    {step.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-950">
                    Gợi ý duyệt nhanh
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                    Dùng số điện thoại đang hoạt động, địa chỉ lấy hàng rõ ràng
                    và tên shop dễ nhận diện.
                </p>
            </div>
        </aside>
    );
}
