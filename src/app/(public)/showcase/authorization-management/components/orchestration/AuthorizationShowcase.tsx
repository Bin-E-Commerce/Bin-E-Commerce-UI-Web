// Trang showcase Authorization Management; phối hợp các phần request, kiến trúc và logic mà không chứa policy runtime.
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { ShowcaseFeatureHeader } from '../../../components/shared/ShowcaseFeatureHeader';
import { ShowcaseReadingGuide } from '../../../components/shared/ShowcaseReadingGuide';
import { ShowcaseTableOfContents } from '../../../components/shared/ShowcaseTableOfContents';
import { AuthorizationArchitecture } from '../architecture/AuthorizationArchitecture';
import { AuthorizationLogicOverview } from '../logic/AuthorizationLogicOverview';
import { AuthorizationRequestHero } from './AuthorizationRequestHero';
import { authorizationTableOfContents } from '../../constants/authorization-table-of-contents.constant';

// Dùng cùng skeleton với Recommendation: hero sáng, TOC bên phải, request overview rồi tài liệu mở theo hai chương lớn.
export function AuthorizationShowcase() {
    return (
        <div className="bg-zinc-50 text-zinc-950">
            <div className="w-full min-w-0 px-4 sm:px-6 xl:pr-8 xl:pl-[max(2rem,calc(50vw_-_40rem))] sm:py-10">
                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
                    <main id="authorization-page-start" tabIndex={-1} className="min-w-0 w-full max-w-[1280px] justify-self-start space-y-10 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:space-y-12">
                        <ShowcaseFeatureHeader category="AUTHORIZATION MANAGEMENT" title="Phân quyền rõ ràng, kiểm soát đến từng tài nguyên" variant="light" density="compact" asideContent={<ShowcaseReadingGuide ariaLabel="Lộ trình đọc tài liệu Authorization Management" items={[{ href: '#authorization-request-overview', title: 'Luồng request', summary: 'Từ identity đến quyết định' }, { href: '#authorization-architecture', title: 'Kiến trúc hệ thống', summary: 'Gateway, policy và access profile' }, { href: '#authorization-logic', title: 'Logic xử lý', summary: 'Năm điểm kiểm soát chính' }]} />} />
                        <ShowcaseTableOfContents variant="mobile" items={authorizationTableOfContents} />
                        <AuthorizationRequestHero />
                        <section id="authorization-docs" tabIndex={-1} className="scroll-mt-24 space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300" aria-label="Tài liệu kiến trúc và logic Authorization Management">
                            <header className="grid gap-2 border-b border-zinc-200 pb-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:items-end sm:gap-6"><h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">Tài liệu chi tiết</h2><p className="text-sm leading-6 text-zinc-600">Đi từ nơi policy được resolve đến cách quyền được enforce, cache và truy vết.</p></header>
                            <div className="grid gap-4">
                                <ShowcaseDisclosure id="authorization-architecture" number="1" title="Kiến trúc hệ thống" description="Auth Service sở hữu policy; Gateway truyền context đã xác thực; downstream service kiểm tra ownership trước mutation."><AuthorizationArchitecture /></ShowcaseDisclosure>
                                <ShowcaseDisclosure id="authorization-logic" number="2" title="Logic xử lý" description="Năm điểm kiểm soát giải thích cách request được cấp quyền, policy được cập nhật và access profile được làm mới."><AuthorizationLogicOverview /></ShowcaseDisclosure>
                            </div>
                        </section>
                    </main>
                    <ShowcaseTableOfContents variant="desktop" items={authorizationTableOfContents} />
                </div>
            </div>
        </div>
    );
}
