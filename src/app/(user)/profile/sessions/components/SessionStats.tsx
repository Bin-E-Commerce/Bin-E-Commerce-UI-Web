import type { SessionDto } from '@/services/auth';

// Tóm tắt số lượng phiên để người dùng nhanh chóng biết còn thiết bị khác hay không.
export function SessionStats({ sessions }: { sessions: SessionDto[] }) {
    const currentSessions = sessions.filter((session) => session.isCurrent);
    const otherSessions = sessions.filter((session) => !session.isCurrent);
    const googleSessions = sessions.filter(
        (session) => session.loginMethod === 'google',
    );

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm">
            <span className="font-semibold text-zinc-900">
                {currentSessions.length} phiên hiện tại
            </span>
            <span className="text-zinc-400">.</span>
            <span className="text-zinc-500">
                {otherSessions.length} thiết bị khác
            </span>
            {googleSessions.length > 0 && (
                <>
                    <span className="text-zinc-400">.</span>
                    <span className="text-zinc-500">
                        {googleSessions.length} đăng nhập qua Google
                    </span>
                </>
            )}
        </div>
    );
}
