import {
    CalendarX2,
    Clock,
    LogOut,
    MapPin,
    MousePointer2,
    Wifi,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { SessionDto } from '@/services/auth.service';
import { formatAbsoluteTime } from '@/utils/parseUserAgent';
import {
    formatExpiryTime,
    formatLoginTime,
    getSessionDeviceType,
    getSessionTitle,
    hasUsefulDeviceInfo,
    isUsefulIp,
} from '../utils/session-formatters';
import { AuthBadge } from './AuthBadge';
import { DeviceIcon } from './DeviceIcon';

// Hiển thị một phiên đăng nhập với thông tin đủ nhận diện và thao tác đăng xuất phù hợp.
export function SessionCard({
    session,
    onRequestRevoke,
    revoking,
}: {
    session: SessionDto;
    onRequestRevoke: (session: SessionDto) => void;
    revoking: boolean;
}) {
    const title = getSessionTitle(session);
    const deviceType = getSessionDeviceType(session);
    const showIp = isUsefulIp(session.ipAddress);
    const showDeviceInfo = hasUsefulDeviceInfo(session);

    return (
        <div className="relative flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300">
            <div
                className={[
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    session.isCurrent ? 'bg-zinc-900' : 'bg-zinc-50',
                ].join(' ')}
            >
                <DeviceIcon
                    deviceType={deviceType}
                    className={
                        session.isCurrent
                            ? 'h-5 w-5 text-white'
                            : 'h-5 w-5 text-zinc-500'
                    }
                />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">
                        {title}
                    </span>
                    {session.isCurrent && (
                        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                            Thiết bị này
                        </span>
                    )}
                    <AuthBadge loginMethod={session.loginMethod} />
                </div>

                {showDeviceInfo && (
                    <p className="text-xs text-zinc-500">
                        {session.os} - {session.browser}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    {showIp && (
                        <span className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            {session.ipAddress}
                        </span>
                    )}
                    {session.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                        </span>
                    )}
                    <span
                        className="flex items-center gap-1"
                        title={formatAbsoluteTime(session.issuedAt)}
                    >
                        <Clock className="h-3 w-3" />
                        Đăng nhập {formatLoginTime(session.issuedAt)}
                    </span>
                    {session.lastActiveAt && (
                        <span
                            className="flex items-center gap-1"
                            title={formatAbsoluteTime(session.lastActiveAt)}
                        >
                            <MousePointer2 className="h-3 w-3" />
                            Hoạt động {formatLoginTime(session.lastActiveAt)}
                        </span>
                    )}
                    <span
                        className="flex items-center gap-1"
                        title={formatAbsoluteTime(session.expiresAt)}
                    >
                        <CalendarX2 className="h-3 w-3" />
                        {formatExpiryTime(session.expiresAt)}
                    </span>
                </div>
            </div>

            <div className="shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRequestRevoke(session)}
                    disabled={revoking}
                    className="border-zinc-200 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    {revoking
                        ? 'Đang xử lý...'
                        : session.isCurrent
                          ? 'Đăng xuất'
                          : 'Kết thúc'}
                </Button>
            </div>
        </div>
    );
}
