import type { ReactNode } from 'react';

interface ProductCreateSectionProps {
    id: string;
    title: string;
    description: string;
    children: ReactNode;
}

// Tạo khung section thống nhất để form dài vẫn dễ quét và không lồng nhiều card trang trí.
export function ProductCreateSection({
    id,
    title,
    description,
    children,
}: ProductCreateSectionProps) {
    return (
        <section id={id} className="scroll-mt-32 border-b border-zinc-200 px-5 py-7 last:border-b-0 sm:px-7">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>
            {children}
        </section>
    );
}
