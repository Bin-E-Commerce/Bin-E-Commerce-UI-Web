// Trang showcase AI Image Optimization; chỉ phối hợp các chương nội dung, không gọi API seller hay thực thi AI job.
import { ShowcaseFeatureHeader } from '../../../components/shared/ShowcaseFeatureHeader';
import { ShowcaseReadingGuide } from '../../../components/shared/ShowcaseReadingGuide';
import { ShowcaseTableOfContents } from '../../../components/shared/ShowcaseTableOfContents';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { AiOptimizationArchitecture } from '../architecture/AiOptimizationArchitecture';
import { AiOptimizationLogicOverview } from '../logic/AiOptimizationLogicOverview';
import { AiOptimizationRequestOverview } from './AiOptimizationRequestOverview';
import { aiOptimizationTableOfContents } from '../../constants/ai-optimization-table-of-contents.constant';

// Ghép layout giống Recommendation: hero chung, TOC responsive, request overview, kiến trúc rồi logic theo thứ tự đọc.
export function AiOptimizationShowcase() {
    return (
        <div className="bg-zinc-50 text-zinc-950">
            <div className="w-full min-w-0 px-4 sm:px-6 xl:pr-8 xl:pl-[max(2rem,calc(50vw_-_40rem))] sm:py-10">
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
                    <main
                        id="ai-optimization-page-start"
                        tabIndex={-1}
                        className="min-w-0 w-full max-w-[1280px] justify-self-start space-y-10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:space-y-12"
                    >
                        <ShowcaseFeatureHeader
                            title="Tối ưu ảnh sản phẩm có kiểm duyệt"
                            variant="light"
                            density="compact"
                            showBackLink={false}
                            asideContent={
                                <ShowcaseReadingGuide
                                    ariaLabel="Lộ trình đọc tài liệu AI Image Optimization"
                                    items={[
                                        { href: '#ai-optimization-request-overview', title: 'Luồng request', summary: 'Từ chọn ảnh đến preview được duyệt' },
                                        { href: '#ai-optimization-architecture', title: 'Kiến trúc hệ thống', summary: 'Service, worker và catalog' },
                                        { href: '#ai-optimization-logic', title: 'Logic xử lý ảnh', summary: 'Quyền, trạng thái và rollback' },
                                    ]}
                                />
                            }
                        />
                        <ShowcaseTableOfContents
                            variant="mobile"
                            items={aiOptimizationTableOfContents}
                        />
                        <AiOptimizationRequestOverview />
                        <section
                            id="ai-optimization-docs"
                            tabIndex={-1}
                            className="scroll-mt-24 space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                            aria-label="Tài liệu kiến trúc và logic AI Image Optimization"
                        >
                            <header className="grid gap-2 border-b border-zinc-200 pb-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:items-end sm:gap-6">
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                    Tài liệu chi tiết
                                </h2>
                            </header>
                            <div className="grid gap-4">
                                <ShowcaseDisclosure
                                    id="ai-optimization-architecture"
                                    number="1"
                                    title="Kiến trúc hệ thống"
                                    description="Seller UI gửi yêu cầu nhanh; worker xử lý nền; Product Service là nơi duy nhất áp dụng thay đổi vào catalog."
                                >
                                    <AiOptimizationArchitecture />
                                </ShowcaseDisclosure>
                                <ShowcaseDisclosure
                                    id="ai-optimization-logic"
                                    number="2"
                                    title="Logic xử lý ảnh"
                                    description="State machine, permission theo hành động, ownership và version check phối hợp để preview không trở thành thay đổi ngoài ý muốn."
                                >
                                    <AiOptimizationLogicOverview />
                                </ShowcaseDisclosure>
                            </div>
                        </section>
                    </main>
                    <ShowcaseTableOfContents
                        variant="desktop"
                        items={aiOptimizationTableOfContents}
                    />
                </div>
            </div>
        </div>
    );
}
