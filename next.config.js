const withOptimizedImages = require('next-optimized-images');
const path = require('path');

const markdownLoader = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.md$/,
      use: {
        loader: path.resolve('./markdown-loader'),
        options: {},
      },
    });

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

module.exports = withOptimizedImages(
  markdownLoader({
    pageExtensions: ['js', 'jsx', 'md'],
    exportTrailingSlash: true,

    target: 'serverless',
    webpack(config, { dev, isServer }) {
      if (!dev && isServer) {
        const originalEntry = config.entry;

        config.entry = async () => {
          const entries = { ...(await originalEntry()) };

          // These scripts can import components from the app and use ES modules
          entries['./scripts/generate-sitemap.js'] = './scripts/generate-sitemap.js';
          // entries['./scripts/build-rss.js'] = './scripts/build-rss.js';

          return entries;
        };
      }

      return config;
    },
  }),
);
