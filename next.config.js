const withOptimizedImages = require('next-optimized-images');
const path = require('path');

const withVideos = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const { isServer } = options;

    const prefix = nextConfig.assetPrefix || '';
    const directory = nextConfig.assetDirectory || 'static';

    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      use: [
        {
          loader: require.resolve('file-loader'),
          options: {
            publicPath: `${prefix}/_next/${directory}/videos/`,
            outputPath: `${isServer ? '../' : ''}${directory}/videos/`,
            name: '[name]-[hash].[ext]',
          },
        },
      ],
    });

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

const markdownLoader = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.md$/,
      use: [options.defaultLoaders.babel, path.join(__dirname, './markdown-loader')],
    }, {
      test: /\.mdx$/,
      use: [options.defaultLoaders.babel, '@mdx-js/loader', path.join(__dirname, './fm-loader')],
    });

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

module.exports = withVideos(withOptimizedImages(
  markdownLoader({
    i18n: {
      locales: ['en', 'fr', 'ja', 'br'],
      defaultLocale: 'en',
      localeDetection: false,
    },

    // doesn't seem to work for now
    // async redirects() {
    //   return [
    //     {
    //       source: '/en',
    //       destination: '/',
    //       permanent: true,
    //     },
    //     {
    //       source: '/en/:slug*',
    //       destination: '/:slug*',
    //       permanent: true,
    //     },
    //   ];
    // },

    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    trailingSlash: true,

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
));
