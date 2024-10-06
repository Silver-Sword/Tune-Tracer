// next.config.js
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    trailingSlash: true,
    exportPathMap: async function (
      defaultPathMap,
      { dev, dir, outDir, distDir, buildId }
    ) {
      return {
        '/': { page: '/' },
        '/login': { page: '/login' },
        '/signup': { page: '/signup' },
      };
    },
  };

  export default nextConfig;