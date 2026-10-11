// Card lựa chọn dùng chung trong form seller; component chỉ trình bày trạng thái và chuyển sự kiện chọn lên parent.

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptionCardProps {
    title: string;
    description: string;
    active?: boolean;
    onClick: () => void;
}

// Xếp tiêu đề và mô tả thành một cột, ghi đè Button mặc định hiển thị ngang và không cho xuống dòng.
export function OptionCard({
    title,
    description,
    active = false,
    onClick,
}: OptionCardProps) {
    return (
        <Button
            variant="ghost"
            type="button"
            onClick={onClick}
            className={cn(
                'flex h-auto w-full min-w-0 flex-col items-start justify-start whitespace-normal rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2',
                active
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
            )}
        >
            <span className="block w-full break-words text-sm font-semibold">
                {title}
            </span>
            <span
                className={cn(
                    'mt-1 block w-full break-words text-sm leading-6',
                    active ? 'text-zinc-300' : 'text-zinc-500',
                )}
            >
                {description}
            </span>
        </Button>
    );
}
