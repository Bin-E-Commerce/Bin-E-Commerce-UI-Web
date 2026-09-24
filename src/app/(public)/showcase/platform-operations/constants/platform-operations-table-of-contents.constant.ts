// Cây mục lục cho chương CI/CD; anchor phản ánh đúng hierarchy của các ShowcaseDisclosure đang render.
import type { ShowcaseTocItem } from '../../types/showcase.types';

// Giữ thứ tự đọc từ overview đến flow, technology stack và service ownership.
export const platformOperationsTableOfContents: ShowcaseTocItem[] = [
    {
        id: 'platform-operations-page-start',
        label: 'Tổng quan',
        children: [
            {
                id: 'platform-operations-request-overview',
                label: 'Luồng release tổng quát',
            },
            { id: 'platform-operations-docs', label: 'Tài liệu chi tiết' },
        ],
    },
    {
        id: 'platform-operations-cicd',
        label: '1 · Quy trình CI/CD',
        children: [
            {
                id: 'platform-operations-flow',
                label: '1.1 · Luồng hoạt động',
                children: [
                    {
                        id: 'platform-operations-ci-flow',
                        label: '1.1.1 · Luồng CI',
                    },
                    {
                        id: 'platform-operations-build-flow',
                        label: '1.1.2 · Luồng Build image',
                    },
                    {
                        id: 'platform-operations-production-deploy-flow',
                        label: '1.1.3 · Luồng Deploy Production',
                    },
                    {
                        id: 'platform-operations-rollout-flow',
                        label: '1.1.4 · Rollout, smoke test và rollback',
                    },
                    {
                        id: 'platform-operations-observability-deploy-flow',
                        label: '1.1.5 · Deploy Observability',
                    },
                    {
                        id: 'platform-operations-frontend-flow',
                        label: '1.1.6 · Frontend/Vercel',
                    },
                    {
                        id: 'platform-operations-data-bootstrap-flow',
                        label: '1.1.7 · Bootstrap Kafka và Keycloak',
                    },
                ],
            },
            {
                id: 'platform-operations-technology',
                label: '1.2 · Công nghệ sử dụng',
            },
        ],
    },
    {
        id: 'platform-operations-production',
        label: '2 · Kiến trúc production và quản lý K3s',
        children: [
            {
                id: 'platform-operations-k3s-use-cases',
                label: '2.1 · K3s giải quyết những bài toán gì?',
            },
            {
                id: 'platform-operations-artifact-access',
                label: '2.2 · Artifact và quyền deploy',
            },
            {
                id: 'platform-operations-oidc-ssm',
                label: '2.3 · AWS OIDC và SSM',
            },
            {
                id: 'platform-operations-k3s-management',
                label: '2.4 · Quản lý workload trên K3s',
                children: [
                    {
                        id: 'platform-operations-k3s-runtime',
                        label: '2.4.1 · K3s và container runtime',
                    },
                    {
                        id: 'platform-operations-k3s-cluster-checks',
                        label: '2.4.2 · Kiểm tra node và cluster',
                    },
                    {
                        id: 'platform-operations-k3s-workloads',
                        label: '2.4.3 · Namespace và workload',
                    },
                    {
                        id: 'platform-operations-k3s-diagnostics',
                        label: '2.4.4 · Logs và diagnostics',
                    },
                    {
                        id: 'platform-operations-k3s-rollout',
                        label: '2.4.5 · Rollout và release',
                    },
                    {
                        id: 'platform-operations-k3s-kustomize',
                        label: '2.4.6 · Apply Kustomize',
                    },
                    {
                        id: 'platform-operations-k3s-rollback',
                        label: '2.4.7 · Rollback',
                    },
                    {
                        id: 'platform-operations-k3s-runtime-debug',
                        label: '2.4.8 · Container runtime nâng cao',
                    },
                    {
                        id: 'platform-operations-k3s-destructive-actions',
                        label: '2.4.9 · Thay đổi và xóa resource',
                    },
                ],
            },
            {
                id: 'platform-operations-namespaces',
                label: '2.5 · Namespace và boundary',
            },
            {
                id: 'platform-operations-edge-tls',
                label: '2.6 · Traefik và TLS',
            },
        ],
    },
];
