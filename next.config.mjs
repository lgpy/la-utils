/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		// The regexes defined here are processed in Rust so the syntax is different from
		// JavaScript `RegExp`s. See https://docs.rs/regex.
	},
	async rewrites() {
		return [
			{
				source: "/i/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/i/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},
			{
				source: "/i/decide",
				destination: "https://eu.i.posthog.com/decide",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

export default nextConfig;
