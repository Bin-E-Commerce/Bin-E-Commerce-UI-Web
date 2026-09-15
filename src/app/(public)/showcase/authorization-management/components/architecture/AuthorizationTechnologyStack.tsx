// Tóm tắt technology stack của Authorization Management; card ngắn để người đọc quét nhanh như Recommendation.
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

interface AuthorizationTechnologyCardProps {
    icon: ReactNode;
    name: string;
    role: string;
}

// Dùng cùng nhịp card với Recommendation: logo/icon, tên công nghệ và vai trò trong hệ thống.
function AuthorizationTechnologyCard({ icon, name, role }: AuthorizationTechnologyCardProps) {
    return (
        <li className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center">{icon}</span>
            <span className="min-w-0">
                <span className="block text-xs font-semibold text-zinc-950">{name}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">{role}</span>
            </span>
        </li>
    );
}

// Liên kết identity, policy, cache và navigation với đúng các boundary được mô tả trong flow 1.1.
export function AuthorizationTechnologyStack() {
    return (
        <ShowcaseDisclosure
            id="authorization-technology-stack"
            number="1.2"
            title="Công nghệ sử dụng"
            description="Các thành phần phục vụ xác thực, kiểm tra quyền, lưu policy, cache access profile và hiển thị navigation theo quyền hiệu lực."
        >
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                <AuthorizationTechnologyCard icon={<Image src="/images/feature/tech-stack/nextjs.svg" alt="" width={32} height={32} className="size-8 object-contain" />} name="Next.js" role="Admin UI" />
                <AuthorizationTechnologyCard icon={<Image src="/images/feature/tech-stack/nestjs.svg" alt="" width={32} height={32} className="size-8 object-contain" />} name="NestJS" role="Auth API" />
                <AuthorizationTechnologyCard icon={<Image src="/images/feature/tech-stack/postgresql.svg" alt="" width={32} height={32} className="size-8 object-contain" />} name="PostgreSQL" role="Policy & user data" />
                <AuthorizationTechnologyCard icon={<Image src="/images/feature/tech-stack/redis.svg" alt="" width={32} height={32} className="size-8 object-contain" />} name="Redis" role="Access cache" />
                <AuthorizationTechnologyCard icon={<Image src="/images/feature/tech-stack/keycloak.svg" alt="" width={32} height={32} className="size-8 object-contain" />} name="Keycloak" role="Token issuer · RS256" />
                <AuthorizationTechnologyCard icon={<Image src="/images/feature/tech-stack/jwt.svg" alt="" width={32} height={32} className="size-8 object-contain" />} name="JWT" role="Access token · RS256" />
            </ul>
        </ShowcaseDisclosure>
    );
}
