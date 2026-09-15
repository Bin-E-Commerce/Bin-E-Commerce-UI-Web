// Tóm tắt stack có thật trong Recommendation; vai trò chỉ là nhãn ngắn, không thay thế sơ đồ luồng chi tiết.
import Image from 'next/image';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

// Giới thiệu vai trò chung của stack rồi gom logo vào lưới responsive để dễ nhận diện từng công nghệ.
export function RecommendationTechnologyStack() {
    return (
        <RecommendationDisclosure
            id="recommendation-technology-stack"
            number="1.2"
            title="Công nghệ sử dụng"
            description="Các thành phần phục vụ giao diện, API gợi ý, lưu trữ, tìm kiếm vector và xử lý sự kiện/AI."
            level={3}
            variant="section"
        >
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/nextjs.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            Next.js
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            Web storefront
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/nestjs.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            NestJS
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            Recommendation API
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/postgresql.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            PostgreSQL
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            Catalog &amp; profile
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/redis.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            Redis
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            Cache &amp; session
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/apache-kafka.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            Apache Kafka
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            Event stream
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/qdrant.svg"
                            alt=""
                            width={40}
                            height={24}
                            className="h-auto max-h-6 w-10 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            Qdrant
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            Vector search
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/fastapi.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            FastAPI
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            AI prediction API
                        </span>
                    </span>
                </li>

                <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center">
                        <Image
                            src="/images/feature/tech-stack/python.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-950">
                            Python
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                            AI &amp; embedding worker
                        </span>
                    </span>
                </li>
            </ul>
        </RecommendationDisclosure>
    );
}
