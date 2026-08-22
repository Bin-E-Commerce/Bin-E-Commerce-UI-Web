import { cn } from '@/lib/utils';

interface OptionCardProps {
    title: string;
    description: string;
    active?: boolean;
    onClick: () => void;
}

// Card lựa chọn dạng button để giữ accessibility và tái sử dụng cho seller type, payout type.
export function OptionCard({
    title,
    description,
    active = false,
    onClick,
}: OptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2',
                active
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
            )}
        >
            <span className="block text-sm font-semibold">{title}</span>
            <span
                className={cn(
                    'mt-1 block text-sm leading-6',
                    active ? 'text-zinc-300' : 'text-zinc-500',
                )}
            >
                {description}
            </span>
        </button>
    );
}

