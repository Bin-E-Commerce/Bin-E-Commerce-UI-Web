// File này chứa các hàm trình bày thuần của history sidebar.
// Hàm ở đây không thay đổi state, không gọi API và có thể tái sử dụng cho panel lẫn popup search.
import type { ReactNode } from 'react';
import type { SellerCopilotConversation } from '@/services/seller/types/seller-copilot.types';
import type { ConversationGroup } from '../types/conversation-history.types';

// Chuẩn hóa khoảng trắng nhưng giữ nguyên độ dài để title không bị cắt khi row chưa hover.
export function formatConversationTitle(value: string): string {
    const normalized = value.trim().replace(/\s+/g, ' ');
    return normalized || 'Cuộc trò chuyện mới';
}

// Định dạng ngày ngắn trong kết quả search để người bán nhận biết phiên gần nhất.
export function formatSearchDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'numeric',
    }).format(new Date(value));
}

// Tô phần khớp query bằng node React, không đưa nội dung message vào HTML thô.
export function highlightSearchText(
    value: string,
    query: string,
    keyPrefix: string,
): ReactNode[] {
    const normalizedValue = value.toLocaleLowerCase('vi-VN');
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
    if (!normalizedQuery) return [value];

    const matchIndex = normalizedValue.indexOf(normalizedQuery);
    if (matchIndex < 0) return [value];

    return [
        value.slice(0, matchIndex),
        <mark
            key={`${keyPrefix}-match`}
            className="rounded bg-amber-100 px-0.5 text-zinc-950"
        >
            {value.slice(matchIndex, matchIndex + normalizedQuery.length)}
        </mark>,
        value.slice(matchIndex + normalizedQuery.length),
    ];
}

// Gom phiên theo ngày để danh sách dài vẫn có nhịp đọc giống sidebar ChatGPT.
export function groupConversations(
    conversations: SellerCopilotConversation[],
): ConversationGroup[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const groupedConversations = new Map<string, SellerCopilotConversation[]>();

    // Sắp xếp cùng quy tắc với backend để optimistic update không làm row nhảy vị trí trước khi request reload hoàn tất.
    const orderedConversations = [...conversations].sort((first, second) => {
        if (first.isPinned !== second.isPinned) {
            return first.isPinned ? -1 : 1;
        }

        const firstTimestamp = Date.parse(
            first.isPinned
                ? (first.pinnedAt ?? first.updatedAt)
                : first.updatedAt,
        );
        const secondTimestamp = Date.parse(
            second.isPinned
                ? (second.pinnedAt ?? second.updatedAt)
                : second.updatedAt,
        );
        if (firstTimestamp !== secondTimestamp) {
            return secondTimestamp - firstTimestamp;
        }
        return second.id.localeCompare(first.id);
    });

    const pinnedConversations = orderedConversations.filter(
        (conversation) => conversation.isPinned,
    );
    const unpinnedConversations = orderedConversations.filter(
        (conversation) => !conversation.isPinned,
    );

    for (const conversation of unpinnedConversations) {
        const updatedAt = new Date(conversation.updatedAt);
        const updatedDate = new Date(
            updatedAt.getFullYear(),
            updatedAt.getMonth(),
            updatedAt.getDate(),
        );
        const label =
            updatedDate.getTime() === today.getTime() ? 'Hôm nay' : 'Ngày khác';
        const currentGroup = groupedConversations.get(label) ?? [];
        currentGroup.push(conversation);
        groupedConversations.set(label, currentGroup);
    }

    const dateGroups = ['Hôm nay', 'Ngày khác']
        .filter((label) => groupedConversations.has(label))
        .map((label) => ({
            label,
            conversations: groupedConversations.get(label) ?? [],
        }));

    // Đưa pinned lên đúng khu vực đầu sidebar và loại khỏi nhóm ngày để một conversation chỉ xuất hiện một lần.
    return pinnedConversations.length > 0
        ? [
              { label: 'Đã ghim', conversations: pinnedConversations },
              ...dateGroups,
          ]
        : dateGroups;
}
