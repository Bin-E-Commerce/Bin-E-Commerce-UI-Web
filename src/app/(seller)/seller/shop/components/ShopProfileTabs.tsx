'use client';

import { Building2, ReceiptText, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ShopProfileTab = 'basic' | 'tax' | 'identity';

interface ShopProfileTabsProps {
    activeTab: ShopProfileTab;
    disabled?: boolean;
    onChange: (tab: ShopProfileTab) => void;
}

interface ShopProfileTabButtonProps {
    active: boolean;
    disabled: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

// Render một tab điều hướng có trạng thái active rõ ràng và không làm thay đổi kích thước thanh tab.
function ShopProfileTabButton({
    active,
    disabled,
    icon,
    label,
    onClick,
}: ShopProfileTabButtonProps) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'relative flex h-14 shrink-0 items-center gap-2 px-1 text-sm font-medium transition-colors',
                active
                    ? 'text-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-900',
                disabled && 'cursor-not-allowed opacity-45',
            )}
        >
            {icon}
            {label}
            <span
                className={cn(
                    'absolute inset-x-0 bottom-0 h-0.5 bg-zinc-950 transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                )}
            />
        </button>
    );
}

// Điều hướng ba nhóm hồ sơ; khi đang chỉnh sửa, khóa chuyển tab để tránh người dùng mất thay đổi chưa lưu.
export function ShopProfileTabs({
    activeTab,
    disabled = false,
    onChange,
}: ShopProfileTabsProps) {
    return (
        <div
            role="tablist"
            aria-label="Nhóm thông tin hồ sơ shop"
            className="flex gap-7 overflow-x-auto border-b border-zinc-200 px-5 sm:px-7"
        >
            <ShopProfileTabButton
                active={activeTab === 'basic'}
                disabled={disabled}
                icon={<Building2 className="size-4" />}
                label="Thông tin cơ bản"
                onClick={() => onChange('basic')}
            />
            <ShopProfileTabButton
                active={activeTab === 'tax'}
                disabled={disabled}
                icon={<ReceiptText className="size-4" />}
                label="Thuế và thanh toán"
                onClick={() => onChange('tax')}
            />
            <ShopProfileTabButton
                active={activeTab === 'identity'}
                disabled={disabled}
                icon={<ShieldCheck className="size-4" />}
                label="Định danh"
                onClick={() => onChange('identity')}
            />
        </div>
    );
}
