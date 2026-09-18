// Stepper dùng chung cho lúc tạo preview và lúc tạo ảnh chất lượng cao.
// Component chỉ đọc snapshot job, tự quản lý bộ đếm thời gian hiển thị và không gọi API hay điều phối mutation.

'use client';

import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizationFlowState } from '../../../utils/optimization-flow.utils';
import type {
    ImageGenerationProfile,
    ImageOptimizationJob,
    OptimizationFlowState,
    OptimizationFlowStepId,
    OptimizationFlowStepState,
} from '@/services/ai/types/image-optimization.types';
import { useEffect, useRef, useState } from 'react';

interface OptimizationFlowStepperProps {
    mode: 'PREVIEW' | 'FINAL';
    status?: ImageOptimizationJob['status'];
    generationProfile?: ImageGenerationProfile;
    processingStage?: ImageOptimizationJob['processingStage'];
}

// Hiển thị nhãn trực tiếp tại nơi render để copy tiếng Việt dễ rà soát và không bị tách khỏi ngữ cảnh giao diện.
function StepLabel({ id }: { id: OptimizationFlowStepId }) {
    switch (id) {
        case 'SOURCE':
            return <>Đang lấy ảnh gốc</>;
        case 'PREPARE_PREVIEW':
            return <>Đang chuẩn bị bản xem nhanh</>;
        case 'GENERATE_PREVIEW':
            return <>AI đang tạo bản xem nhanh</>;
        case 'SAVE_PREVIEW':
            return <>Đang lưu bản xem trước</>;
        case 'PREVIEW_READY':
            return <>Bản xem nhanh đã sẵn sàng</>;
        case 'PREVIEW_CONFIRMED':
            return <>Đã xác nhận bản xem nhanh</>;
        case 'GENERATE_FINAL':
            return <>Đang tạo ảnh chất lượng cao</>;
        case 'UPDATE_PRODUCT':
            return <>Đang cập nhật ảnh vào sản phẩm</>;
        case 'APPLIED':
            return <>Đã áp dụng ảnh mới</>;
    }
}

// Định dạng số giây đã xử lý để seller biết hệ thống vẫn đang hoạt động mà không tạo đếm ngược giả.
function formatElapsedSeconds(seconds: number): string {
    return `Đã xử lý ${seconds} giây`;
}

// Chọn icon và màu cho từng trạng thái step, giữ cùng một ngôn ngữ hình ảnh giữa preview và finalization.
function StepIndicator({ state }: { state: OptimizationFlowStepState }) {
    if (state === 'COMPLETED')
        return <Check className="size-3.5" aria-hidden="true" />;
    if (state === 'ERROR')
        return <AlertCircle className="size-3.5" aria-hidden="true" />;
    if (state === 'ACTIVE')
        return (
            <span
                className="size-3.5 animate-[spin_900ms_linear_infinite] rounded-full border-2 border-zinc-300 border-t-zinc-950"
                aria-hidden="true"
            />
        );
    return (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
    );
}

// Dàn các bước theo từng nhịp khi polling trả về trạng thái cuối quá nhanh, nhưng không thay đổi trạng thái thật của job.
function getDisplayedSteps(
    flow: ReturnType<typeof getOptimizationFlowState>,
    visibleStepIndex: number,
    displayedComplete: boolean,
): OptimizationFlowState['steps'] {
    const targetStepIndex = flow.steps.length - 1;
    const activeStepIndex = Math.min(visibleStepIndex, targetStepIndex);

    return flow.steps.map((step, index) => ({
        ...step,
        state:
            flow.isError && index === activeStepIndex
                ? 'ERROR'
                : flow.isComplete && displayedComplete
                  ? 'COMPLETED'
                  : index < activeStepIndex
                    ? 'COMPLETED'
                    : index === activeStepIndex
                      ? 'ACTIVE'
                      : 'PENDING',
    }));
}

