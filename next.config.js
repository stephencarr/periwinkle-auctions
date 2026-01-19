/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Configure images if needed (add domains for external images)
    images: {
        remotePatterns: [
            // Add image hosting domains here when needed
        ],
    },
};

module.exports = nextConfig;
