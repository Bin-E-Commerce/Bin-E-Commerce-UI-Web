// Component render block Markdown đã parse của Seller Copilot.
// File chỉ chịu trách nhiệm typography/layout; normalize và parse nằm ở module markdown riêng.
'use client';

import {
    isMarkdownSectionLabel,
    normalizeSellerCopilotDisplayContent,
    renderInlineMarkdown,
} from '../parser/seller-copilot-markdown-inline';
import { parseSellerCopilotMarkdown } from '../parser/seller-copilot-markdown-parser';
import type { SellerCopilotMarkdownProps } from '../../../../types/answer/markdown.types';
import { SellerCopilotCodeBlock } from './SellerCopilotCodeBlock';

// Render các block đã được whitelist với spacing nhất quán, không để model quyết định class hoặc HTML.
export function SellerCopilotMarkdown({ content }: SellerCopilotMarkdownProps) {
    const blocks = parseSellerCopilotMarkdown(
        normalizeSellerCopilotDisplayContent(content),
    );

    return (
        <div className="max-w-none text-[15px] leading-7 text-zinc-800">
            {blocks.map((block, index) => {
                const key = `markdown-block-${index}`;

                if (block.type === 'rule') {
                    return <hr key={key} className="my-7 border-zinc-200" />;
                }

                if (block.type === 'heading') {
                    const className =
                        block.level <= 2
                            ? 'mt-8 border-b border-zinc-100 pb-2 text-lg font-semibold tracking-tight text-zinc-950 first:mt-0'
                            : 'mt-6 text-base font-semibold tracking-tight text-zinc-900 first:mt-0';
                    const Heading = block.level <= 2 ? 'h2' : 'h3';
                    return (
                        <Heading key={key} className={className}>
                            {renderInlineMarkdown(block.content, key)}
                        </Heading>
                    );
                }

                if (block.type === 'quote') {
                    return (
                        <blockquote
                            key={key}
                            className="my-4 border-l-4 border-zinc-200 pl-4 text-zinc-700"
                        >
                            {block.lines.map((line, lineIndex) => (
                                <p key={`${key}-line-${lineIndex}`}>
                                    {renderInlineMarkdown(
                                        line,
                                        `${key}-line-${lineIndex}`,
                                    )}
                                </p>
                            ))}
                        </blockquote>
                    );
                }

                if (block.type === 'callout') {
                    // Phân biệt sắc thái bằng màu chữ của nhãn, không tạo nền/viền khiến ghi chú trông như một card.
                    const style = {
                        summary: {
                            title: 'text-zinc-900 dark:text-zinc-100',
                        },
                        info: {
                            title: 'text-zinc-900 dark:text-zinc-100',
                        },
                        warning: {
                            title: 'text-amber-800 dark:text-amber-300',
                        },
                        tip: {
                            title: 'text-rose-700 dark:text-rose-300',
                        },
                    }[block.variant];
                    return (
                        <aside
                            key={key}
                            className="my-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
                            aria-label={block.title}
                        >
                            <p>
                                <span
                                    className={`font-semibold ${style.title}`}
                                >
                                    {renderInlineMarkdown(
                                        block.title,
                                        `${key}-title`,
                                    )}
                                    :{' '}
                                </span>
                                {block.lines.map((line, lineIndex) => (
                                    <span key={`${key}-line-${lineIndex}`}>
                                        {lineIndex > 0 && <br />}
                                        {renderInlineMarkdown(
                                            line,
                                            `${key}-line-${lineIndex}`,
                                        )}
                                    </span>
                                ))}
                            </p>
                        </aside>
                    );
                }

                if (block.type === 'code') {
                    return (
                        <SellerCopilotCodeBlock
                            key={key}
                            content={block.content}
                            language={block.language}
                        />
                    );
                }

                if (block.type === 'table') {
                    return (
                        <div
                            key={key}
                            className="my-5 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm"
                        >
                            <table className="min-w-full border-collapse text-left text-sm leading-6">
                                <thead className="bg-zinc-50 text-zinc-900">
                                    <tr>
                                        {block.headers.map(
                                            (header, headerIndex) => (
                                                <th
                                                    key={`${key}-header-${headerIndex}`}
                                                    className="border-b border-zinc-200 px-3 py-2.5 font-semibold"
                                                >
                                                    {renderInlineMarkdown(
                                                        header,
                                                        `${key}-header-${headerIndex}`,
                                                    )}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {block.rows.map((row, rowIndex) => (
                                        <tr
                                            key={`${key}-row-${rowIndex}`}
                                            className="border-b border-zinc-100 even:bg-zinc-50/60 last:border-b-0"
                                        >
                                            {row.map((cell, cellIndex) => (
                                                <td
                                                    key={`${key}-cell-${rowIndex}-${cellIndex}`}
                                                    className={`px-3 py-2.5 align-top text-zinc-700 ${cellIndex === 0 ? 'font-medium text-zinc-900' : ''}`}
                                                >
                                                    {renderInlineMarkdown(
                                                        cell,
                                                        `${key}-cell-${rowIndex}-${cellIndex}`,
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }

                if (block.type === 'numbered-sections') {
                    return (
                        <ol
                            key={key}
                            className="my-5 list-decimal space-y-5 pl-8 marker:text-zinc-700"
                        >
                            {block.items.map((item, itemIndex) => (
                                <li
                                    key={`${key}-section-${itemIndex}`}
                                    className="pl-1 text-zinc-800"
                                >
                                    <strong className="font-semibold text-zinc-950">
                                        {renderInlineMarkdown(
                                            item.title,
                                            `${key}-section-title-${itemIndex}`,
                                        )}
                                    </strong>
                                    <ul className="mt-2 list-disc space-y-2 pl-6 marker:text-zinc-500">
                                        {item.details.map(
                                            (detail, detailIndex) => (
                                                <li
                                                    key={`${key}-section-${itemIndex}-detail-${detailIndex}`}
                                                >
                                                    {renderInlineMarkdown(
                                                        detail,
                                                        `${key}-section-${itemIndex}-detail-${detailIndex}`,
                                                    )}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </li>
                            ))}
                        </ol>
                    );
                }

                if (block.type === 'grouped-list') {
                    return (
                        <div key={key} className="my-5 space-y-4">
                            {block.items.map((item, itemIndex) => (
                                <section
                                    key={`${key}-group-${itemIndex}`}
                                    className="space-y-1.5"
                                >
                                    <p className="font-semibold text-zinc-950">
                                        {renderInlineMarkdown(
                                            item.title,
                                            `${key}-group-title-${itemIndex}`,
                                        )}
                                    </p>
                                    <ul className="list-disc space-y-1 pl-6 text-zinc-700 marker:text-zinc-400">
                                        {item.details.map(
                                            (detail, detailIndex) => (
                                                <li
                                                    key={`${key}-group-${itemIndex}-detail-${detailIndex}`}
                                                >
                                                    {renderInlineMarkdown(
                                                        detail,
                                                        `${key}-group-${itemIndex}-detail-${detailIndex}`,
                                                    )}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    );
                }

                if (
                    block.type === 'unordered-list' ||
                    block.type === 'ordered-list'
                ) {
                    const List = block.type === 'unordered-list' ? 'ul' : 'ol';
                    return (
                        <List
                            key={key}
                            className={`my-4 space-y-2 pl-8 marker:text-zinc-600 ${
                                block.type === 'unordered-list'
                                    ? 'list-disc'
                                    : 'list-decimal'
                            }`}
                        >
                            {block.items.map((item, itemIndex) => (
                                <li
                                    key={`${key}-item-${itemIndex}`}
                                    className={
                                        block.type === 'unordered-list' &&
                                        isMarkdownSectionLabel(item)
                                            ? 'list-none -ml-6 pt-3 first:pt-0'
                                            : undefined
                                    }
                                >
                                    {renderInlineMarkdown(
                                        item,
                                        `${key}-item-${itemIndex}`,
                                    )}
                                </li>
                            ))}
                        </List>
                    );
                }

                return (
                    <p key={key} className="my-4 first:mt-0 last:mb-0">
                        {block.lines.map((line, lineIndex) => (
                            <span key={`${key}-line-${lineIndex}`}>
                                {lineIndex > 0 ? <br /> : null}
                                {renderInlineMarkdown(
                                    line,
                                    `${key}-line-${lineIndex}`,
                                )}
                            </span>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}
