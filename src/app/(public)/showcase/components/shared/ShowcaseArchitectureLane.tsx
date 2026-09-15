// Sơ đồ kiến trúc tĩnh theo lưới responsive; mỗi node nêu trách nhiệm service, không giả lập trạng thái runtime.
import type { ShowcaseArchitectureNode } from '../../types/showcase.types';

interface ShowcaseArchitectureLaneProps {
    label?: string;
    title: string;
    description: string;
    nodes: ShowcaseArchitectureNode[];
}

// Xếp các bước theo thứ tự đọc trên lưới một, hai hoặc ba cột để thẻ không bị ép hẹp trên desktop.
// Header giữ cùng nhịp với hero showcase: nhãn và tiêu đề nằm bên trái, lý do/ý nghĩa nằm bên phải.
// Tên service dài được phép ngắt giữa chuỗi kỹ thuật thay vì tràn khỏi khung.
export function ShowcaseArchitectureLane({
    label,
    title,
    description,
    nodes,
}: ShowcaseArchitectureLaneProps) {
    return (
        <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-[0_16px_48px_-40px_rgba(24,24,27,0.45)] sm:p-5">
            <header className="grid gap-3 border-b border-zinc-100 pb-4 sm:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] sm:items-start sm:gap-6">
                <div className="min-w-0">
                    {label ? (
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            {label}
                        </p>
                    ) : null}
                    <h3 className={`${label ? 'mt-2' : ''} text-xl font-semibold leading-tight tracking-tight text-zinc-950`}>
                        {title}
                    </h3>
                </div>
                <p className="min-w-0 max-w-xl break-words text-sm leading-6 text-zinc-600 sm:pt-0.5">
                    {description}
                </p>
            </header>

            <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {nodes.map((node, index) => (
                    <li
                        key={`${node.name}-${index}`}
                        className="min-w-0"
                    >
                        <div className="group flex h-full min-w-0 gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors hover:border-zinc-400 hover:bg-white">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-[10px] text-zinc-500 transition-colors group-hover:border-zinc-300 group-hover:bg-white">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                    Bước xử lý
                                </p>
                                <p className="mt-1 break-words text-sm font-semibold text-zinc-950 [overflow-wrap:anywhere]">
                                {node.name}
                                </p>
                                <p className="mt-1 break-words text-xs leading-5 text-zinc-600 [overflow-wrap:anywhere]">
                                    {node.responsibility}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
