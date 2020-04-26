const matter = require('gray-matter');
const { Remarkable } = require('remarkable');
const HTMLLoader = require('html-loader');
const hljs = require('highlight.js');

const md = new Remarkable('full', {
  html: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
        console.warn(err);
      }
    }
    else if (lang) {
      console.warn(lang, 'is an unknown language');
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {
      console.warn(err);
    }

    return ''; // use external default escaping
  },
});

module.exports = function markdownLoader(content) {
  const callback = this.async();

  const parsed = matter(content);

  const resolved = {
    content: HTMLLoader(md.render(parsed.content)),
    data: parsed.data,
  };

  callback(
    null,
    `module.exports = {content: ${
      resolved.content.match(/(".+")/)[0]
    }, data: ${JSON.stringify(resolved.data)}};`
  );
};
