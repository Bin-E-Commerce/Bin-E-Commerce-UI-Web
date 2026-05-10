'use client';

import { useSelector } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { RootState } from '@/store';
import { UserMenuSkeleton } from './UserMenuSkeleton';
import { UserMenuGuest } from './UserMenuGuest';
import { UserMenuDropdown } from './UserMenuDropdown';

export function UserMenu() {
    const { user, initialized } = useSelector((state: RootState) => state.auth);

    if (!initialized) {
        return <UserMenuSkeleton />;
    }

    if (!user) {
        return <UserMenuGuest />;
    }

    const initials = user.name
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="flex items-center gap-2 rounded-full p-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    aria-label="Tài khoản của bạn"
                >
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                            {initials}
                        </span>
                    )}
                    <span className="hidden lg:block max-w-30 truncate">
                        {user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>
            </DropdownMenu.Trigger>

            <UserMenuDropdown
                name={user.name}
                email={user.email}
                initials={initials}
                avatarUrl={user.avatarUrl ?? undefined}
            />
        </DropdownMenu.Root>
    );
}
