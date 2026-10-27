// Bảng đơn COD chờ đối soát chỉ nhận dữ liệu đã tải và phát sự kiện nhập/xác nhận cho component sở hữu mutation.
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CodRemittanceTableProps } from '../../types/admin-finance-page.types';

// Giữ nguyên định dạng COD hiện tại để tránh thay đổi cách hiển thị dữ liệu API.
function formatCodMoney(amount: string): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(amount));
}

// Hiển thị từng đơn COD; trạng thái mutation được gắn đúng dòng để giữ nguyên phản hồi đang lưu.
export function CodRemittanceTable({
    items,
    references,
    pendingOrderId,
    isPending,
    onReferenceChange,
    onConfirm,
}: CodRemittanceTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                        <th className="px-5 py-3">Đơn hàng</th>
                        <th className="px-5 py-3">Hoàn tất</th>
                        <th className="px-5 py-3 text-right">COD</th>
                        <th className="px-5 py-3">Mã đối soát</th>
                        <th className="px-5 py-3 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {items.map((item) => {
                        const inputId = `cod-remittance-${item.orderId}`;
                        const reference = references[item.orderId] ?? '';

                        return (
                            <tr key={item.orderId}>
                                <td className="px-5 py-4">
                                    <p className="font-medium text-zinc-900">
                                        {item.orderNumber}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-zinc-500">
                                        {item.orderId}
                                    </p>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                                    {new Date(item.completedAt).toLocaleString(
                                        'vi-VN',
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">
                                    {formatCodMoney(item.amount)}
                                </td>
                                <td className="min-w-64 px-5 py-4">
                                    <Label
                                        className="sr-only"
                                        htmlFor={inputId}
                                    >
                                        Mã đối soát COD đơn {item.orderNumber}
                                    </Label>
                                    <Input
                                        id={inputId}
                                        value={reference}
                                        maxLength={120}
                                        placeholder="Mã giao dịch ngân hàng"
                                        onChange={(event) =>
                                            onReferenceChange(
                                                item.orderId,
                                                event.target.value,
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            !reference.trim() || isPending
                                        }
                                        onClick={() =>
                                            onConfirm(
                                                item.orderId,
                                                reference.trim(),
                                            )
                                        }
                                    >
                                        {pendingOrderId === item.orderId
                                            ? 'Đang lưu...'
                                            : 'Đã nhận tiền'}
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
