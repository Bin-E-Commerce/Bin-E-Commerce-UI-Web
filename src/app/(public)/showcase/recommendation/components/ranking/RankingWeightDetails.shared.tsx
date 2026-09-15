// Các khối trình bày dùng chung cho phần giải thích ranking; component chỉ lo bố cục, không thực hiện phép tính runtime.
import type { ReactNode } from 'react';

interface DetailSectionProps {
    title: string;
    children: ReactNode;
}

interface DetailTermProps {
    term: string;
    children: ReactNode;
}

interface DetailFormulaProps {
    children: ReactNode;
}

// Gom một chủ đề thành card có tiêu đề riêng để người đọc tra từng phần của công thức dễ hơn.
export function DetailSection({ title, children }: DetailSectionProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
            <h4 className="border-b border-zinc-100 pb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                {title}
            </h4>
            <div className="mt-2 text-[13px] leading-5 text-zinc-600">
                {children}
            </div>
        </section>
    );
}

// Tách tên biến khỏi diễn giải để các tham số trong công thức có thể được đọc độc lập.
export function DetailTerm({ term, children }: DetailTermProps) {
    return (
        <li className="grid min-w-0 gap-2 border-b border-zinc-100 py-2 last:border-b-0 sm:grid-cols-[minmax(11rem,0.34fr)_minmax(0,1fr)] sm:gap-4">
            <code className="h-fit w-fit max-w-full break-words rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium leading-5 text-zinc-900">
                {term}
            </code>
            <span className="min-w-0 text-[13px] leading-5 text-zinc-600">
                — {children}
            </span>
        </li>
    );
}

// Đặt công thức vào card riêng để người đọc đi từ biểu thức đến phần giải thích theo đúng thứ tự.
export function DetailFormula({ children }: DetailFormulaProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                Công thức đầy đủ
            </h4>
            <div className="mt-2 space-y-1.5 break-words border-t border-zinc-100 pt-2.5 font-mono text-xs leading-5 text-zinc-900 sm:text-[13px]">
                {children}
            </div>
        </section>
    );
}

