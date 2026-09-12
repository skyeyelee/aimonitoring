import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack(config,{webpack}) {
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^(?:@\/lib\/runtime)$|[\\/]lib[\\/]runtime\.ts$/,path.resolve(process.cwd(),'lib/runtime-vercel.ts')));
    return config;
  },
};

export default nextConfig;
