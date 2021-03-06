const webpack = require('webpack');
const matter = require('gray-matter');
const stringifyObject = require('stringify-object');
const TerserPlugin = require('terser-webpack-plugin');
const memfs = require('memfs');
const joinPath = require('memory-fs/lib/join');

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

    const { data } = matter(content);

    const code = `
      export const frontMatter = ${stringifyObject(data)}

      export const raw = ${JSON.stringify(content)}

      export default ${JSON.stringify(
        stats.compilation.assets['article.bundle.js'].source()
      )}
    `;

    this.callback(null, code);
  });
};
