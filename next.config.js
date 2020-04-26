const withOptimizedImages = require('next-optimized-images');
const path = require('path');

const markdownLoader = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
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
};

module.exports = withOptimizedImages(
  markdownLoader({
    pageExtensions: ['js', 'jsx', 'md'],
    exportTrailingSlash: true,
  }),
);
