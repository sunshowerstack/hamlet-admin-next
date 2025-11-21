/** @type {import('next').NextConfig} */
import path from 'path';

const config = {
  // 优化编译性能
  experimental: {
    // 启用并行编译
    parallelServerCompiles: true,
    // 启用并行构建
    parallelServerBuildTraces: true,
  },
  // 静态导出模式 export：完全静态html
  output: 'standalone',

  reactStrictMode: false,

  // // 优化模块解析
  // webpack: (config, { dev, isServer }) => {
  //   // 开发模式下优化
  //   if (dev) {
  //     config.watchOptions = {
  //       poll: 1000,
  //       aggregateTimeout: 300,
  //     };
  //   }

  //   // 优化模块解析
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     '@': path.resolve(__dirname, 'src'),
  //   };

  //   return config;
  // },

  // // 启用压缩
  // compress: true,

  // 优化图片
  images: {
    // formats: ['image/webp', 'image/avif'],
    domains: [
      'hamlet-test.oss-cn-hangzhou.aliyuncs.com', // 图片的来源域名
      // 可以添加其他需要允许的图片域名
    ],
  },
};

export default config;
