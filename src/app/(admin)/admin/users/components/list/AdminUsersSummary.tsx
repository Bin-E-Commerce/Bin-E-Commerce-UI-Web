// Các thẻ tổng quan của user list; nhận summary từ API và không tự tính lại số liệu.
import type { AdminUsersSummary } from '../../types/admin-user-page.types';

interface AdminUsersSummaryProps {
    summary?: AdminUsersSummary;
}

// Hiển thị ba chỉ số vận hành chính với cùng một kiểu đơn sắc của Admin Center.
export function AdminUsersSummary({ summary }: AdminUsersSummaryProps) {
    const cards = [
        ['Tổng user', summary?.total ?? 0],
        ['Active', summary?.active ?? 0],
        ['Banned', summary?.banned ?? 0],
    ] as const;

    return (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([label, value]) => (
                <div
                    key={label}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                        {value}
                    </p>
                </div>
            ))}
        </section>
    );
}
