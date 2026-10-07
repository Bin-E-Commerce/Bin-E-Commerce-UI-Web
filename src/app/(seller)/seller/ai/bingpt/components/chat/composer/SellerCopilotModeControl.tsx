// Bộ chọn mode của BinGPT; icon và tooltip phản ánh mode hiện tại, menu dùng để đổi lựa chọn.
'use client';

import { BookOpen, Bot, MessageCircle, Store } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SellerCopilotModeControlProps } from '../../../types/composer/composer.types';

// Giữ nút mode hình tròn, căn icon giữa; hover chỉ hiện tooltip còn click mới mở menu chọn mode.
export function SellerCopilotModeControl({
    mode,
    disabled = false,
    onModeChange,
}: SellerCopilotModeControlProps) {
    return (
        <TooltipProvider delayDuration={220}>
            <Select
                disabled={disabled}
                value={mode}
                onValueChange={(value) => {
                    if (value) onModeChange(value as typeof mode);
                }}
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SelectTrigger
                            size="icon"
                            showChevron={false}
                            aria-label="Chuyển chế độ trả lời của BinGPT"
                            className="mb-1 cursor-pointer border-zinc-300 bg-zinc-50 text-zinc-700 shadow-sm hover:border-zinc-400 hover:bg-zinc-100"
                        >
                            <SelectValue className="min-w-0 flex-none items-center justify-center gap-0">
                                {mode === 'chat' ? (
                                    <MessageCircle className="size-4" />
                                ) : null}
                                {mode === 'shop_data' ? (
                                    <Store className="size-4" />
                                ) : null}
                                {mode === 'knowledge' ? (
                                    <BookOpen className="size-4" />
                                ) : null}
                                {mode === 'agent' ? (
                                    <Bot className="size-4 text-rose-600" />
                                ) : null}
                            </SelectValue>
                        </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        className="border border-zinc-200 bg-white text-zinc-950 shadow-xl"
                        arrowClassName="fill-white stroke-zinc-200 stroke-1"
                    >
                        {mode === 'chat'
                            ? 'Trò chuyện tự nhiên'
                            : mode === 'shop_data'
                              ? 'Hồ sơ và dữ liệu live của shop'
                              : mode === 'knowledge'
                                ? 'Tra cứu chính sách và hướng dẫn'
                                : 'AI Agent · Chỉnh tồn kho'}
                    </TooltipContent>
                </Tooltip>
                <SelectContent
                    side="top"
                    sideOffset={10}
                    align="start"
                    className="w-[160px] min-w-[160px] rounded-xl border border-zinc-200 p-1 shadow-xl shadow-zinc-900/10"
                >
                    <SelectItem
                        value="chat"
                        className="h-9 gap-2.5 rounded-lg px-2.5 pr-9 text-[13px]"
                    >
                        <MessageCircle />
                        <span>Trò chuyện</span>
                    </SelectItem>
                    <SelectItem
                        value="shop_data"
                        className="h-9 gap-2.5 rounded-lg px-2.5 pr-9 text-[13px]"
                    >
                        <Store />
                        <span>Dữ liệu shop</span>
                    </SelectItem>
                    <SelectItem
                        value="knowledge"
                        className="h-9 gap-2.5 rounded-lg px-2.5 pr-9 text-[13px]"
                    >
                        <BookOpen />
                        <span>Tài liệu</span>
                    </SelectItem>
                    <SelectItem
                        value="agent"
                        className="h-9 gap-2.5 rounded-lg px-2.5 pr-9 text-[13px]"
                    >
                        <Bot />
                        <span>AI Agent</span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </TooltipProvider>
    );
}
