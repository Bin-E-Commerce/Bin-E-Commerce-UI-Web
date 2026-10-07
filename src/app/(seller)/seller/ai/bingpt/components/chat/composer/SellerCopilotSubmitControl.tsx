// Control gửi/dừng câu trả lời; không tự submit hay gọi stream, chỉ phát callback thao tác.
'use client';

import { LoaderCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SellerCopilotSubmitControlProps } from '../../../types/composer/composer.types';

const MAX_COPILOT_INPUT_LENGTH = 2000;

// Render action cuối form và khoá gửi khi input rỗng/quá dài để validation vẫn nằm sát control.
export function SellerCopilotSubmitControl({
    isStreaming,
    input,
    activeTooltip,
    onTooltipOpenChange,
    onStop,
}: SellerCopilotSubmitControlProps) {
    const isInputInvalid =
        !input.trim() || input.length > MAX_COPILOT_INPUT_LENGTH;
    const tooltip = isStreaming ? 'stop' : 'send';

    return (
        <TooltipProvider delayDuration={180}>
            <Tooltip
                open={activeTooltip === tooltip}
                onOpenChange={(open) => onTooltipOpenChange(tooltip, open)}
            >
                <TooltipTrigger asChild>
                    <span className="inline-flex shrink-0 cursor-pointer">
                        {isStreaming ? (
                            <Button
                                type="button"
                                size="icon"
                                className="mb-1 size-9 shrink-0 rounded-full border border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100"
                                aria-label="Dừng câu trả lời"
                                onClick={onStop}
                            >
                                <LoaderCircle className="size-4 animate-spin" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                size="icon"
                                className="mb-1 size-9 shrink-0 rounded-full border border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
                                aria-label="Gửi câu hỏi"
                                disabled={isInputInvalid}
                            >
                                <Send className="size-4" />
                            </Button>
                        )}
                    </span>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="border border-zinc-200 bg-white text-zinc-950 shadow-xl"
                    arrowClassName="fill-white stroke-zinc-200 stroke-1"
                >
                    {isStreaming ? 'Dừng câu trả lời' : 'Gửi câu hỏi'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
