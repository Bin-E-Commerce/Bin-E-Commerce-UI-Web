// Thẻ giới thiệu một hệ thống và điều hướng đến tài liệu chi tiết; thông tin tĩnh không được hiểu là số liệu vận hành.
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface ShowcaseFeatureCardProps {
    href: string;
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
    stack?: Array<{ name: string; iconSrc: string }>;
}

// Tóm tắt chức năng chính bằng ảnh và mô tả đủ ngữ cảnh để người xem chọn đúng hệ thống.
// Toàn card là liên kết đến trang chi tiết; phần tóm tắt không thay thế nội dung vận hành đầy đủ.
export function ShowcaseFeatureCard({
    href,
    imageSrc,
    imageAlt,
    title,
    description,
    stack,
}: ShowcaseFeatureCardProps) {
    // Mặc định hiển thị đúng các stack chính theo route; caller vẫn có thể truyền stack riêng khi cần mở rộng card.
    const defaultStackByRoute: Record<string, Array<{ name: string; iconSrc: string }>> = {
        '/showcase/recommendation': [
            { name: 'Next.js', iconSrc: '/images/feature/tech-stack/nextjs.svg' },
            { name: 'NestJS', iconSrc: '/images/feature/tech-stack/nestjs.svg' },
            { name: 'PostgreSQL', iconSrc: '/images/feature/tech-stack/postgresql.svg' },
            { name: 'Redis', iconSrc: '/images/feature/tech-stack/redis.svg' },
            { name: 'Kafka', iconSrc: '/images/feature/tech-stack/apache-kafka.svg' },
            { name: 'Qdrant', iconSrc: '/images/feature/tech-stack/qdrant.svg' },
            { name: 'FastAPI', iconSrc: '/images/feature/tech-stack/fastapi.svg' },
            { name: 'Python', iconSrc: '/images/feature/tech-stack/python.svg' },
        ],
        '/showcase/ai-optimization': [
            { name: 'Next.js', iconSrc: '/images/feature/tech-stack/nextjs.svg' },
            { name: 'NestJS', iconSrc: '/images/feature/tech-stack/nestjs.svg' },
            { name: 'PostgreSQL', iconSrc: '/images/feature/tech-stack/postgresql.svg' },
            { name: 'Redis', iconSrc: '/images/feature/tech-stack/redis.svg' },
            { name: 'FastAPI', iconSrc: '/images/feature/tech-stack/fastapi.svg' },
            { name: 'Python', iconSrc: '/images/feature/tech-stack/python.svg' },
            { name: 'OpenAI', iconSrc: '/images/feature/tech-stack/openai.svg' },
            { name: 'Amazon SQS', iconSrc: '/images/feature/tech-stack/amazon-sqs.svg' },
            { name: 'AWS Lambda', iconSrc: '/images/feature/tech-stack/aws-lambda.svg' },
            { name: 'Amazon S3', iconSrc: '/images/feature/tech-stack/amazon-s3.svg' },
        ],
        '/showcase/authorization-management': [
            { name: 'Next.js', iconSrc: '/images/feature/tech-stack/nextjs.svg' },
            { name: 'NestJS', iconSrc: '/images/feature/tech-stack/nestjs.svg' },
            { name: 'PostgreSQL', iconSrc: '/images/feature/tech-stack/postgresql.svg' },
            { name: 'Redis', iconSrc: '/images/feature/tech-stack/redis.svg' },
            { name: 'Keycloak', iconSrc: '/images/feature/tech-stack/keycloak.svg' },
            { name: 'JWT + JWKS', iconSrc: '/images/feature/tech-stack/jwt.svg' },
        ],
    };
    const displayedStack = stack ?? defaultStackByRoute[href] ?? [];

    return (
        <Link
            href={href}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-zinc-400 hover:shadow-[0_20px_48px_-30px_rgba(24,24,27,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
            <div className="relative aspect-video w-full overflow-hidden border-b border-zinc-200 bg-white">
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.025]"
                />
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h2 className="text-base font-semibold leading-6 tracking-tight text-zinc-950 transition-colors group-hover:text-zinc-700 sm:text-lg">
                    {title}
                </h2>
                <p className="mt-1.5 min-h-[3.5rem] text-[13px] leading-5 text-zinc-600">
                    {description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 pb-3" aria-label="Công nghệ sử dụng">
                    {displayedStack.map((technology) => (
                        <span key={technology.name} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-600">
                            <Image src={technology.iconSrc} alt="" width={14} height={14} className="size-3.5 object-contain" />
                            {technology.name}
                        </span>
                    ))}
                </div>
                <div className="mt-auto flex justify-end border-t border-zinc-100 pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-2 text-[11px] font-semibold text-white transition-colors group-hover:bg-zinc-700">
                        Xem cách hoạt động
                        <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        />
                    </span>
                </div>
            </div>
        </Link>
    );
}
