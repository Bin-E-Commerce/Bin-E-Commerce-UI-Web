// Error state của dashboard giữ nguyên layout và cho phép seller thử lại một snapshot mới.

import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SellerDashboardErrorProps {
    onRetry: () => void;
    isRetrying: boolean;
}

export function SellerDashboardError({
    onRetry,
    isRetrying,
}: SellerDashboardErrorProps) {
    return (
        <Card size="sm" className="border-zinc-200 shadow-sm">
            <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <TriangleAlert className="size-5" />
                </span>
                <h1 className="mt-5 text-xl font-semibold text-zinc-950">
                    Chưa thể tải dashboard
                </h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Một dịch vụ dữ liệu của Seller Center đang tạm thời không
                    phản hồi. Vui lòng thử lại sau ít phút.
                </p>
                <Button
                    type="button"
                    className="mt-5"
                    onClick={onRetry}
                    disabled={isRetrying}
                >
                    <RefreshCw className={isRetrying ? 'animate-spin' : ''} />
                    Thử lại
                </Button>
            </CardContent>
        </Card>
    );
}
