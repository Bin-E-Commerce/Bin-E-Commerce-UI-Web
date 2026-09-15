// Route công khai làm hub cho showcase kỹ thuật; nội dung tĩnh được render phía server để tải nhanh.
import type { Metadata } from 'next';
import { ShowcaseLanding } from './components/orchestration/ShowcaseLanding';

export const metadata: Metadata = {
    title: 'Kiến trúc & công nghệ | Bin E-Commerce',
    description:
        'Khám phá kiến trúc, luồng xử lý và logic phía sau các chức năng nổi bật của Bin E-Commerce.',
};

// Giữ page route mỏng để hub có thể phát triển thành nhiều feature mà không kéo logic vào routing layer.
export default function ShowcasePage() {
    return <ShowcaseLanding />;
}
