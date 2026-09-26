// Tìm và chọn account có recommendation activity; quyền sở hữu search state nằm ở hook cha.

import { Search, UserRound } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { ActiveAccountOption } from './ActiveAccountOption';
import type { ActivityActor } from '../types';

interface Props {
    users: ActivityActor[];
    selectedUserId: string | null;
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onSelect: (userId: string) => void;
}

// Hiển thị ô tìm kiếm, danh sách account, skeleton tải ban đầu và trạng thái không tìm thấy.
export function ActiveAccountsPanel({
    users,
    selectedUserId,
    loading,
    search,
    onSearchChange,
    onSelect,
}: Props) {
    return (
        <section className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                            <UserRound className="size-4" />
                        </span>
                        <h2 className="text-base font-semibold text-zinc-950">
                            Tài khoản có hoạt động
                        </h2>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Chọn tài khoản để xem hành trình gợi ý.
                    </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
                    {users.length} tài khoản
                </span>
            </div>

            <label className="relative mt-3 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Tìm tên, email, số điện thoại..."
                    aria-label="Tìm tài khoản theo tên, email hoặc số điện thoại"
                    className="h-9 rounded-lg border-zinc-200 pl-9 pr-3 text-sm"
                />
            </label>

            <div className="mt-3 space-y-1.5">
                {loading && users.length === 0
                    ? [1, 2, 3].map((item) => (
                          <div
                              key={item}
                              className="rounded-lg border border-zinc-100 p-2.5"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="size-10 animate-pulse rounded-full bg-zinc-100" />
                                  <div className="min-w-0 flex-1 space-y-2">
                                      <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
                                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-zinc-100" />
                                  </div>
                              </div>
                          </div>
                      ))
                    : users.map((actor) => (
                          <ActiveAccountOption
                              key={actor.actorId}
                              actor={actor}
                              selected={actor.actorId === selectedUserId}
                              onSelect={onSelect}
                          />
                      ))}

                {!loading && users.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center">
                        <Search className="mx-auto size-5 text-zinc-300" />
                        <p className="mt-2 text-sm font-medium text-zinc-600">
                            {search
                                ? 'Không tìm thấy tài khoản phù hợp'
                                : 'Chưa có tài khoản có hoạt động'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                            {search
                                ? 'Thử email, số điện thoại hoặc tên khác.'
                                : 'Dữ liệu sẽ xuất hiện khi có event recommendation.'}
                        </p>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
