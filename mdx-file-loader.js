const loaderUtils = require('loader-utils');

const markdownImageReferencesRE = /(!\[[^\]]*\]\((?!(?:https?:)?\/\/)[^)'"]+(?:\s+["'][^"']*["'])?\))/g;
const imagePathRE = /^(!\[[^\]]*\]\()((?!(?:https?:)?\/\/)[^)"']+)(\s+["'][^"']*["'])?(\))$/;

const requireReferencesRE = /(require\((?:["'][^"']+["'])?\))/g;
const requiredFilePathRE = /require\(["']([^"']+)["']?\)/;

// converts the image path in the markdowned-image syntax into a require statement, or stringify the given content
function requirifyImageReference(markdownImageReference) {
  const [, mdImageStart, mdImagePath, optionalMdTitle, mdImageEnd] =
    imagePathRE.exec(markdownImageReference) || [];
  if (!mdImagePath) {
    return JSON.stringify(markdownImageReference);
  } else {
    const imageRequest = loaderUtils.stringifyRequest(
      this,
      loaderUtils.urlToRequest(mdImagePath)
    );
    const mdImageTitleAndEnd = optionalMdTitle
      ? JSON.stringify(optionalMdTitle + mdImageEnd)
      : JSON.stringify(mdImageEnd);

    return `${JSON.stringify(
      mdImageStart
    )} + require(${imageRequest}) + ${mdImageTitleAndEnd}`;
  }
}

// exports the MarkdownImageLoader loader function
module.exports = function MDXImageLoader(markdownContent = '') {
  // the outputs of this loader can be cached
  this.cacheable && this.cacheable();

  return `
module.exports = [
${markdownContent
  .split(requireReferencesRE)
  .map((text) => {
    // if (text.startsWith('require')) {
    if (text.startsWith("require('./")) {
      // TODO: prevent matching inside code blocks
      const [, filepath] = text.match(requiredFilePathRE) || [];
      const fileRequest = loaderUtils.stringifyRequest(
        this,
        loaderUtils.urlToRequest(filepath)
      );

      return `${JSON.stringify(
        "'"
      )} + require(${fileRequest}) + ${JSON.stringify("'")}`;
    }

    return text
      .split(markdownImageReferencesRE)
      .map(requirifyImageReference)
      .join(',\n');
  })
  .join(',\n')}
].join('')`;
};

// exports function and regexp helpers for testability purposes
module.exports.helpers = {
  markdownImageReferencesRE,
  imagePathRE,
  requirifyImageReference,
};
