// Sơ đồ kiến trúc tĩnh theo lưới responsive; mỗi node nêu trách nhiệm, không giả lập trạng thái runtime.
import type { ShowcaseArchitectureNode } from '../../types/showcase.types';

interface ShowcaseArchitectureLaneProps {
    label?: string;
    title: string;
    description: string;
    nodes: ShowcaseArchitectureNode[];
    className?: string;
}

// Xếp các bước theo thứ tự đọc và giữ badge Bước cùng title trên một hàng như pattern tài liệu showcase.
export function ShowcaseArchitectureLane({
    label,
    title,
    description,
    nodes,
    className,
}: ShowcaseArchitectureLaneProps) {
    return (
        <section
            className={`rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-[0_16px_48px_-40px_rgba(24,24,27,0.45)] sm:p-5 ${className ?? ''}`}
        >
            <header className="grid gap-3 border-b border-zinc-100 pb-4 sm:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] sm:items-start sm:gap-6">
                <div className="min-w-0">
                    {label ? (
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            {label}
                        </p>
                    ) : null}
                    <h3
                        className={`${label ? 'mt-2' : ''} text-xl font-semibold leading-tight tracking-tight text-zinc-950`}
                    >
                        {title}
                    </h3>
                </div>
                <p className="min-w-0 w-full break-words text-sm leading-6 text-zinc-600 sm:pt-0.5">
                    {description}
                </p>
            </header>

            <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {nodes.map((node, index) => (
                    <li key={`${node.name}-${index}`} className="min-w-0">
                        <div className="group h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors hover:border-zinc-400">
                            <header className="flex min-w-0 items-center gap-3 border-b border-zinc-200 pb-3">
                                <span className="inline-flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white font-mono leading-none text-zinc-500 shadow-[0_2px_5px_rgba(24,24,27,0.08)] transition-colors group-hover:border-zinc-300">
                                    <span className="text-[8px] uppercase tracking-[0.12em]">
                                        Bước
                                    </span>
                                    <span className="mt-1 text-xs font-semibold text-zinc-950">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </span>
                                <p className="min-w-0 break-words text-sm font-semibold text-zinc-950 [overflow-wrap:anywhere]">
                                    {node.name}
                                </p>
                            </header>
                            <p className="mt-3 break-words text-xs leading-5 text-zinc-600 [overflow-wrap:anywhere]">
                                {node.responsibility}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
