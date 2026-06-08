import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddressesPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <div className="flex-1">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-zinc-900">
                                Địa chỉ giao hàng
                            </h2>
                            <Button variant="outline" size="sm" disabled>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Thêm địa chỉ
                            </Button>
                        </div>

                        <div className="flex flex-col items-center gap-3 py-12 text-center text-zinc-400">
                            <MapPin className="h-12 w-12 opacity-30" />
                            <p className="text-sm font-medium text-zinc-600">
                                Chưa có địa chỉ nào
                            </p>
                            <p className="text-xs text-zinc-400">
                                Thêm địa chỉ để checkout nhanh hơn trong các đơn
                                hàng tiếp theo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
