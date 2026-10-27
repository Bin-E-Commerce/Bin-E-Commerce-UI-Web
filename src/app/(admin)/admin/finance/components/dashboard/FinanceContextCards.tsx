// Thẻ phụ tóm tắt các khoản nạp gần đây và quy tắc sử dụng số dư trong dashboard finance.
'use client';

import type { FinanceContextCardsProps } from '../../types/admin-finance-page.types';
import { formatMoney } from '../../utils/format-finance-money';

// Tóm tắt các lần nạp gần đây cùng lưu ý vận hành nền tảng trong một cụm thẻ.
export function FinanceContextCards({ deposits }: FinanceContextCardsProps) {
    return (
        <>
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Nạp ví Pay2S Sandbox gần đây</h2>
                <div className="mt-4 space-y-3">
                    {deposits.length ? (
                        deposits.map((deposit) => (
                            <div
                                key={deposit.id}
                                className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 text-sm"
                            >
                                <span>
                                    <span className="font-medium">
                                        {deposit.status}
                                    </span>
                                    <span className="ml-2 text-xs text-zinc-500">
                                        {new Date(
                                            deposit.createdAt,
                                        ).toLocaleString('vi-VN')}
                                    </span>
                                </span>
                                <strong className="tabular-nums">
                                    {formatMoney(deposit.amount)}
                                </strong>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-zinc-500">
                            Chưa có giao dịch nạp.
                        </p>
                    )}
                </div>
            </article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
                <h2 className="font-semibold">Chi hộ seller qua payOS</h2>
                <p className="mt-2">
                    Admin gửi lệnh qua Kênh Chi payOS tới tài khoản seller đã
                    lưu trong yêu cầu rút. Hệ thống chỉ tất toán ví khi payOS
                    xác nhận giao dịch thành công; nguồn tiền chi lấy từ tài
                    khoản payout đã liên kết và nạp tiền.
                </p>
                <p className="mt-2">
                    Yêu cầu đang xử lý theo luồng SePay/app ngân hàng cũ cần
                    được đối chiếu trước khi chuyển sang payout tự động.
                </p>
                <p className="mt-2">
                    Phí hoàn khách còn phải trả là khoản phải thu, không được
                    tính vào số dư tiền mặt mô phỏng cho tới khi thu thực tế.
                </p>
            </article>
        </>
    );
}
