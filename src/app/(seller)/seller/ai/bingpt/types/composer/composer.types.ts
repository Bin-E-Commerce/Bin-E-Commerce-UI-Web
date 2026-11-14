// Contract nội bộ của composer; các control con chỉ nhận state và callback, không biết stream/API.
import type { SellerCopilotInteractionMode } from '@/services/seller/types/seller-copilot.types';
import type { RefObject } from 'react';

export type ComposerTooltip = 'send' | 'stop' | null;

export interface SellerCopilotModeControlProps {
    mode: SellerCopilotInteractionMode;
    disabled?: boolean;
    isChanging?: boolean;
    onModeChange: (
        mode: SellerCopilotInteractionMode,
    ) => Promise<boolean> | boolean;
}

export interface SellerCopilotComposerProps {
    rootRef?: RefObject<HTMLDivElement | null>;
    interactionMode: SellerCopilotInteractionMode;
    isStreaming: boolean;
    isModeChanging: boolean;
    isConversationLoading: boolean;
    showNotice: boolean;
    onInteractionModeChange: (
        mode: SellerCopilotInteractionMode,
    ) => Promise<boolean> | boolean;
    onSendMessage: (
        message: string,
        interactionMode?: SellerCopilotInteractionMode,
    ) => void;
    onStop: () => void;
}

export interface SellerCopilotSubmitControlProps {
    isStreaming: boolean;
    isModeChanging: boolean;
    isConversationLoading: boolean;
    input: string;
    activeTooltip: ComposerTooltip;
    onTooltipOpenChange: (
        tooltip: Exclude<ComposerTooltip, null>,
        open: boolean,
    ) => void;
    onStop: () => void;
}
