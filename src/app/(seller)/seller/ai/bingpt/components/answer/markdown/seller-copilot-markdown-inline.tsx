// Nhóm helper xử lý inline Markdown và chuẩn hóa nội dung an toàn trước khi render.
// Không dùng dangerouslySetInnerHTML; mọi giá trị từ model đều trở thành React node hoặc text.
'use client';

import type { ReactNode } from 'react';

const SELLER_READINESS_LABELS: Readonly<Record<string, string>> = {
    READY: 'Đủ điều kiện giao nhận',
    NO_PICKUP_ADDRESS: 'Chưa có địa chỉ lấy hàng',
    NO_DEFAULT_PICKUP_ADDRESS: 'Chưa có địa chỉ lấy hàng mặc định',
    INCOMPLETE_PICKUP_ADDRESS: 'Địa chỉ lấy hàng mặc định chưa đủ thông tin',
    SHIPPING_DISABLED: 'Thiết lập giao hàng đang tắt',
};

// Đổi mã trạng thái nội bộ, URL ảnh và URL sản phẩm thành nội dung seller có thể đọc.
// Helper chỉ thay đổi presentation, không thay đổi claim hoặc dữ liệu đã lưu trong message.
export function normalizeSellerCopilotDisplayContent(content: string): string {
    return content
        .split(/(`{3,}[\s\S]*?`{3,}|~{3,}[\s\S]*?~{3,})/gu)
        .map((part, index) => {
            if (index % 2 === 1) return part;
            return part
                .replace(
                    /`?(READY|NO_PICKUP_ADDRESS|NO_DEFAULT_PICKUP_ADDRESS|INCOMPLETE_PICKUP_ADDRESS|SHIPPING_DISABLED)`?/gu,
                    (token) => {
                        const code = token.replace(/`/gu, '');
                        return SELLER_READINESS_LABELS[code] ?? token;
                    },
                )
                .replace(/!\[([^\]]*)\]\(https?:\/\/[^)]+\)/gu, '$1')
                .replace(/\(https?:\/\/[^\s)]+\)/gu, '');
        })
        .join('');
}

// Nhận diện bullet đang đóng vai trò nhãn section để renderer không đánh số/hiển thị dấu bullet sai.
export function isMarkdownSectionLabel(item: string): boolean {
    const value = item.trim();
    const boldLeadMatch = value.match(/^\*\*([^*\n]+)\*\*(.*)$/u);
    if (!boldLeadMatch) return false;

    const lead = boldLeadMatch[1].trim();
    const tail = boldLeadMatch[2].trim();
    return (
        lead.endsWith(':') ||
        tail.endsWith(':') ||
        (tail.length > 0 && lead.split(/\s+/u).length >= 4)
    );
}

// Render token inline thành React node; không cho nội dung backend đi qua HTML thô để giữ an toàn XSS.
export function renderInlineMarkdownLine(
    value: string,
    keyPrefix: string,
): ReactNode[] {
    const tokenPattern =
        /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let tokenIndex = 0;

    for (const match of value.matchAll(tokenPattern)) {
        const token = match[0];
        const startIndex = match.index ?? 0;
        if (startIndex > lastIndex)
            nodes.push(value.slice(lastIndex, startIndex));

        const key = `${keyPrefix}-${tokenIndex}`;
        if (token.startsWith('**') || token.startsWith('__')) {
            nodes.push(
                <strong key={key} className="font-semibold text-zinc-950">
                    {token.slice(2, -2)}
                </strong>,
            );
        } else if (token.startsWith('`')) {
            nodes.push(
                <code
                    key={key}
                    className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800"
                >
                    {token.slice(1, -1)}
                </code>,
            );
        } else {
            nodes.push(
                <em key={key} className="italic">
                    {token.slice(1, -1)}
                </em>,
            );
        }

        lastIndex = startIndex + token.length;
        tokenIndex += 1;
    }

    if (lastIndex < value.length) nodes.push(value.slice(lastIndex));
    return nodes;
}

// Tách line break do model sinh ra thành node <br> thật nhưng vẫn giữ toàn bộ nội dung dạng text/React.
export function renderInlineMarkdown(
    value: string,
    keyPrefix: string,
): ReactNode[] {
    const lines = value.replace(/<br\s*\/?>/giu, '\n').split('\n');
    return lines.flatMap((line, lineIndex) => [
        ...(lineIndex > 0
            ? [<br key={`${keyPrefix}-line-break-${lineIndex}`} />]
            : []),
        ...renderInlineMarkdownLine(line, `${keyPrefix}-line-${lineIndex}`),
    ]);
}

// Tách ô bảng Markdown và khôi phục pipe đã escape để block renderer chỉ cần lo layout.
export function parseMarkdownTableCells(line: string): string[] {
    const value = line.trim().replace(/^\|/u, '').replace(/\|$/u, '');
    return value.split('|').map((cell) => cell.trim().replace(/\\\|/gu, '|'));
}

// Xác định dòng separator của table để không nhận nhầm đoạn văn có ký tự pipe.
export function isMarkdownTableSeparator(line: string): boolean {
    const cells = parseMarkdownTableCells(line);
    return (
        cells.length >= 2 &&
        cells.every((cell) => /^:?-{3,}:?$/u.test(cell.trim()))
    );
}
