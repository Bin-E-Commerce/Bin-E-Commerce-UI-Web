// Composer chỉ điều phối input và submit; range/action button nằm trong các control con theo domain UI.
'use client';

import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { SellerCopilotRange } from '@/services/seller/types/seller-copilot.types';
import { SellerCopilotRangeControl } from './SellerCopilotRangeControl';
import { SellerCopilotSubmitControl } from './SellerCopilotSubmitControl';
import type { ComposerTooltip } from '../../../types/composer.types';

const MAX_COPILOT_INPUT_LENGTH = 2000;

interface SellerCopilotComposerProps {
    range: SellerCopilotRange;
    isStreaming: boolean;
    showNotice: boolean;
    onRangeChange: (range: SellerCopilotRange) => void;
    onSendMessage: (message: string) => void;
    onStop: () => void;
}

// Giữ state nhập liệu tại một boundary duy nhất và truyền các thao tác đã kiểm tra xuống control chuyên biệt.
export function SellerCopilotComposer({
    range,
    isStreaming,
    showNotice,
    onRangeChange,
    onSendMessage,
    onStop,
}: SellerCopilotComposerProps) {
    const [input, setInput] = useState('');
    const [activeTooltip, setActiveTooltip] = useState<ComposerTooltip>(null);
    const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);

    // Chỉ cho phép một tooltip tồn tại tại một thời điểm để menu range không làm tooltip action bị treo.
    const handleTooltipOpenChange = (
        tooltip: Exclude<ComposerTooltip, null>,
        open: boolean,
    ) => {
        setActiveTooltip(open ? tooltip : null);
    };

    // Khi Select mở/đóng, reset tooltip liên quan để trạng thái overlay luôn nhất quán.
    const handleRangeMenuOpenChange = (open: boolean) => {
        setIsRangeMenuOpen(open);
        if (open) setActiveTooltip(null);
    };

    // Trim và chặn input không hợp lệ trước khi phát message lên hook stream.
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = input.trim();
        if (!value || value.length > MAX_COPILOT_INPUT_LENGTH) return;
        setInput('');
        onSendMessage(value);
    };

    // Enter submit qua form; Shift+Enter và composition tiếng Việt vẫn giữ hành vi nhập nhiều dòng.
    const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (
            event.key !== 'Enter' ||
            event.shiftKey ||
            event.nativeEvent.isComposing
        ) {
            return;
        }
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
    };

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white/90 via-white/55 to-transparent px-4 pb-6 pt-12 sm:px-5">
            {showNotice ? (
                <p className="mx-auto mb-2 max-w-3xl text-center text-[11px] leading-4 text-zinc-500">
                    BinGPT có thể mắc lỗi. Hãy kiểm tra các thông tin quan
                    trọng.
                </p>
            ) : null}
            <div className="pointer-events-auto mx-auto max-w-3xl rounded-[30px] border border-zinc-200 bg-white/95 p-2 shadow-[0_4px_24px_rgba(24,24,27,0.08)] ring-1 ring-zinc-100 backdrop-blur-md">
                <form onSubmit={submit} className="flex items-end gap-2">
                    <Textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleInputKeyDown}
                        spellCheck={false}
                        disabled={isStreaming}
                        placeholder="Hỏi BinGPT"
                        rows={1}
                        className="min-h-10 max-h-40 min-w-0 flex-1 resize-none overflow-y-auto overscroll-contain rounded-none border-0 px-2 py-2.5 text-sm leading-6 shadow-none disabled:cursor-default disabled:bg-white disabled:opacity-100 [scrollbar-color:#a1a1aa_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 focus-visible:border-0 focus-visible:ring-0"
                    />
                    <SellerCopilotRangeControl
                        range={range}
                        isOpen={isRangeMenuOpen}
                        activeTooltip={activeTooltip}
                        onOpenChange={handleRangeMenuOpenChange}
                        onTooltipOpenChange={(open) =>
                            handleTooltipOpenChange('range', open)
                        }
                        onRangeChange={onRangeChange}
                    />
                    <SellerCopilotSubmitControl
                        isStreaming={isStreaming}
                        input={input}
                        activeTooltip={activeTooltip}
                        onTooltipOpenChange={handleTooltipOpenChange}
                        onStop={onStop}
                    />
                </form>
                {input.length > MAX_COPILOT_INPUT_LENGTH ? (
                    <p className="px-2 pb-0.5 text-[11px] text-red-600">
                        Nội dung quá dài
                    </p>
                ) : null}
            </div>
        </div>
    );
}
