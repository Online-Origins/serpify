/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        REFRESH_TOKEN: process.env.REFRESH_TOKEN,
        DEVELOPER_TOKEN: process.env.DEVELOPER_TOKEN,
        CUSTOMER_ID: process.env.CUSTOMER_ID,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
      },
};

export default nextConfig;