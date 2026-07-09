import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSellerApplicationDetailPageProps {
    params: Promise<{ id: string }>;
}

// Trang chi tiết tạm thời giữ đúng route theo id để nối nghiệp vụ duyệt hồ sơ ở bước kế tiếp.
export default async function AdminSellerApplicationDetailPage({
    params,
}: AdminSellerApplicationDetailPageProps) {
    const { id } = await params;

    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <ClipboardCheck className="size-5" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-zinc-950">
                Chi tiết hồ sơ seller
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Hồ sơ {id} đã có route riêng. Phần duyệt, từ chối và ghi chú admin sẽ
                được triển khai sau khi danh sách ổn định.
            </p>
            <Link
                href="/admin/sellers/applications"
                className={cn(buttonVariants({ variant: 'outline' }), 'mt-6 rounded-full px-4')}
            >
                Quay lại danh sách
            </Link>
        </section>
    );
}
