import { ShieldCheck } from 'lucide-react';

interface SummaryCardProps {
    label: string;
    value: string;
}

// Card thống kê nhỏ giúp admin kiểm tra nhanh trạng thái seed quyền hiện tại.
export function SummaryCard({ label, value }: SummaryCardProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500">{label}</p>
                <ShieldCheck className="size-4 text-zinc-300" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">
                {value}
            </p>
        </div>
    );
}
