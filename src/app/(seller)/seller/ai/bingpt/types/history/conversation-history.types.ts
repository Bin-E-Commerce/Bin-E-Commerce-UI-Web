// File này chứa các contract nội bộ của khu vực lịch sử hội thoại.
// Các type chỉ mô tả dữ liệu và callback giữa component, không sở hữu state hay gọi API.
import type { ReactNode, RefObject, UIEvent } from 'react';
import type {
    SellerCopilotConversation,
    SellerCopilotSearchResult,
} from '@/services/seller/types/seller-copilot.types';

export interface ConversationHistoryPanelProps {
    conversations: SellerCopilotConversation[];
    activeConversationId?: string;
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    disabled: boolean;
    onNewConversation: () => void;
    onSelectConversation: (conversationId: string) => void;
    onLoadMore: () => void;
    onSetConversationPinned: (
        conversationId: string,
        isPinned: boolean,
    ) => void;
    onRenameConversation: (
        conversationId: string,
        title: string,
    ) => Promise<void>;
    onDeleteConversation: (conversationId: string) => Promise<void>;
    onSearch: (
        query: string,
        signal?: AbortSignal,
    ) => Promise<SellerCopilotSearchResult[]>;
    onClose: () => void;
}

export interface ConversationGroup {
    label: string;
    conversations: SellerCopilotConversation[];
}

export interface ConversationHistoryRailProps {
    onOpen: () => void;
    onNewConversation: () => void;
}

export interface ConversationHistoryRailActionProps {
    label: string;
    onClick: () => void;
    children: ReactNode;
    className?: string;
}

export interface ConversationSearchDialogProps {
    open: boolean;
    query: string;
    isLoading: boolean;
    results: SellerCopilotSearchResult[];
    onQueryChange: (value: string) => void;
    onClose: () => void;
    onSelect: (conversationId: string) => void;
}

export interface ConversationHistoryHeaderProps {
    isSearchOpen: boolean;
    searchLabel: string;
    disabled: boolean;
    onToggleSearch: () => void;
    onNewConversation: () => void;
    onClose: () => void;
}

export interface ConversationHistoryItemProps {
    conversation: SellerCopilotConversation;
    active: boolean;
    menuOpen: boolean;
    editing: boolean;
    editingTitle: string;
    disabled: boolean;
    renameInputRef: RefObject<HTMLInputElement | null>;
    onSelect: (conversationId: string) => void;
    onEditingTitleChange: (value: string) => void;
    onSubmitRename: () => void;
    onCancelRename: () => void;
    onToggleMenu: (open: boolean) => void;
    onStartRename: (conversation: SellerCopilotConversation) => void;
    onTogglePinned: (conversation: SellerCopilotConversation) => void;
    onRequestDelete: (conversation: SellerCopilotConversation) => void;
}

export interface ConversationHistoryListProps {
    listRef: RefObject<HTMLDivElement | null>;
    groups: ConversationGroup[];
    hasConversations: boolean;
    activeConversationId?: string;
    isLoading: boolean;
    isLoadingMore: boolean;
    disabled: boolean;
    fade: { top: boolean; bottom: boolean };
    openMenuConversationId: string | null;
    editingConversationId: string | null;
    editingTitle: string;
    renameInputRef: RefObject<HTMLInputElement | null>;
    onScroll: (event: UIEvent<HTMLDivElement>) => void;
    onSelect: (conversationId: string) => void;
    onEditingTitleChange: (value: string) => void;
    onSubmitRename: () => void;
    onCancelRename: () => void;
    onToggleMenu: (conversationId: string, open: boolean) => void;
    onStartRename: (conversation: SellerCopilotConversation) => void;
    onTogglePinned: (conversation: SellerCopilotConversation) => void;
    onRequestDelete: (conversation: SellerCopilotConversation) => void;
}
