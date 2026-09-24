// Trình bày đúng các công nghệ đứng sau CI/CD, deploy và observability; không trộn với stack nghiệp vụ của application.
import Image from 'next/image';
import type { ReactNode } from 'react';

import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

interface TechnologyCardProps {
    icon: ReactNode;
    name: string;
    role: string;
}

// Hiển thị logo thương hiệu từ asset local để giao diện không phụ thuộc request runtime tới website bên ngoài.
function TechnologyCard({ icon, name, role }: TechnologyCardProps) {
    return (
        <li className="flex min-h-16 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <span className="flex size-9 shrink-0 items-center justify-center">
                {icon}
            </span>
            <span className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-zinc-950">
                    {name}
                </strong>
                <span className="block truncate text-xs leading-5 text-zinc-500">
                    {role}
                </span>
            </span>
        </li>
    );
}

// Giới thiệu stack vận hành theo đúng ranh giới: kiểm tra source, đóng gói artifact, deploy workload và quan sát production.
export function PlatformOperationsTechnologyStack() {
    return (
        <ShowcaseDisclosure
            id="platform-operations-technology"
            number="1.2"
            title="Công nghệ CI/CD và vận hành"
            description="Các công nghệ biến commit thành artifact bất biến, đưa release vào K3s và cung cấp metrics để kiểm tra production."
        >
            <ul
                className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
                aria-label="Danh sách công nghệ CI/CD và vận hành"
            >
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/github-actions.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="GitHub Actions"
                    role="CI workflow"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/docker.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Docker Buildx"
                    role="Build image"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/aws.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="AWS OIDC + SSM"
                    role="Secure deploy access"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/k3s.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="K3s"
                    role="Kubernetes runtime"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/kubernetes.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Kubernetes + Kustomize"
                    role="Manifest & overlay"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/prometheus.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Prometheus"
                    role="Metrics"
                />
                <TechnologyCard
                    icon={
                        <Image
                            src="/images/feature/tech-stack/grafana.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                        />
                    }
                    name="Grafana"
                    role="Dashboards"
                />
            </ul>
            <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                <strong className="font-semibold text-zinc-950">
                    Artifact và logs:
                </strong>{' '}
                GHCR lưu image theo commit SHA; Trivy và SBOM kiểm tra supply
                chain; Loki và Alloy tập trung log container để Grafana Explore
                tra cứu.
            </p>
        </ShowcaseDisclosure>
    );
}
