import { ArrowRight, ExternalLink, FileImage } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    ShopProfileChangeRequestDto,
    ShopProfileChangeSection,
} from '@/services/seller';
import {
    buildChangeComparisonRows,
    formatChangeSection,
    getRequestedVerificationDocuments,
} from '../../utils/shop-profile-change-formatters';

interface ShopProfileChangeComparisonProps {
    request: ShopProfileChangeRequestDto;
}

// Trình bày từng field trước và sau theo section để admin nhìn ra chính xác dữ liệu nào sẽ bị ghi đè khi duyệt.
export function ShopProfileChangeComparison({
    request,
}: ShopProfileChangeComparisonProps) {
    const rowsBySection = buildChangeComparisonRows(request);
    const documents = getRequestedVerificationDocuments(request);

    return (
        <div className="space-y-5">
            {request.sections.map((section) => (
                <ChangeSection
                    key={section}
                    section={section}
                    rows={rowsBySection[section]}
                />
            ))}

            {documents.length > 0 ? (
                <section className="rounded-md border border-zinc-200 bg-white shadow-sm">
                    <header className="border-b border-zinc-200 px-5 py-4">
                        <h2 className="font-semibold text-zinc-950">
                            Giấy tờ xác minh mới
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Mở từng ảnh để đối chiếu với thông tin định danh
                            seller đề nghị cập nhật.
                        </p>
                    </header>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        {documents.map((document) => (
                            <article
                                key={document.key}
                                className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-white">
                                    {/* Ảnh tài liệu chỉ dùng để kiểm duyệt; alt mô tả đúng loại giấy tờ thay vì lộ tên file kỹ thuật. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={document.url}
                                        alt={document.label}
                                        className="size-full object-contain"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-3 border-t border-zinc-200 p-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-zinc-950">
                                            {document.label}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                                            {document.fileName}
                                        </p>
                                    </div>
                                    <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Mở ${document.label}`}
                                        className={cn(
                                            buttonVariants({
                                                size: 'icon',
                                                variant: 'outline',
                                            }),
                                        )}
                                    >
                                        <ExternalLink className="size-4" />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}

interface ChangeSectionProps {
    section: ShopProfileChangeSection;
    rows: ReturnType<
        typeof buildChangeComparisonRows
    >[ShopProfileChangeSection];
}

// Gom các field cùng nghiệp vụ vào một khối để quyết định duyệt không bị lẫn giữa thuế, thanh toán và định danh.
function ChangeSection({ section, rows }: ChangeSectionProps) {
    return (
        <section className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-md bg-zinc-950 text-white">
                    <FileImage className="size-5" />
                </span>
                <div>
                    <h2 className="font-semibold text-zinc-950">
                        {formatChangeSection(section)}
                    </h2>
                    <p className="text-sm text-zinc-500">
                        So sánh dữ liệu đang có hiệu lực với nội dung seller đề
                        nghị.
                    </p>
                </div>
            </header>

            <div className="divide-y divide-zinc-200">
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="grid gap-3 px-5 py-4 md:grid-cols-[180px_minmax(0,1fr)_32px_minmax(0,1fr)] md:items-center"
                    >
                        <p className="text-sm font-medium text-zinc-700">
                            {row.label}
                        </p>
                        <ComparisonValue
                            label="Đang sử dụng"
                            value={row.before}
                        />
                        <ArrowRight className="hidden size-4 text-zinc-400 md:block" />
                        <ComparisonValue
                            label="Đề nghị mới"
                            value={row.after}
                            highlighted
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

interface ComparisonValueProps {
    label: string;
    value: string;
    highlighted?: boolean;
}

// Gắn nhãn ngữ cảnh trực tiếp vào mỗi giá trị để bố cục mobile vẫn dễ hiểu khi các cột xếp dọc.
function ComparisonValue({
    label,
    value,
    highlighted = false,
}: ComparisonValueProps) {
    return (
        <div
            className={
                highlighted
                    ? 'rounded-md border border-zinc-300 bg-zinc-950 px-3 py-2.5 text-white'
                    : 'rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-800'
            }
        >
            <p
                className={
                    highlighted
                        ? 'text-xs text-zinc-300'
                        : 'text-xs text-zinc-500'
                }
            >
                {label}
            </p>
            <p className="mt-1 break-words text-sm font-medium">{value}</p>
        </div>
    );
}
