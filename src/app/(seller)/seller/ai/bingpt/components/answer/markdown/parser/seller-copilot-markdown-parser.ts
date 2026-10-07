// Parser Markdown tối giản phục vụ nội dung Copilot.
// Parser chỉ tạo block dữ liệu, không render JSX và không hiểu domain shop.

import {
    isMarkdownTableSeparator,
    parseMarkdownTableCells,
} from './seller-copilot-markdown-inline';
import type { SellerCopilotMarkdownBlock } from '../../../../types/answer/markdown.types';

// Chuyển nội dung Markdown đã chuẩn hóa thành block có cấu trúc để component render dễ kiểm soát.
// Thứ tự nhận diện table/heading/list được giữ ổn định để không làm thay đổi format hiện tại.
export function parseSellerCopilotMarkdown(
    content: string,
): SellerCopilotMarkdownBlock[] {
    const lines = content.replace(/\r\n?/g, '\n').split('\n');
    const blocks: SellerCopilotMarkdownBlock[] = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index].trimEnd();
        if (!line.trim()) {
            index += 1;
            continue;
        }

        const codeFenceMatch = line.match(/^\s*(```+|~~~+)\s*([\w+-]*)\s*$/u);
        if (codeFenceMatch) {
            const fence = codeFenceMatch[1];
            const contentLines: string[] = [];
            index += 1;
            while (
                index < lines.length &&
                !lines[index].trim().startsWith(fence)
            ) {
                contentLines.push(lines[index].replace(/\s+$/u, ''));
                index += 1;
            }
            if (index < lines.length) index += 1;
            blocks.push({
                type: 'code',
                language: /^[\w+-]{1,20}$/u.test(codeFenceMatch[2])
                    ? codeFenceMatch[2].toLowerCase()
                    : 'text',
                content: contentLines.join('\n'),
            });
            continue;
        }

        const calloutMatch = line.match(
            /^>\s*\[!(SUMMARY|INFO|WARNING|TIP)\](?:\s+(.*))?$/iu,
        );
        if (calloutMatch) {
            const variant = calloutMatch[1].toLowerCase() as
                'summary' | 'info' | 'warning' | 'tip';
            const title =
                calloutMatch[2] ||
                {
                    summary: 'Kết luận',
                    info: 'Thông tin',
                    warning: 'Lưu ý',
                    tip: 'Gợi ý',
                }[variant];
            const calloutLines: string[] = [];
            index += 1;
            while (index < lines.length && /^\s*>\s?/u.test(lines[index])) {
                calloutLines.push(
                    lines[index].replace(/^\s*>\s?/u, '').trimEnd(),
                );
                index += 1;
            }
            blocks.push({
                type: 'callout',
                variant,
                title,
                lines: calloutLines,
            });
            continue;
        }

        if (
            line.includes('|') &&
            index + 1 < lines.length &&
            isMarkdownTableSeparator(lines[index + 1])
        ) {
            const headers = parseMarkdownTableCells(line);
            const rows: string[][] = [];
            index += 2;
            while (
                index < lines.length &&
                lines[index].includes('|') &&
                lines[index].trim()
            ) {
                const cells = parseMarkdownTableCells(lines[index]);
                rows.push(
                    headers.map((_, columnIndex) => cells[columnIndex] ?? ''),
                );
                index += 1;
            }
            blocks.push({ type: 'table', headers, rows });
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/u);
        if (headingMatch) {
            blocks.push({
                type: 'heading',
                level: headingMatch[1].length,
                content: headingMatch[2],
            });
            index += 1;
            continue;
        }

        if (/^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/u.test(line)) {
            blocks.push({ type: 'rule' });
            index += 1;
            continue;
        }

        if (/^\s*>\s?/u.test(line)) {
            const quoteLines: string[] = [];
            while (index < lines.length && /^\s*>\s?/u.test(lines[index])) {
                quoteLines.push(
                    lines[index].replace(/^\s*>\s?/u, '').trimEnd(),
                );
                index += 1;
            }
            blocks.push({ type: 'quote', lines: quoteLines });
            continue;
        }

        const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/u);
        if (unorderedMatch) {
            const items = [unorderedMatch[1]];
            index += 1;
            while (index < lines.length) {
                let nextIndex = index;
                while (nextIndex < lines.length && !lines[nextIndex].trim()) {
                    nextIndex += 1;
                }
                const nextMatch = lines[nextIndex]?.match(/^\s*[-*+]\s+(.+)$/u);
                if (!nextMatch) break;
                items.push(nextMatch[1]);
                index = nextIndex + 1;
            }
            blocks.push({ type: 'unordered-list', items });
            continue;
        }

        const orderedMatch = line.match(/^\s*\d+[.)]\s+(.+)$/u);
        if (orderedMatch) {
            const items = [orderedMatch[1]];
            index += 1;
            while (index < lines.length) {
                let nextIndex = index;
                while (nextIndex < lines.length && !lines[nextIndex].trim()) {
                    nextIndex += 1;
                }
                const nextMatch =
                    lines[nextIndex]?.match(/^\s*\d+[.)]\s+(.+)$/u);
                if (!nextMatch) break;
                items.push(nextMatch[1]);
                index = nextIndex + 1;
            }
            blocks.push({ type: 'ordered-list', items });
            continue;
        }

        const paragraphLines = [line.trim()];
        index += 1;
        while (index < lines.length) {
            const nextLine = lines[index].trimEnd();
            if (
                !nextLine.trim() ||
                /^(#{1,6})\s+/u.test(nextLine) ||
                /^\s*(```+|~~~+)/u.test(nextLine) ||
                /^>\s*\[!(SUMMARY|INFO|WARNING|TIP)\]/iu.test(nextLine) ||
                /^\s*>\s?/u.test(nextLine) ||
                /^\s*[-*+]\s+/u.test(nextLine) ||
                /^\s*\d+[.)]\s+/u.test(nextLine) ||
                /^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/u.test(nextLine)
            ) {
                break;
            }
            paragraphLines.push(nextLine.trim());
            index += 1;
        }
        blocks.push({ type: 'paragraph', lines: paragraphLines });
    }

    return normalizeBoldTitleLists(normalizeNumberedSections(blocks));
}

