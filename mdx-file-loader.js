const webpack = require('webpack');
const matter = require('gray-matter');
const stringifyObject = require('stringify-object');
const TerserPlugin = require('terser-webpack-plugin');
const memfs = require('memfs');
const joinPath = require('memory-fs/lib/join');
const path = require('path');

const fs = Object.create(memfs);
fs.join = joinPath;

module.exports = async function MDXFileLoader(content, map, meta) {
  this.async();

  this.addDependency(this.resourcePath);

  const compiler = webpack({
    mode: 'production',
    entry: this.resourcePath,
    output: {
      filename: 'article.bundle.js',
      libraryTarget: 'var',
      library: 'MDXContent',
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    resolve: {
      extensions: ['.md', '.mdx'],
      alias: {
        fs: 'memfs',
      },
    },
    module: {
      rules: [
        {
          test: /\.mdx?$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-react'],
                configFile: false,
              },
            },
            '@mdx-js/loader',
            './fm-loader',
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-react'],
                configFile: false,
              },
            },
          ],
        },
      ],
    },
    externals: {
      react: 'React',
      '@mdx-js/react': 'mdxReact',
    },
  });

  compiler.outputFileSystem = fs;

  compiler.run((err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(
      stats.toString({
        // chunks: false,
        colors: true,
      })
    );

    try {
      const { data } = matter(content);

      const [, firstImageAlt, firstImage] =
        content.match(/!\[([^\]]*)\]\(([^ )]+)(?: ?"[^"]+")?\)/i) || [];

      const ogImage = data.ogImage || firstImage || undefined;
      const ogImageAlt = data.ogImageAlt || firstImageAlt || undefined;

      // TODO: why does this.resolve isn't working??? The hack with require is ugly as f

      // re-assigning resolved values to frontmatter
      data.ogImage =
        ogImage && !ogImage.startsWith('http')
          ? `require("${path.resolve(this.context, ogImage)}")`
          : ogImage;
      data.ogImageAlt = ogImage ? ogImageAlt : undefined;

      if (!data.ogImage) delete data.ogImage;
      if (!data.ogImageAlt) delete data.ogImageAlt;

      const finalFrontMatter = stringifyObject(data).replace(
        /'(require\([^)]+\))'/,
        '$1.default'
      );

      const code = `
        export const frontMatter = ${finalFrontMatter}

        export default ${JSON.stringify(
          stats.compilation.assets['article.bundle.js'].source()
        )}
      `;

      this.callback(null, code);
    } catch (callbackErr) {
      this.callback(callbackErr);
    }
  });
};
