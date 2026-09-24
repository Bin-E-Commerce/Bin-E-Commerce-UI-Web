// Trang tổng hợp chương CI/CD của Platform Operations; chỉ ghép content static và không sở hữu runtime integration.
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { ShowcaseFeatureHeader } from '../../../components/shared/ShowcaseFeatureHeader';
import { ShowcaseReadingGuide } from '../../../components/shared/ShowcaseReadingGuide';
import { ShowcaseTableOfContents } from '../../../components/shared/ShowcaseTableOfContents';
import { PlatformOperationsActivityFlow } from '../architecture/PlatformOperationsActivityFlow';
import { PlatformOperationsProductionArchitecture } from '../architecture/PlatformOperationsProductionArchitecture';
import { PlatformOperationsTechnologyStack } from '../architecture/PlatformOperationsTechnologyStack';
import { PlatformOperationsRequestOverview } from './PlatformOperationsRequestOverview';
import { platformOperationsTableOfContents } from '../../constants/platform-operations-table-of-contents.constant';

// Ghép hero, TOC và chương CI/CD theo thứ tự đọc; nội dung chi tiết được sở hữu bởi component architecture tương ứng.
export function PlatformOperationsShowcase() {
    return (
        <div className="bg-zinc-50 text-zinc-950">
            <div className="w-full min-w-0 px-4 sm:px-6 xl:pr-8 xl:pl-[max(2rem,calc(50vw_-_40rem))] sm:py-10">
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
                    <main
                        id="platform-operations-page-start"
                        tabIndex={-1}
                        className="min-w-0 w-full max-w-[1280px] justify-self-start space-y-10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:space-y-12"
                    >
                        <ShowcaseFeatureHeader
                            category="PLATFORM OPERATIONS"
                            title="CI/CD và vận hành production"
                            variant="light"
                            density="compact"
                            showBackLink={false}
                            asideContent={
                                <ShowcaseReadingGuide
                                    ariaLabel="Lộ trình đọc tài liệu CI/CD và vận hành production"
                                    items={[
                                        {
                                            href: '#platform-operations-request-overview',
                                            title: 'Luồng release',
                                            summary:
                                                'Từ Pull Request đến verification',
                                        },
                                        {
                                            href: '#platform-operations-cicd',
                                            title: 'Quy trình CI/CD',
                                            summary: 'Các flow của release',
                                        },
                                        {
                                            href: '#platform-operations-technology',
                                            title: 'Công nghệ sử dụng',
                                            summary: 'Công cụ theo boundary',
                                        },
                                        {
                                            href: '#platform-operations-production',
                                            title: 'Kiến trúc production',
                                            summary: 'K3s và runbook quản trị',
                                        },
                                    ]}
                                />
                            }
                        />

                        <ShowcaseTableOfContents
                            variant="mobile"
                            items={platformOperationsTableOfContents}
                        />
                        <PlatformOperationsRequestOverview />

                        <section
                            id="platform-operations-docs"
                            tabIndex={-1}
                            className="scroll-mt-24 space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                            aria-label="Tài liệu CI/CD và các flow vận hành"
                        >
                            <header className="grid gap-2 border-b border-zinc-200 pb-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:items-end sm:gap-6">
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                    Tài liệu chi tiết
                                </h2>
                                <p className="text-sm leading-6 text-zinc-600">
                                    Đọc theo thứ tự: flow tạo release, công nghệ
                                    đứng sau pipeline và các service nhận tác
                                    động khi deploy.
                                </p>
                            </header>

                            <div className="grid gap-4">
                                <ShowcaseDisclosure
                                    id="platform-operations-cicd"
                                    number="1"
                                    title="Quy trình CI/CD"
                                    description="Tách từng flow thực tế để thấy source, artifact, quyền deploy, runtime verification và các boundary không được gộp nhầm."
                                >
                                    <div className="space-y-3">
                                        <PlatformOperationsActivityFlow />
                                        <PlatformOperationsTechnologyStack />
                                    </div>
                                </ShowcaseDisclosure>
                                <PlatformOperationsProductionArchitecture />
                            </div>
                        </section>
                    </main>

                    <ShowcaseTableOfContents
                        variant="desktop"
                        items={platformOperationsTableOfContents}
                    />
                </div>
            </div>
        </div>
    );
}