// Render step ngang trong vùng thông tin sản phẩm, chỉ cập nhật timer từ callback interval để tránh cascading render trong effect.
export function OptimizationFlowStepper({
    mode,
    status,
    generationProfile,
    processingStage,
}: OptimizationFlowStepperProps) {
    const flow = getOptimizationFlowState({
        mode,
        status,
        generationProfile,
        processingStage,
    });
    const isRunning = !flow.isComplete && !flow.isError;
    const startedAtRef = useRef<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const targetStepIndex = flow.isComplete
        ? flow.steps.length - 1
        : Math.max(
              0,
              flow.steps.findIndex(
                  (step) => step.state === 'ACTIVE' || step.state === 'ERROR',
              ),
          );
    const [visibleStepIndex, setVisibleStepIndex] = useState(0);
    const [displayedComplete, setDisplayedComplete] = useState(false);

    // Cho seller nhìn thấy từng bước kể cả khi worker đã xử lý xong trước lần polling kế tiếp.
    useEffect(() => {
        if (visibleStepIndex < targetStepIndex) {
            const timer = window.setTimeout(
                () => {
                    setVisibleStepIndex((currentIndex) =>
                        Math.min(currentIndex + 1, targetStepIndex),
                    );
                },
                mode === 'FINAL' ? 900 : 650,
            );

            return () => window.clearTimeout(timer);
        }

        if (!flow.isComplete || displayedComplete) return;

        const timer = window.setTimeout(() => setDisplayedComplete(true), 650);
        return () => window.clearTimeout(timer);
    }, [
        displayedComplete,
        flow.isComplete,
        mode,
        targetStepIndex,
        visibleStepIndex,
    ]);

    // Reset mốc thời gian khi flow dừng; khi chạy lại, callback đầu tiên sẽ tạo mốc mới mà không setState đồng bộ.
    useEffect(() => {
        if (!isRunning) {
            startedAtRef.current = null;
            return;
        }

        startedAtRef.current = Date.now();
        const timer = window.setInterval(() => {
            setElapsedSeconds(
                Math.max(
                    0,
                    Math.floor(
                        (Date.now() - (startedAtRef.current ?? Date.now())) /
                            1000,
                    ),
                ),
            );
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isRunning]);

    const title = flow.isError
        ? 'Không thể hoàn tất yêu cầu'
        : flow.isComplete && displayedComplete
          ? mode === 'FINAL'
              ? 'Đã áp dụng ảnh chất lượng cao'
              : 'Bản xem nhanh đã sẵn sàng'
          : mode === 'FINAL'
            ? 'Đang hoàn thiện ảnh chất lượng cao'
            : 'Đang tạo bản xem nhanh';
    const displayedSteps = getDisplayedSteps(
        flow,
        visibleStepIndex,
        displayedComplete,
    );
    const displayedIsComplete = flow.isComplete && displayedComplete;

    return (
        <section
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 shadow-sm"
            role="status"
            aria-live="polite"
            aria-busy={isRunning || (flow.isComplete && !displayedComplete)}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-lg text-white',
                            flow.isError ? 'bg-zinc-700' : 'bg-zinc-950',
                        )}
                    >
                        {flow.isError ? (
                            <AlertCircle
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        ) : displayedIsComplete ? (
                            <Check className="size-3.5" aria-hidden="true" />
                        ) : (
                            <span
                                className="size-3.5 animate-[spin_900ms_linear_infinite] rounded-full border-2 border-zinc-700 border-t-white"
                                aria-hidden="true"
                            />
                        )}
                    </span>
                    <p className="text-xs font-semibold text-zinc-950">
                        {title}
                    </p>
                </div>
                {mode === 'FINAL' && isRunning ? (
                    <p className="text-[11px] font-medium tabular-nums text-zinc-500">
                        Thường mất 30–60 giây ·{' '}
                        {formatElapsedSeconds(elapsedSeconds)}
                    </p>
                ) : null}
            </div>

            <div
                className={cn(
                    'mt-3 grid gap-2',
                    flow.steps.length === 5
                        ? 'grid-cols-2 sm:grid-cols-5'
                        : 'grid-cols-2 sm:grid-cols-4',
                )}
            >
                {displayedSteps.map((step, index) => (
                    <div
                        key={step.id}
                        className="relative flex min-w-0 flex-col items-center text-center"
                    >
                        {index < flow.steps.length - 1 ? (
                            <span
                                className={cn(
                                    'absolute left-1/2 right-[-50%] top-2.5 hidden h-px sm:block',
                                    step.state === 'COMPLETED'
                                        ? 'bg-zinc-950'
                                        : 'bg-zinc-200',
                                )}
                                aria-hidden="true"
                            />
                        ) : null}
                        <span
                            className={cn(
                                'relative z-10 flex size-5 items-center justify-center rounded-full',
                                step.state === 'COMPLETED'
                                    ? 'bg-zinc-950 text-white'
                                    : step.state === 'ACTIVE'
                                      ? 'border border-zinc-950 bg-white text-zinc-950'
                                      : step.state === 'ERROR'
                                        ? 'bg-zinc-700 text-white'
                                        : 'border border-zinc-200 bg-zinc-50 text-zinc-400',
                            )}
                        >
                            <StepIndicator state={step.state} />
                        </span>
                        <span
                            className={cn(
                                'mt-1.5 max-w-32 text-[10px] leading-4',
                                step.state === 'ACTIVE'
                                    ? 'font-semibold text-zinc-950'
                                    : step.state === 'ERROR'
                                      ? 'font-semibold text-zinc-700'
                                      : step.state === 'COMPLETED'
                                        ? 'text-zinc-600'
                                        : 'text-zinc-400',
                            )}
                        >
                            <StepLabel id={step.id} />
                        </span>
                    </div>
                ))}
            </div>

            {!displayedIsComplete && !flow.isError ? (
                <div
                    className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100"
                    role="progressbar"
                    aria-label={title}
                    aria-valuetext={title}
                >
                    <div className="h-full w-2/5 rounded-full bg-zinc-950 animate-[apply-progress_1.8s_ease-in-out_infinite] motion-reduce:animate-none" />
                </div>
            ) : null}
            {mode === 'FINAL' && isRunning ? (
                <p className="mt-2 text-[10px] leading-4 text-zinc-400">
                    Ảnh gốc và bản xem nhanh vẫn được giữ nguyên trong lúc xử
                    lý.
                </p>
            ) : null}
            {flow.isError ? (
                <p className="mt-2 text-xs leading-4 text-zinc-600">
                    Bạn có thể đóng cửa sổ để giữ lại bản xem nhanh và thử lại
                    sau.
                </p>
            ) : null}
        </section>
    );
}
