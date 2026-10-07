// Composer giữ nội dung nhập; mode chọn từ control cha để dùng nhất quán cho mọi lượt trong conversation.
'use client';

import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { SellerCopilotModeControl } from './SellerCopilotModeControl';
import { SellerCopilotSubmitControl } from './SellerCopilotSubmitControl';
import type {
    ComposerTooltip,
    SellerCopilotComposerProps,
} from '../../../types/composer/composer.types';

const MAX_COPILOT_INPUT_LENGTH = 2000;

// Giữ state nhập liệu tại một boundary và nhận mode có kiểm soát để việc chọn nguồn không bị reset sau submit.
export function SellerCopilotComposer({
    interactionMode,
    isStreaming,
    isModeChanging,
    showNotice,
    onInteractionModeChange,
    onSendMessage,
    onStop,
}: SellerCopilotComposerProps) {
    const [input, setInput] = useState('');
    const [activeTooltip, setActiveTooltip] = useState<ComposerTooltip>(null);
    const [showAgentSuggestions, setShowAgentSuggestions] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Chọn agent tách chế độ hành động khỏi nội dung tự nhiên, để model không tự suy diễn quyền thực thi.
    const selectAgent = () => {
        setInput((current) => current.replace(/@[^\s]*$/u, '').trimStart());
        void onInteractionModeChange('agent');
        setShowAgentSuggestions(false);
        requestAnimationFrame(() => textareaRef.current?.focus());
    };

    // Chỉ cho phép một tooltip hành động tồn tại tại một thời điểm để tránh tooltip chồng lấn.
    const handleTooltipOpenChange = (
        tooltip: Exclude<ComposerTooltip, null>,
        open: boolean,
    ) => {
        setActiveTooltip(open ? tooltip : null);
    };

    // Trim và chặn input không hợp lệ trước khi phát message lên hook stream.
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isModeChanging) return;
        const typedAgentMention = /^@bingpt\b\s*/iu.test(input.trim());
        const value = input.trim().replace(/^@bingpt\b\s*/iu, '');
        if (!value || value.length > MAX_COPILOT_INPUT_LENGTH) return;
        const selectedMode = typedAgentMention ? 'agent' : interactionMode;
        if (selectedMode !== interactionMode) {
            const modeChanged = await onInteractionModeChange(selectedMode);
            if (!modeChanged) return;
        }
        setInput('');
        onSendMessage(value, selectedMode);
        setShowAgentSuggestions(false);
    };

    // Mở gợi ý khi token cuối bắt đầu bằng @; token được thay bằng lựa chọn agent thay vì gửi nguyên cú pháp nội bộ.
    const handleInputChange = (value: string) => {
        setInput(value);
        setShowAgentSuggestions(/(?:^|\s)@[^\s]*$/u.test(value));
    };

    // Enter submit qua form; Shift+Enter và composition tiếng Việt vẫn giữ hành vi nhập nhiều dòng.
    const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (showAgentSuggestions && event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            selectAgent();
            return;
        }
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
                <form
                    onSubmit={submit}
                    className="relative flex items-end gap-2"
                >
                    {showAgentSuggestions ? (
                        <div className="absolute bottom-full left-2 z-30 mb-2 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
                            <Command>
                                <CommandList>
                                    <CommandEmpty>
                                        Không có tác nhân phù hợp
                                    </CommandEmpty>
                                    <CommandGroup heading="Tác nhân">
                                        <CommandItem
                                            value="bingpt agent"
                                            onSelect={selectAgent}
                                        >
                                            <Bot className="mr-2 size-4 text-zinc-600" />
                                            <span className="font-medium">
                                                BinGPT
                                            </span>
                                            <span className="ml-auto text-xs text-zinc-500">
                                                Chỉnh tồn kho
                                            </span>
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                    ) : null}
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(event) =>
                            handleInputChange(event.target.value)
                        }
                        onKeyDown={handleInputKeyDown}
                        spellCheck={false}
                        disabled={isStreaming}
                        placeholder="Hỏi BinGPT"
                        rows={1}
                        className="min-h-10 max-h-40 min-w-0 flex-1 resize-none overflow-y-auto overscroll-contain rounded-none border-0 px-2 py-2.5 text-sm leading-6 shadow-none disabled:cursor-default disabled:bg-white disabled:opacity-100 [scrollbar-color:#a1a1aa_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 focus-visible:border-0 focus-visible:ring-0"
                    />
                    {/* Đặt bộ chuyển mode cạnh nút gửi để mode đang dùng có thể đổi ngay tại vùng nhập. */}
                    <SellerCopilotModeControl
                        mode={interactionMode}
                        disabled={isStreaming || isModeChanging}
                        onModeChange={onInteractionModeChange}
                    />
                    <SellerCopilotSubmitControl
                        isStreaming={isStreaming}
                        input={input}
                        activeTooltip={activeTooltip}
                        onTooltipOpenChange={handleTooltipOpenChange}
                        onStop={onStop}
                    />
                </form>
                {/* Chỉ tạo hàng thông tin khi bật Agent; hàng rỗng bên dưới làm composer lệch tâm ở mode khác. */}
                {interactionMode === 'agent' ? (
                    <div className="mt-1 flex min-w-0 items-center gap-2 px-1 pb-0.5 text-xs text-zinc-600">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700">
                            <Bot className="size-3.5" />
                            Chế độ tác nhân · BinGPT
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Tắt chế độ tác nhân"
                                className="-mr-1 size-5 rounded-full text-rose-700 hover:bg-rose-100"
                                onClick={() => onInteractionModeChange('chat')}
                            >
                                <X className="size-3" />
                            </Button>
                        </span>
                        <span>
                            Mọi thao tác do BinGPT đề xuất đều cần bạn xác nhận
                            trước khi thực hiện.
                        </span>
                    </div>
                ) : null}
                {input.length > MAX_COPILOT_INPUT_LENGTH ? (
                    <p className="px-2 pb-0.5 text-[11px] text-red-600">
                        Nội dung quá dài
                    </p>
                ) : null}
            </div>
        </div>
    );
}