// Gom danh sách phẳng có tiêu đề in đậm thành từng nhóm để dấu bullet chỉ áp dụng cho thông tin mô tả.
// Chỉ đổi khi có ít nhất hai tiêu đề độc lập và mỗi tiêu đề có chi tiết đi kèm; danh sách thường vẫn giữ nguyên Markdown.
function normalizeBoldTitleLists(
    blocks: SellerCopilotMarkdownBlock[],
): SellerCopilotMarkdownBlock[] {
    return blocks.map((block) => {
        if (block.type !== 'unordered-list') return block;

        const sections: Array<{ title: string; details: string[] }> = [];
        for (const item of block.items) {
            const titleMatch = /^\*\*([^*\n]+)\*\*$/u.exec(item.trim());
            if (titleMatch) {
                sections.push({ title: titleMatch[1].trim(), details: [] });
                continue;
            }

            // Chi tiết chỉ được gắn vào tiêu đề gần nhất; dòng đứng trước tiêu đề hoặc danh sách không phân nhóm khiến giữ nguyên block gốc.
            const currentSection = sections.at(-1);
            if (!currentSection) return block;
            currentSection.details.push(item);
        }

        // Không tự diễn giải danh sách một nhóm hoặc tiêu đề không có mô tả thành cấu trúc sản phẩm.
        if (
            sections.length < 2 ||
            sections.some(({ details }) => !details.length)
        ) {
            return block;
        }

        return { type: 'grouped-list', items: sections };
    });
}

// Bỏ số khỏi tiêu đề mở đầu và gom các câu hỏi bị tách thành nhiều danh sách “1.”.
// Chỉ chuẩn hóa tiêu đề giới thiệu rõ ràng hoặc câu hỏi có bullet theo sau; quy trình khác được giữ nguyên.
function normalizeNumberedSections(
    blocks: SellerCopilotMarkdownBlock[],
): SellerCopilotMarkdownBlock[] {
    const grouped: SellerCopilotMarkdownBlock[] = [];
    let index = 0;

    while (index < blocks.length) {
        const first = blocks[index];
        if (isNumberedSectionIntro(first)) {
            grouped.push({
                type: 'heading',
                level: 3,
                content: first.items[0],
            });
            index += 1;
            continue;
        }

        if (!isNumberedQuestionSection(first)) {
            grouped.push(first);
            index += 1;
            continue;
        }

        const items: Array<{ title: string; details: string[] }> = [];
        let cursor = index;

        while (isNumberedQuestionSection(blocks[cursor])) {
            const titleBlock = blocks[cursor];
            if (titleBlock.type !== 'ordered-list') break;

            let next = cursor + 1;
            const details: string[] = [];
            while (blocks[next]?.type === 'unordered-list') {
                const detailBlock = blocks[next];
                if (detailBlock.type !== 'unordered-list') break;
                details.push(...detailBlock.items);
                next += 1;
            }

            if (!details.length) break;
            items.push({ title: titleBlock.items[0], details });
            cursor = next;
        }

        if (!items.length) {
            grouped.push(first);
            index += 1;
            continue;
        }

        grouped.push({ type: 'numbered-sections', items });
        index = cursor;
    }

    return grouped;
}

// Nhận diện dòng đánh số chỉ dùng để giới thiệu một nhóm thông tin, không phải một bước cần thực hiện.
function isNumberedSectionIntro(
    block: SellerCopilotMarkdownBlock | undefined,
): block is Extract<SellerCopilotMarkdownBlock, { type: 'ordered-list' }> {
    if (block?.type !== 'ordered-list' || block.items.length !== 1) {
        return false;
    }

    const title = block.items[0].replace(/\*\*/gu, '').trim();
    return (
        /^(?:các|những|một số|dưới đây là)\b/iu.test(title) &&
        /:\s*$/u.test(title)
    );
}

// Chỉ nhận diện mục đánh số có nội dung là một câu hỏi đơn lẻ để không đổi quy trình thông thường.
function isNumberedQuestionSection(
    block: SellerCopilotMarkdownBlock | undefined,
): block is Extract<SellerCopilotMarkdownBlock, { type: 'ordered-list' }> {
    if (block?.type !== 'ordered-list' || block.items.length !== 1) {
        return false;
    }

    return block.items[0].replace(/\*\*/gu, '').trim().endsWith('?');
}
