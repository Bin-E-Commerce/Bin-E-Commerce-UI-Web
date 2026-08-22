'use client';

import { Check, Loader2 } from 'lucide-react';

import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import type { AvatarUploadPhase } from '../types/avatar-upload.type';

interface AvatarUploadStatusProps {
    phase: AvatarUploadPhase;
    uploadProgress: number;
}

// Quy đổi phase kỹ thuật thành phần trăm tổng thể để progress không đứng yên sau khi file đã upload xong.
function getOverallProgress(
    phase: AvatarUploadPhase,
    uploadProgress: number,
): number {
    switch (phase) {
        case 'presigning':
            return 8;
        case 'uploading':
            return 12 + Math.round(uploadProgress * 0.48);
        case 'processing':
            return 72;
        case 'saving':
            return 88;
        case 'cleaning':
            return 96;
        default:
            return 0;
    }
}

// Xác định bước hiện tại để người dùng hiểu tiến trình mà không cần biết chi tiết S3, Lambda hay CloudFront.
function getCurrentStep(phase: AvatarUploadPhase): number {
    if (phase === 'presigning' || phase === 'uploading') return 1;
    if (phase === 'processing') return 2;
    if (phase === 'saving' || phase === 'cleaning') return 3;
    return 0;
}

// Hiển thị tiến trình ba bước bằng component Progress của shadcn và thông báo thân thiện với người dùng.
export function AvatarUploadStatus({
    phase,
    uploadProgress,
}: AvatarUploadStatusProps) {
    const overallProgress = getOverallProgress(phase, uploadProgress);
    const currentStep = getCurrentStep(phase);

    return (
        <div
            className="mt-4 space-y-4 border-t border-zinc-200 pt-4"
            aria-live="polite"
        >
            <Progress value={overallProgress} className="gap-2">
                <ProgressLabel>
                    {phase === 'presigning' && 'Đang chuẩn bị tải ảnh...'}
                    {phase === 'uploading' &&
                        `Đang tải ảnh lên... ${uploadProgress}%`}
                    {phase === 'processing' &&
                        'Đang tối ưu ảnh để hiển thị nhanh hơn...'}
                    {phase === 'saving' &&
                        'Đang cập nhật ảnh đại diện...'}
                    {phase === 'cleaning' && 'Đang hoàn tất...'}
                </ProgressLabel>
                <ProgressValue>
                    {() => `${overallProgress}%`}
                </ProgressValue>
            </Progress>

            <ol className="grid grid-cols-3 gap-2">
                {['Tải ảnh', 'Xử lý ảnh', 'Hoàn tất'].map(
                    (label, index) => {
                        const step = index + 1;
                        const isComplete = currentStep > step;
                        const isCurrent = currentStep === step;

                        return (
                            <li
                                key={label}
                                className={cn(
                                    'flex min-w-0 items-center gap-2 text-xs text-zinc-400',
                                    (isComplete || isCurrent) &&
                                        'text-zinc-900',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white',
                                        isComplete &&
                                            'border-zinc-950 bg-zinc-950 text-white',
                                        isCurrent &&
                                            'border-zinc-950 text-zinc-950',
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : isCurrent ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        step
                                    )}
                                </span>
                                <span className="truncate">{label}</span>
                            </li>
                        );
                    },
                )}
            </ol>
        </div>
    );
}
