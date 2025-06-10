/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		// The regexes defined here are processed in Rust so the syntax is different from
		// JavaScript `RegExp`s. See https://docs.rs/regex.
	},
	webpack: (config, { isServer }) => {
		// Configure fallbacks for Node.js modules that don't exist in the browser
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				crypto: false,
			};
		}

		// Handle SQL.js wasm files
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
		};

		return config;
	},
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},
			{
				source: "/ingest/decide",
				destination: "https://eu.i.posthog.com/decide",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

export default nextConfig;
