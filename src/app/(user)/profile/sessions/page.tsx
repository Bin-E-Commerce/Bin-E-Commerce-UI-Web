'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import { Button } from '@/components/ui/button';
import { authService, type SessionDto } from '@/services/auth';
import { type AppDispatch, type RootState } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { ConfirmRevokeModal } from './components/ConfirmRevokeModal';
import { ConfirmSessionModal } from './components/ConfirmSessionModal';
import { EmptySessions } from './components/EmptySessions';
import { SessionCard } from './components/SessionCard';
import { SessionCardSkeleton } from './components/SessionCardSkeleton';
import { SessionStats } from './components/SessionStats';

// Tải và quản lý các phiên đăng nhập của người dùng trong trang hồ sơ.
export default function SessionsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { sessionId } = useSelector((state: RootState) => state.auth);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);
    const [showConfirmAll, setShowConfirmAll] = useState(false);
    const [confirmSession, setConfirmSession] = useState<SessionDto | null>(
        null,
    );

    // Lấy lại danh sách phiên từ API; backend sẽ ưu tiên cookie để đánh dấu đúng phiên hiện tại.
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

    const currentSession = useMemo(
        () => sessions.find((session) => session.isCurrent) ?? null,
        [sessions],
    );
    const otherSessions = useMemo(
        () => sessions.filter((session) => !session.isCurrent),
        [sessions],
    );

    // Xác nhận và thu hồi một phiên; phiên hiện tại dùng logout chuẩn để clear cookie và Redux.
    async function handleConfirmOne() {
        if (!confirmSession) return;

        if (confirmSession.isCurrent) {
            setRevokingId(confirmSession.id);
            try {
                setConfirmSession(null);
                await dispatch(logoutUser()).unwrap();
            } catch {
                toast.error('Không thể đăng xuất thiết bị này');
            } finally {
                setRevokingId(null);
            }
            return;
        }

        setRevokingId(confirmSession.id);
        try {
            await authService.revokeSession(confirmSession.id, sessionId);
            setSessions((prev) =>
                prev.filter((session) => session.id !== confirmSession.id),
            );
            setConfirmSession(null);
            toast.success('Đã kết thúc phiên đăng nhập');
        } catch {
            toast.error('Không thể kết thúc phiên này');
        } finally {
            setRevokingId(null);
        }
    }

    // Đăng xuất tất cả thiết bị khác nhưng giữ lại phiên hiện tại; cookie giúp backend nhận diện đúng phiên cần giữ.
    async function handleRevokeOthers() {
        setRevokingAll(true);
        try {
            const res = await authService.revokeOtherSessions(sessionId);
            const count = res.data?.revokedCount ?? 0;
            setSessions((prev) => prev.filter((session) => session.isCurrent));
            setShowConfirmAll(false);
            toast.success(`Đã đăng xuất ${count} thiết bị khác`);
        } catch {
            toast.error('Không thể đăng xuất các thiết bị khác');
        } finally {
            setRevokingAll(false);
        }
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <ConfirmRevokeModal
                open={showConfirmAll}
                loading={revokingAll}
                onOpenChange={setShowConfirmAll}
                onConfirm={handleRevokeOthers}
            />
            <ConfirmSessionModal
                session={confirmSession}
                loading={Boolean(revokingId)}
                onOpenChange={(open) => {
                    if (!open) setConfirmSession(null);
                }}
                onConfirm={handleConfirmOne}
            />

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
                            <Button
                                size="sm"
                                onClick={() => setShowConfirmAll(true)}
                                disabled={revokingAll || sessions.length <= 1}
                            >
                                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                                {revokingAll
                                    ? 'Đang xử lý...'
                                    : 'Đăng xuất tất cả thiết bị khác'}
                            </Button>
                        </div>
                    </div>

                    {!loading && sessions.length > 0 && (
                        <SessionStats sessions={sessions} />
                    )}

                    <div className="space-y-5">
                        {loading ? (
                            <>
                                <SessionCardSkeleton />
                                <SessionCardSkeleton />
                                <SessionCardSkeleton />
                            </>
                        ) : sessions.length === 0 ? (
                            <EmptySessions />
                        ) : (
                            <>
                                {currentSession && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-zinc-900">
                                            Phiên hiện tại
                                        </h3>
                                        <SessionCard
                                            session={currentSession}
                                            onRequestRevoke={setConfirmSession}
                                            revoking={
                                                revokingId === currentSession.id
                                            }
                                        />
                                    </section>
                                )}

                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold text-zinc-900">
                                        Thiết bị khác
                                    </h3>
                                    {otherSessions.length > 0 ? (
                                        otherSessions.map((session) => (
                                            <SessionCard
                                                key={session.id}
                                                session={session}
                                                onRequestRevoke={
                                                    setConfirmSession
                                                }
                                                revoking={
                                                    revokingId === session.id
                                                }
                                            />
                                        ))
                                    ) : (
                                        <p className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-5 text-sm text-zinc-500">
                                            Không có thiết bị khác đang đăng
                                            nhập.
                                        </p>
                                    )}
                                </section>
                            </>
                        )}
                    </div>

                    {!loading && sessions.length > 0 && (
                        <p className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            Nếu bạn thấy thiết bị lạ, hãy kết thúc phiên đó
                            ngay và đổi mật khẩu để bảo vệ tài khoản.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
