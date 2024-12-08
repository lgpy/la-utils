/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // The regexes defined here are processed in Rust so the syntax is different from
    // JavaScript `RegExp`s. See https://docs.rs/regex.
  }
};
export default nextConfig