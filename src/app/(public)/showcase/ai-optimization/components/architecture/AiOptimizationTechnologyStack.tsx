// Tóm tắt technology stack của AI Image Optimization; mỗi card chỉ giữ tên và vai trò để khớp nhịp đọc của Recommendation.
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

interface TechnologyCardProps {
    icon: ReactNode;
    name: string;
    role: string;
}

// Chuẩn hóa card thành logo trái, tên công nghệ và một dòng trách nhiệm ngắn.
function TechnologyCard({ icon, name, role }: TechnologyCardProps) {
    return (
        <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center">
                {icon}
            </span>
            <span className="min-w-0">
                <span className="block text-xs font-semibold text-zinc-950">
                    {name}
                </span>
                <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                    {role}
                </span>
            </span>
        </li>
    );
}

// Trình bày các mảnh ghép của workflow: UI, gateway, AI worker, state, cache, media và catalog.
export function AiOptimizationTechnologyStack() {
    return (
        <ShowcaseDisclosure
            id="ai-optimization-technology-stack"
            number="1.2"
            title="Công nghệ sử dụng"
            description="Các thành phần phục vụ seller UI, API gateway, xử lý AI bất đồng bộ, lưu asset và cập nhật catalog có kiểm soát."
        >
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/nextjs.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Next.js"
                    role="Seller UI"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/nestjs.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="NestJS"
                    role="API Gateway"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/postgresql.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="PostgreSQL"
                    role="Job state"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/redis.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Redis"
                    role="Rate limit"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/fastapi.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="FastAPI"
                    role="AI worker API"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/python.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Python"
                    role="AI processing"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/openai.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="OpenAI Images API"
                    role="gpt-image-2 · Lifestyle"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/apache-kafka.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Apache Kafka"
                    role="Job queue và DLQ"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/amazon-s3.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Media Service"
                    role="S3/CDN asset owner"
                />
            </ul>
        </ShowcaseDisclosure>
    );
}
