import BundleAnalyzer from  '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {}
 
const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
 
export default withBundleAnalyzer(nextConfig)
