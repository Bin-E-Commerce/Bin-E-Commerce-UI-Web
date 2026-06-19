import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import { ShoppingBag } from 'lucide-react';

export default function ProfileOrdersPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <div className="flex-1">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 font-semibold text-zinc-900">
                            Đơn hàng của tôi
                        </h2>
                        {/* Skeleton rows */}
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 animate-pulse"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-zinc-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-48 rounded bg-zinc-100" />
                                        <div className="h-3 w-32 rounded bg-zinc-100" />
                                    </div>
                                    <div className="h-6 w-20 rounded-full bg-zinc-100" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center text-zinc-400">
                            <ShoppingBag className="h-12 w-12 opacity-30" />
                            <p className="text-sm">
                                Dữ liệu đơn hàng sẽ hiển thị tại đây.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
