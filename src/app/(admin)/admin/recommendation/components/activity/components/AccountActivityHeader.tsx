// Hiển thị danh tính account được chọn và ba số liệu activity chính để tạo ngữ cảnh cho bảng event.

import { Activity, MousePointerClick, ShoppingCart } from 'lucide-react';

import type { ActivityActor } from '../types';
import { AccountAvatar } from './AccountAvatar';

interface Props {
    selectedActor: ActivityActor | undefined;
    selectedUserId: string | null;
}

// Hiển thị tên/email/điện thoại và metrics của account đang xem; UUID không được đưa lên làm tiêu đề.
export function AccountActivityHeader({
    selectedActor,
    selectedUserId,
}: Props) {
    const selectedAccount = selectedActor?.account;

    return (
        <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50/80 via-white to-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    {selectedAccount ? (
                        <div className="rounded-2xl bg-white p-1 shadow-sm ring-1 ring-zinc-200">
                            <AccountAvatar
                                name={selectedAccount.name}
                                avatarUrl={selectedAccount.avatarUrl}
                                size="size-11"
                            />
                        </div>
                    ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                            <Activity className="size-5" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Hành trình recommendation
                        </p>
                        <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-zinc-950">
                            {selectedAccount?.name ?? 'Activity của tài khoản'}
                        </h2>
                        <p className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-xs text-zinc-500">
                            <span className="truncate">
                                {selectedAccount?.email ??
                                    (selectedUserId
                                        ? 'Đang tải thông tin tài khoản...'
                                        : 'Chọn tài khoản bên trái để bắt đầu')}
                            </span>
                            {selectedAccount?.phone ? (
                                <>
                                    <span className="text-zinc-300">·</span>
                                    <span className="shrink-0">
                                        {selectedAccount.phone}
                                    </span>
                                </>
                            ) : null}
                        </p>
                    </div>
                </div>

                {selectedActor ? (
                    <div className="flex flex-wrap gap-2">
                        <ActivityStat
                            label="Tổng event"
                            value={selectedActor.events}
                            icon={Activity}
                        />
                        <ActivityStat
                            label="Lượt click"
                            value={selectedActor.clicks}
                            icon={MousePointerClick}
                        />
                        <ActivityStat
                            label="Thêm giỏ"
                            value={selectedActor.cartAdds}
                            icon={ShoppingCart}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

// Render một metric nhỏ của account với định dạng số locale Việt Nam.
function ActivityStat({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Activity;
}) {
    return (
        <div className="min-w-[6.5rem] rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Icon className="size-3.5" />
                {label}
            </div>
            <p className="mt-0.5 text-base font-semibold text-zinc-950">
                {value.toLocaleString('vi-VN')}
            </p>
        </div>
    );
}
