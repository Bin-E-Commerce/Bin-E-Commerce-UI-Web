import type { ElementType } from 'react';
import {
    ArrowRight,
    CircleDollarSign,
    FileText,
    ListChecks,
    ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SellerRegisterHeroProps {
    currentStep: number;
    isLastStep: boolean;
    totalSteps: number;
    onStepChange: (step: number) => void;
}

// Hero giới thiệu luồng đăng ký và cho phép nhảy tới các mốc chính qua cùng rule khóa bước.
export function SellerRegisterHero({
    currentStep,
    isLastStep,
    totalSteps,
    onStepChange,
}: SellerRegisterHeroProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="p-6 sm:p-8 lg:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                        Mở kênh bán hàng trên Bin
                    </div>

                    <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                        Tạo hồ sơ shop rõ ràng, dễ duyệt và sẵn sàng vận hành.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">
                        Hoàn thiện thông tin shop, địa chỉ lấy hàng và thanh
                        toán theo từng bước. Sau khi gửi hồ sơ, đội ngũ vận
                        hành sẽ kiểm tra trước khi kích hoạt Seller Center.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button
                            type="button"
                            className="h-11 gap-2 rounded-full px-5 shadow-md"
                            onClick={() => onStepChange(0)}
                        >
                            Bắt đầu điền hồ sơ
                            <ArrowRight className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 gap-2 rounded-full px-5 shadow-sm"
                            onClick={() => onStepChange(totalSteps - 1)}
                        >
                            Xem bước xác nhận
                        </Button>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        <FeatureCard
                            icon={ListChecks}
                            title="Thiết lập có hướng dẫn"
                            description="Điền theo từng bước, dễ quay lại chỉnh sửa trước khi gửi duyệt."
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Duyệt minh bạch"
                            description="Trạng thái hồ sơ rõ ràng, biết cần bổ sung gì nếu chưa đạt."
                        />
                        <FeatureCard
                            icon={CircleDollarSign}
                            title="Sẵn sàng bán"
                            description="Kết nối shop, kho lấy hàng và thanh toán ngay từ đầu."
                        />
                    </div>
                </div>

                <div className="border-t border-zinc-200 bg-zinc-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                    <p className="text-sm text-zinc-400">Trạng thái hồ sơ</p>
                    <div className="mt-5 rounded-xl bg-white/10 p-5 ring-1 ring-white/10">
                        <div className="flex items-center gap-3">
                            <span className="flex size-12 items-center justify-center rounded-xl bg-white text-zinc-950">
                                <FileText className="size-5" />
                            </span>
                            <div>
                                <p className="font-semibold">Bản nháp</p>
                                <p className="text-sm text-zinc-400">
                                    Chưa gửi duyệt
                                </p>
                            </div>
                        </div>

                        <Separator className="my-5 bg-white/10" />

                        <div className="space-y-3 text-sm">
                            <StatusRow label="Thông tin shop" value="Đang điền" />
                            <StatusRow
                                label="Định danh người bán"
                                value={
                                    currentStep >= 1
                                        ? 'Đang điền'
                                        : 'Chờ bước sau'
                                }
                            />
                            <StatusRow
                                label="Gửi duyệt"
                                value={isLastStep ? 'Sẵn sàng' : 'Chưa sẵn sàng'}
                                highlight={isLastStep}
                            />
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 p-4">
                        <p className="text-sm font-semibold text-white">
                            Dự kiến xử lý
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                            Hồ sơ đầy đủ giúp quá trình duyệt nhanh hơn và hạn
                            chế phải bổ sung nhiều lần.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface FeatureCardProps {
    icon: ElementType;
    title: string;
    description: string;
}

// Card lợi ích trong hero giữ thông tin ngắn, dễ quét và dùng icon đồng bộ với nhận diện đen trắng.
function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50">
            <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                <Icon className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-zinc-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
                {description}
            </p>
        </div>
    );
}

interface StatusRowProps {
    label: string;
    value: string;
    highlight?: boolean;
}

// Dòng trạng thái trong hero cho người dùng biết hồ sơ đang ở đâu trước khi chuyển xuống form.
function StatusRow({ label, value, highlight = false }: StatusRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-2">
            <span className="text-zinc-300">{label}</span>
            <span
                className={cn(
                    'font-medium',
                    highlight ? 'text-white' : 'text-zinc-400',
                )}
            >
                {value}
            </span>
        </div>
    );
}
