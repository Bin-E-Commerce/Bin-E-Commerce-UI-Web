import { CalendarX2, Clock, LogOut, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionDto } from '@/services/auth.service';
import { formatAbsoluteTime } from '@/utils/parseUserAgent';
import {
    formatExpiryTime,
    formatLoginTime,
    getSessionDeviceType,
    getSessionTitle,
    isUsefulIp,
} from '../utils/session-formatters';
import { AuthBadge } from './AuthBadge';
import { DeviceIcon } from './DeviceIcon';

// Hiển thị một phiên đăng nhập với thông tin đủ nhận diện và thao tác kết thúc phiên.
export function SessionCard({
    session,
    onRevoke,
    revoking,
}: {
    session: SessionDto;
    onRevoke: (id: string) => void;
    revoking: boolean;
}) {
    const title = getSessionTitle(session);
    const deviceType = getSessionDeviceType(session);
    const showIp = isUsefulIp(session.ipAddress);

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
                    className={session.isCurrent ? 'h-5 w-5 text-white' : 'h-5 w-5 text-zinc-500'}
                />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">{title}</span>
                    <AuthBadge clientId={session.clientId} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    {showIp && (
                        <span className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            {session.ipAddress}
                        </span>
                    )}
                    <span className="flex items-center gap-1" title={formatAbsoluteTime(session.issuedAt)}>
                        <Clock className="h-3 w-3" />
                        Đăng nhập {formatLoginTime(session.issuedAt)}
                    </span>
                    <span className="flex items-center gap-1" title={formatAbsoluteTime(session.expiresAt)}>
                        <CalendarX2 className="h-3 w-3" />
                        {formatExpiryTime(session.expiresAt)}
                    </span>
                </div>
            </div>

            <div className="shrink-0">
                {session.isCurrent ? (
                    <span className="text-xs font-medium text-zinc-900">
                        Đang dùng
                    </span>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRevoke(session.id)}
                        disabled={revoking}
                        className="border-zinc-200 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                        <LogOut className="mr-1.5 h-3.5 w-3.5" />
                        Kết thúc
                    </Button>
                )}
            </div>
        </div>
    );
}
