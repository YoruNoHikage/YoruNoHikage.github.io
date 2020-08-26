const matter = require('gray-matter');

module.exports = async function (src) {
  const callback = this.async();
  const { content, data } = matter(src);
  const code = `export const data = ${JSON.stringify(data)}
${content}`;
  return callback(null, code);
};
