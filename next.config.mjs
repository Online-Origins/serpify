/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        REFRESH_TOKEN: process.env.REFRESH_TOKEN,
        DEVELOPER_TOKEN: process.env.DEVELOPER_TOKEN,
        CUSTOMER_ID: process.env.CUSTOMER_ID,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    }
};

export default nextConfig;
