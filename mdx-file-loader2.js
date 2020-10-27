const { getOptions } = require('loader-utils');
const mdx = require('@mdx-js/mdx');
const { transformAsync } = require('@babel/core');
const presetEnv = require('@babel/preset-env');
const presetReact = require('@babel/preset-react');
const pluginBrowser = require('next-mdx-remote/babel-plugin-mdx-browser');

module.exports = async function MDXFileLoader(content) {
  const callback = this.async();
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath,
  });

  let result;

  try {
    result = await mdx(content, { ...options, skipExport: true });
  } catch (err) {
    return callback(err);
  }

  const transpiled = await transformAsync(result, {
    presets: [presetReact, presetEnv],
    plugins: [pluginBrowser],
    configFile: false,
  });

  const exportedCode = `
    module.exports = "const MyComp = " + require('./MyComp.jsx') + ";";
  `;

  return callback(null, content.includes('MyComp') ? exportedCode : 'module.exports = ""');
};
