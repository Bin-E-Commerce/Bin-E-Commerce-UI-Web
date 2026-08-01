import type { ReactNode } from 'react';

interface ShopProfileDataRowProps {
    label: string;
    value: ReactNode;
    hint?: string;
}

// Hiển thị một dòng dữ liệu có nhãn thống nhất giữa các tab hồ sơ, đồng thời giữ giá trị dài không làm vỡ layout.
export function ShopProfileDataRow({
    label,
    value,
    hint,
}: ShopProfileDataRowProps) {
    return (
        <div className="grid gap-1 border-b border-zinc-100 py-4 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
            <dt className="text-sm font-medium text-zinc-500">{label}</dt>
            <dd className="min-w-0 text-sm font-medium text-zinc-950">
                <span className="break-words">{value || 'Chưa cập nhật'}</span>
                {hint ? (
                    <span className="mt-1 block text-xs font-normal leading-5 text-zinc-500">
                        {hint}
                    </span>
                ) : null}
            </dd>
        </div>
    );
}
