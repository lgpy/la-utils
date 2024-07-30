/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
            // This will match all routes
            source: '/(.*)',
            headers: [
                {
                key: 'Access-Control-Allow-Origin',
                value: 'https://la-utils.vercel.app', // Allow only this origin
                },
                {
                key: 'Access-Control-Allow-Methods',
                value: 'GET, POST, PUT, DELETE, OPTIONS',
                },
                {
                key: 'Access-Control-Allow-Headers',
                value: 'Content-Type, Authorization',
                },
            ],
            },
        ];
    },
};
export default nextConfig