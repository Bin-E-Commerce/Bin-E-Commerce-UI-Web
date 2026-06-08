'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import { Button } from '@/components/ui/button';
import { authService, type SessionDto } from '@/services/auth.service';
import { type RootState } from '@/store';
import { ConfirmRevokeModal } from './components/ConfirmRevokeModal';
import { EmptySessions } from './components/EmptySessions';
import { SessionCard } from './components/SessionCard';
import { SessionCardSkeleton } from './components/SessionCardSkeleton';
import { SessionStats } from './components/SessionStats';

// Tải và quản lý các phiên đăng nhập của người dùng trong trang hồ sơ.
export default function SessionsPage() {
    const { sessionId } = useSelector((state: RootState) => state.auth);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Lấy lại danh sách phiên từ API và dùng session hiện tại để backend đánh dấu đúng "Đang dùng".
    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authService.getSessions(sessionId);
            setSessions(res.data ?? []);
        } catch {
            toast.error('Không thể tải danh sách phiên đăng nhập');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Kết thúc một phiên cụ thể và loại bỏ ngay khỏi danh sách để giao diện phản hồi nhanh.
    async function handleRevokeOne(id: string) {
        setRevokingId(id);
        try {
            await authService.revokeSession(id, sessionId);
            setSessions((prev) => prev.filter((session) => session.id !== id));
            toast.success('Đã kết thúc phiên đăng nhập');
        } catch {
            toast.error('Không thể kết thúc phiên này');
        } finally {
            setRevokingId(null);
        }
    }

    // Chỉ đăng xuất các phiên khác để tránh tự đá người dùng khỏi phiên hiện tại.
    async function handleRevokeAll() {
        if (!sessionId) return;
        setRevokingAll(true);
        setShowConfirm(false);
        try {
            const res = await authService.revokeOtherSessions(sessionId);
            const count = res.data?.revokedCount ?? 0;
            setSessions((prev) => prev.filter((session) => session.isCurrent));
            toast.success(`Đã đăng xuất ${count} thiết bị khác`);
        } catch {
            toast.error('Không thể đăng xuất các thiết bị khác');
        } finally {
            setRevokingAll(false);
        }
    }

    const otherSessions = sessions.filter((session) => !session.isCurrent);
    const hasOtherSessions = otherSessions.length > 0;

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {showConfirm && (
                <ConfirmRevokeModal
                    onConfirm={handleRevokeAll}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900">
                                Phiên đăng nhập
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Quản lý các thiết bị đang đăng nhập vào tài
                                khoản của bạn.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchSessions}
                                disabled={loading}
                            >
                                <RefreshCw
                                    className={[
                                        'mr-1.5 h-3.5 w-3.5',
                                        loading ? 'animate-spin' : '',
                                    ].join(' ')}
                                />
                                Làm mới
                            </Button>
                            {hasOtherSessions && (
                                <Button
                                    size="sm"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={revokingAll}
                                >
                                    <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                                    {revokingAll
                                        ? 'Đang xử lý...'
                                        : 'Đăng xuất tất cả thiết bị khác'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {!loading && sessions.length > 0 && (
                        <SessionStats sessions={sessions} />
                    )}

                    <div className="space-y-3">
                        {loading ? (
                            <>
                                <SessionCardSkeleton />
                                <SessionCardSkeleton />
                                <SessionCardSkeleton />
                            </>
                        ) : sessions.length === 0 ? (
                            <EmptySessions />
                        ) : (
                            sessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    onRevoke={handleRevokeOne}
                                    revoking={revokingId === session.id}
                                />
                            ))
                        )}
                    </div>

                    {!loading && sessions.length > 0 && (
                        <p className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            Nếu bạn thấy thiết bị lạ, hãy kết thúc phiên đó ngay
                            và đổi mật khẩu để bảo vệ tài khoản.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
