// Cảnh báo và khôi phục nhóm nội dung; chỉ gọi callback đổi trạng thái, không tự sở hữu nghiệp vụ domain.

'use client';

import { useState } from 'react';
import type { AxiosError } from 'axios';
import { Power, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DomainRecoveryNoticeProps } from '../types/documents/document.types';

// Đặt cảnh báo ở cuối thân modal để thao tác khôi phục tách biệt với nội dung và bước xử lý thường.
// Domain ARCHIVED hiện nút khôi phục, DRAFT hiện nút kích hoạt; trạng thái khác chỉ hiển thị cảnh báo.
// API vẫn quyết định quyền và điều kiện có tài liệu xuất bản, còn component chuyển lỗi thành hướng dẫn dễ hiểu.
export function DomainRecoveryNotice({
    domainCode,
    domainLabel,
    domainStatus,
    isActivatingDomain,
    onActivateDomain,
}: DomainRecoveryNoticeProps) {
    const [activationError, setActivationError] = useState('');

    // Dùng cùng mutation đổi trạng thái; giữ card mở và báo lỗi nếu backend từ chối khôi phục/kích hoạt.
    async function activateDomain() {
        setActivationError('');
        try {
            await onActivateDomain(domainCode);
        } catch (error) {
            const response = (
                error as
                    | AxiosError<{ message?: string | string[] }>
                    | null
                    | undefined
            )?.response;
            const message = Array.isArray(response?.data?.message)
                ? response.data.message.join(' ')
                : response?.data?.message;

            setActivationError(
                message?.includes(
                    'Domain cần có ít nhất một tài liệu đã xuất bản',
                )
                    ? 'Nhóm cần có ít nhất một tài liệu đã xuất bản. Hãy xuất bản tài liệu rồi thử lại.'
                    : response?.status === 403
                      ? 'Bạn chưa có quyền thay đổi trạng thái nhóm nội dung này.'
                      : 'Chưa thể cập nhật nhóm. Hãy kiểm tra kết nối hoặc thử lại.',
            );
        }
    }

    return (
        <section
            aria-label="Trạng thái nhóm nội dung"
            className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="flex min-w-0 items-start gap-2.5">
                <TriangleAlert
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                    aria-hidden="true"
                />
                <div className="min-w-0">
                    <p className="text-sm font-medium text-destructive">
                        {domainStatus === 'ARCHIVED'
                            ? 'Nhóm đang ngừng sử dụng'
                            : domainStatus === 'DRAFT'
                              ? 'Nhóm chưa được kích hoạt'
                              : 'Chưa xác định trạng thái nhóm'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {domainStatus === 'ARCHIVED' || domainStatus === 'DRAFT'
                            ? `BinGPT chưa thể dùng tài liệu trong nhóm “${domainLabel}”.`
                            : 'Không thể xác nhận nhóm này đang hoạt động.'}
                    </p>
                    {activationError && (
                        <p
                            role="alert"
                            className="mt-2 text-xs leading-5 text-destructive"
                        >
                            {activationError}
                        </p>
                    )}
                </div>
            </div>
            {(domainStatus === 'ARCHIVED' || domainStatus === 'DRAFT') && (
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 bg-background"
                    onClick={() => void activateDomain()}
                    disabled={isActivatingDomain}
                >
                    <Power aria-hidden="true" />
                    {isActivatingDomain
                        ? domainStatus === 'ARCHIVED'
                            ? 'Đang khôi phục…'
                            : 'Đang kích hoạt…'
                        : domainStatus === 'ARCHIVED'
                          ? 'Khôi phục nhóm'
                          : 'Kích hoạt nhóm'}
                </Button>
            )}
        </section>
    );
}
