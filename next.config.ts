import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: '/auth/callback',
                destination: '/callback',
                permanent: false,
            },
        ];
    },
    turbopack: {
        root: path.resolve(__dirname),
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
