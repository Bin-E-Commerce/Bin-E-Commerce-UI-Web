// Component render block Markdown đã parse của Seller Copilot.
// File chỉ chịu trách nhiệm typography/layout; normalize và parse nằm ở module markdown riêng.
'use client';

import {
    isMarkdownSectionLabel,
    normalizeSellerCopilotDisplayContent,
    renderInlineMarkdown,
} from './seller-copilot-markdown-inline';
import { parseSellerCopilotMarkdown } from './seller-copilot-markdown-parser';
import type { SellerCopilotMarkdownProps } from './seller-copilot-markdown.types';
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
                    const style = {
                        summary: {
                            classes:
                                'border-emerald-200 bg-emerald-50 text-emerald-950',
                        },
                        info: {
                            classes: 'border-sky-200 bg-sky-50 text-sky-950',
                        },
                        warning: {
                            classes:
                                'border-amber-200 bg-amber-50 text-amber-950',
                        },
                        tip: {
                            classes:
                                'border-violet-200 bg-violet-50 text-violet-950',
                        },
                    }[block.variant];
                    return (
                        <aside
                            key={key}
                            className={`my-5 rounded-xl border px-4 py-3 ${style.classes}`}
                            aria-label={block.title}
                        >
                            <p className="mb-1 font-semibold">
                                {renderInlineMarkdown(
                                    block.title,
                                    `${key}-title`,
                                )}
                            </p>
                            {block.lines.map((line, lineIndex) => (
                                <p key={`${key}-line-${lineIndex}`}>
                                    {renderInlineMarkdown(
                                        line,
                                        `${key}-line-${lineIndex}`,
                                    )}
                                </p>
                            ))}
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
