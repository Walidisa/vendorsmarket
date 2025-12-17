import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.9.7.113", "127.0.0.1"],
  turbopack: {
    root: __dirname, // force workspace root to avoid Turbopack lockfile warning
  },
};

export default nextConfig;
