const { withPlugins } = require('next-compose-plugins');

const markdownLoader = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: ['./mdx-file-loader'],
    });

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

const mediaLoader = (nextConfig = {}) => ({
  ...nextConfig,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(svg|png|jpe?g|gif|mp4|webm)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[hash].[ext]',
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

module.exports = withPlugins([[mediaLoader], [markdownLoader]], {
  target: 'serverless',

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

  webpack(config, { dev, isServer }) {
    config.node = { fs: 'empty' };

    if (!dev && isServer) {
      const originalEntry = config.entry;

      config.entry = async () => {
        const entries = { ...(await originalEntry()) };

        // These scripts can import components from the app and use ES modules
        entries['./scripts/generate-sitemap.js'] =
          './scripts/generate-sitemap.js';
        // entries['./scripts/build-rss.js'] = './scripts/build-rss.js';

        return entries;
      };
    }

    return config;
  },
});
