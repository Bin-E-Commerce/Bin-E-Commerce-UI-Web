// Trang tổng hợp kiến trúc và logic Recommendation; nội dung chi tiết do từng component chuyên trách sở hữu.
import { ShowcaseFeatureHeader } from '../../../components/shared/ShowcaseFeatureHeader';
import { ShowcaseTableOfContents } from '../../../components/shared/ShowcaseTableOfContents';
import { RecommendationArchitecture } from '../architecture/RecommendationArchitecture';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationLogicOverview } from '../ranking/RecommendationLogicOverview';
import { RecommendationRequestOverview } from './RecommendationRequestOverview';
import { RecommendationReadingGuide } from '../shared/RecommendationReadingGuide';
import { RecommendationReliability } from '../ranking/RecommendationReliability';
import { RecommendationScoring } from '../ranking/RecommendationScoring';
import { RecommendationAiEnhancedRanking } from '../ranking/RecommendationAiEnhancedRanking';
import { RecommendationSignals } from '../ranking/RecommendationSignals';
import { recommendationTableOfContents } from '../../constants/recommendation-table-of-contents.constant';

// Ghép hero và các chương tài liệu; nội dung công nghệ và service được đặt bên trong chương kiến trúc để giữ đúng phân cấp.
export function RecommendationShowcase() {
    // Khi mục lục desktop xuất hiện, tăng lề trái theo tâm header rộng 80rem để mép nội dung thẳng với logo, còn mục lục vẫn neo bên phải.
    return (
        <div className="bg-zinc-50 text-zinc-950">
            <div className="w-full min-w-0 px-4 sm:px-6 xl:pr-8 xl:pl-[max(2rem,calc(50vw_-_40rem))] sm:py-10">
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
                    <main
                        id="recommendation-page-start"
                        tabIndex={-1}
                        className="min-w-0 w-full max-w-[1280px] justify-self-start space-y-10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:space-y-12"
                    >
                        <ShowcaseFeatureHeader
                            title="Hệ thống gợi ý sản phẩm"
                            variant="light"
                            density="compact"
                            showBackLink={false}
                            asideContent={<RecommendationReadingGuide />}
                        />

                        <ShowcaseTableOfContents variant="mobile" items={recommendationTableOfContents} />

                        <RecommendationRequestOverview />

                        <section
                            id="recommendation-docs"
                            tabIndex={-1}
                            className="scroll-mt-24 space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                            aria-label="Tài liệu kiến trúc và logic Recommendation"
                        >
                            <header className="grid gap-2 border-b border-zinc-200 pb-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:items-end sm:gap-6">
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                    Tài liệu chi tiết
                                </h2>
                            </header>

                            <div className="grid gap-4">
                                <RecommendationDisclosure
                                    id="recommendation-architecture"
                                    number="1"
                                    title="Kiến trúc hệ thống"
                                    description="Lần theo request và event để biết thành phần nào xử lý, dữ liệu được lưu ở đâu và Kafka cập nhật gì ở nền; qua đó thấy ranh giới giữa các service."
                                    level={2}
                                    variant="section"
                                >
                                    <RecommendationArchitecture />
                                </RecommendationDisclosure>

                                <RecommendationDisclosure
                                    id="recommendation-logic"
                                    number="2"
                                    title="Logic tạo gợi ý"
                                    description="Đi từ hồ sơ và phiên truy cập, qua tạo ứng viên, chấm Standard/AI, đến fallback và attribution; từng quyết định, giới hạn và trade-off được trình bày bên dưới."
                                    level={2}
                                    variant="section"
                                >
                                    <div className="space-y-3">
                                        <RecommendationLogicOverview />

                                        <RecommendationDisclosure
                                            id="recommendation-signal-logic"
                                            number="2.1"
                                            title="Hệ thống lấy tín hiệu và tìm sản phẩm từ đâu?"
                                            description="Theo luồng từ hồ sơ/phiên đến danh sách ứng viên rồi xếp hạng; xem từng nguồn dùng để làm gì, cách tìm sản phẩm và đánh đổi của các giới hạn."
                                            variant="section"
                                        >
                                            <RecommendationSignals />
                                        </RecommendationDisclosure>
                                        <RecommendationDisclosure
                                            id="recommendation-ranking-logic"
                                            number="2.2"
                                            title="Vì sao sản phẩm này đứng trước sản phẩm kia?"
                                            description="Từ dữ liệu đầu vào, hệ thống tính 8 điểm thế nào, nhân trọng số ra sao và AI pha vào Standard theo công thức nào?"
                                            variant="section"
                                        >
                                            <RecommendationScoring />
                                        </RecommendationDisclosure>
                                        <RecommendationAiEnhancedRanking />
                                        <RecommendationDisclosure
                                            id="recommendation-reliability-logic"
                                            number="2.3"
                                            title="Khi thiếu dữ liệu hoặc có lỗi, hệ thống làm gì?"
                                            description="Nguồn lỗi thì bỏ riêng, AI lỗi thì dùng Standard; xem tiếp giới hạn danh sách và cách event cập nhật cho lượt gợi ý sau."
                                            variant="section"
                                        >
                                            <RecommendationReliability />
                                        </RecommendationDisclosure>
                                    </div>
                                </RecommendationDisclosure>
                            </div>
                        </section>
                    </main>

                    <ShowcaseTableOfContents variant="desktop" items={recommendationTableOfContents} />
                </div>
            </div>
        </div>
    );
}
