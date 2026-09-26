// Một lựa chọn account trong danh sách activity, chỉ hiển thị thông tin nhận diện cần thiết.

import { Button } from '@/components/ui/button';
import { AccountAvatar } from './AccountAvatar';
import type { ActivityActor } from '../types';

interface Props {
    actor: ActivityActor;
    selected: boolean;
    onSelect: (userId: string) => void;
}

// Nêu rõ account đang chọn bằng nền trung tính và chuyển actorId lên component điều phối khi được bấm.
export function ActiveAccountOption({ actor, selected, onSelect }: Props) {
    const account = actor.account;
    const displayName = account?.name ?? 'Tài khoản chưa đồng bộ';

    return (
        <Button
            variant="ghost"
            type="button"
            onClick={() => onSelect(actor.actorId)}
            aria-pressed={selected}
            className={`w-full rounded-lg border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 ${
                selected
                    ? 'border-zinc-600 bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'border-zinc-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <AccountAvatar
                    name={displayName}
                    avatarUrl={account?.avatarUrl ?? null}
                    size="size-9"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                        {displayName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        {account?.email ??
                            account?.phone ??
                            'Đang cập nhật thông tin'}
                    </p>
                </div>
                <div className="hidden shrink-0 items-center gap-1.5 text-[11px] text-zinc-500 sm:flex">
                    <span>{actor.events.toLocaleString('vi-VN')} event</span>
                    <span className="text-zinc-300">·</span>
                    <span>{actor.clicks} click</span>
                    <span className="text-zinc-300">·</span>
                    <span>{actor.cartAdds} giỏ</span>
                </div>
            </div>
        </Button>
    );
}
