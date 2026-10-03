// Contract nội bộ của composer; các control con chỉ nhận state và callback, không biết stream/API.
import type { SellerCopilotRange } from '@/services/seller/types/seller-copilot.types';

export type ComposerTooltip = 'range' | 'send' | 'stop' | null;

export interface SellerCopilotRangeControlProps {
    range: SellerCopilotRange;
    isOpen: boolean;
    activeTooltip: ComposerTooltip;
    onOpenChange: (open: boolean) => void;
    onTooltipOpenChange: (open: boolean) => void;
    onRangeChange: (range: SellerCopilotRange) => void;
}

export interface SellerCopilotSubmitControlProps {
    isStreaming: boolean;
    input: string;
    activeTooltip: ComposerTooltip;
    onTooltipOpenChange: (
        tooltip: Exclude<ComposerTooltip, null>,
        open: boolean,
    ) => void;
    onStop: () => void;
}
