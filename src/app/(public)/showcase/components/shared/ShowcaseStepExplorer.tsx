// Bộ chọn bước phía client; nội dung và lớp code được truyền từ Server Component, còn JavaScript chỉ quản lý bước đang xem.
'use client';

import { useState } from 'react';
import { Check, Code2 } from 'lucide-react';
import type { ShowcaseFlowStep } from '../../types/showcase.types';

interface ShowcaseStepExplorerProps {
    steps: ShowcaseFlowStep[];
    label?: string;
    title: string;
    description: string;
    headingLevel?: 2 | 3;
    detailId?: string;
}

// Cho người đọc đổi bước mà không tải lại trang hay gọi API; activeStep chỉ điều khiển panel thông tin phía dưới.
// Mỗi bước vẫn giữ đủ summary, detail, output và implementation để tài liệu vừa dễ quét vừa có chiều sâu khi đọc kỹ.
export function ShowcaseStepExplorer({
    steps,
    label,
    title,
    description,
    headingLevel = 2,
    detailId = 'showcase-step-detail',
}: ShowcaseStepExplorerProps) {
    const [activeStepId, setActiveStepId] = useState(steps[0]?.id ?? '');
    const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
    const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStep?.id));
    const Heading = headingLevel === 3 ? 'h3' : 'h2';

    if (!activeStep) return null;

    return (
        <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-[0_16px_48px_-40px_rgba(24,24,27,0.45)] sm:p-5">
            <header className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 max-w-3xl">
                    {label ? <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</p> : null}
                    <Heading className={`${label ? 'mt-2' : ''} text-xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-2xl`}>{title}</Heading>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
                </div>
                <span className="shrink-0 self-start rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-500">{String(steps.length).padStart(2, '0')} bước</span>
            </header>

            <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {steps.map((step, index) => {
                    const isActive = step.id === activeStep.id;

                    return (
                        <li key={step.id}>
                            <button
                                type="button"
                                aria-pressed={isActive}
                                aria-controls={detailId}
                                onClick={() => setActiveStepId(step.id)}
                                className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 ${isActive ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950'}`}
                            >
                                <span className="font-mono text-[10px] opacity-60">{String(index + 1).padStart(2, '0')}</span>
                                <span className="min-w-0 truncate text-xs font-medium">{step.title}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            <div id={detailId} aria-live="polite" className="mt-3 grid gap-3 rounded-2xl bg-zinc-50 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(230px,0.34fr)]">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"><Check aria-hidden="true" className="size-3.5 text-zinc-900" />Bước {String(activeIndex + 1).padStart(2, '0')} · {activeStep.title}</p>
                    <p className="mt-2 text-base font-semibold leading-6 text-zinc-950">{activeStep.summary}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{activeStep.detail}</p>
                </div>
                <aside className="min-w-0 rounded-xl border border-zinc-200 bg-white p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Kết quả</p>
                    <p className="mt-1.5 text-sm leading-5 text-zinc-800">{activeStep.output}</p>
                    {activeStep.implementation ? (
                        <div className="mt-3 border-t border-zinc-100 pt-3">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"><Code2 aria-hidden="true" className="size-3.5" />Trong code</p>
                            <code className="mt-1.5 block break-words font-mono text-[11px] leading-5 text-zinc-800">{activeStep.implementation}</code>
                        </div>
                    ) : null}
                </aside>
            </div>
        </section>
    );
}
