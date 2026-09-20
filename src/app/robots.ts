// File này khai báo quy tắc crawl cho bot và trỏ đến sitemap public của website.
// Các khu vực tài khoản, seller, admin và callback không phải nội dung SEO nên
// được chặn để tránh index màn hình riêng tư hoặc URL tạm thời.

import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/config/site.config';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/seller/',
                    '/profile/',
                    '/checkout',
                    '/login',
                    '/register',
                    '/callback',
                    '/auth/',
                    '/api/',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
